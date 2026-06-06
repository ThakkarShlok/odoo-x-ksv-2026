const prisma = require('../utils/prismaClient')
const { generatePONumber } = require('../utils/numberGenerator')
const { logActivity } = require('../utils/activityLogger')

async function listPOs(req, res, next) {
  try {
    const where = {}

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      })

      if (!vendor) {
        return res.json({ pos: [] })
      }

      where.quotation = {
        vendorId: vendor.id
      }
    }

    const pos = await prisma.purchaseOrder.findMany({
      where,
      include: {
        quotation: {
          include: {
            vendor: true,
            rfq: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })

    res.json({ pos })
  } catch (err) {
    next(err)
  }
}

async function getPO(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid PO ID' })
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            vendor: true,
            items: true,
            rfq: true
          }
        }
      }
    })

    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' })
    }

    res.json({ po })
  } catch (err) {
    next(err)
  }
}

async function createPOFromQuotation(req, res, next) {
  try {
    const quotationId = parseInt(req.params.quotationId, 10)
    if (isNaN(quotationId)) {
      return res.status(400).json({ message: 'Invalid quotation ID' })
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId }
    })

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' })
    }

    if (quotation.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Quotation must be in APPROVED status to generate a PO' })
    }

    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { quotationId }
    })

    if (existingPO) {
      return res.status(409).json({ message: 'A Purchase Order already exists for this quotation' })
    }

    const poNumber = await generatePONumber()

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        quotationId,
        totalAmount: quotation.totalAmount,
        status: 'ISSUED'
      }
    })

    await logActivity(req.user.id, 'CREATE_PO', 'PurchaseOrder', po.id, { poNumber: po.poNumber })

    res.status(201).json({ po })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listPOs,
  getPO,
  createPOFromQuotation
}
