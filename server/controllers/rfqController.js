const prisma = require('../utils/prismaClient')
const { generateRFQNumber } = require('../utils/numberGenerator')
const { logActivity } = require('../utils/activityLogger')

async function listRFQs(req, res, next) {
  try {
    const { status } = req.query
    const where = {}

    if (status) {
      where.status = status
    }

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      })

      if (!vendor) {
        return res.json({ rfqs: [] })
      }

      where.vendors = {
        some: {
          vendorId: vendor.id
        }
      }
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    res.json({ rfqs })
  } catch (err) {
    next(err)
  }
}

async function getRFQ(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid RFQ ID' })
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        items: true,
        vendors: {
          include: {
            vendor: true
          }
        },
        quotations: {
          include: {
            vendor: true
          }
        }
      }
    })

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' })
    }

    res.json({ rfq })
  } catch (err) {
    next(err)
  }
}

async function createRFQ(req, res, next) {
  try {
    const { title, description, deadline, items, vendorIds } = req.body

    const rfqNumber = await generateRFQNumber()

    const rfq = await prisma.rFQ.create({
      data: {
        rfqNumber,
        title,
        description,
        deadline: new Date(deadline),
        status: 'DRAFT',
        createdById: req.user.id,
        items: {
          create: items.map(item => ({
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || 'pcs'
          }))
        },
        vendors: {
          create: vendorIds.map(vId => ({
            vendorId: vId
          }))
        }
      },
      include: {
        items: true,
        vendors: true
      }
    })

    await logActivity(req.user.id, 'CREATE', 'RFQ', rfq.id, { rfqNumber: rfq.rfqNumber })

    res.status(201).json({ rfq })
  } catch (err) {
    next(err)
  }
}

async function publishRFQ(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid RFQ ID' })
    }

    const existing = await prisma.rFQ.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'RFQ not found' })
    }

    const rfq = await prisma.rFQ.update({
      where: { id },
      data: { status: 'PUBLISHED' }
    })

    await logActivity(req.user.id, 'PUBLISH', 'RFQ', rfq.id, { status: 'PUBLISHED' })

    res.json({ rfq })
  } catch (err) {
    next(err)
  }
}

async function closeRFQ(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid RFQ ID' })
    }

    const existing = await prisma.rFQ.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'RFQ not found' })
    }

    const rfq = await prisma.rFQ.update({
      where: { id },
      data: { status: 'CLOSED' }
    })

    await logActivity(req.user.id, 'CLOSE', 'RFQ', rfq.id, { status: 'CLOSED' })

    res.json({ rfq })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listRFQs,
  getRFQ,
  createRFQ,
  publishRFQ,
  closeRFQ
}
