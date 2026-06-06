const prisma = require('../utils/prismaClient')
const { generateQuotationNumber } = require('../utils/numberGenerator')
const { logActivity } = require('../utils/activityLogger')

async function listQuotations(req, res, next) {
  try {
    const { rfqId, status } = req.query
    const where = {}

    if (rfqId) {
      where.rfqId = parseInt(rfqId, 10)
    }

    if (status) {
      where.status = status
    }

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      })

      if (!vendor) {
        return res.json({ quotations: [] })
      }

      where.vendorId = vendor.id
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        vendor: true,
        items: true,
        rfq: true
      },
      orderBy: { submittedAt: 'desc' }
    })

    res.json({ quotations })
  } catch (err) {
    next(err)
  }
}

async function getQuotationsForRFQ(req, res, next) {
  try {
    const rfqId = parseInt(req.params.rfqId, 10)
    if (isNaN(rfqId)) {
      return res.status(400).json({ message: 'Invalid RFQ ID' })
    }

    const quotations = await prisma.quotation.findMany({
      where: { rfqId },
      include: {
        vendor: true,
        items: true
      },
      orderBy: { totalAmount: 'asc' }
    })

    res.json({ quotations })
  } catch (err) {
    next(err)
  }
}

async function createQuotation(req, res, next) {
  try {
    const { rfqId, items, deliveryDays, notes } = req.body

    const parsedRfqId = parseInt(rfqId, 10)
    if (isNaN(parsedRfqId)) {
      return res.status(400).json({ message: 'Invalid RFQ ID' })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    })

    if (!vendor) {
      return res.status(403).json({ message: 'Forbidden: user is not linked to a vendor record' })
    }

    // Verify vendor is invited to that RFQ
    const invitation = await prisma.rFQVendor.findUnique({
      where: {
        rfqId_vendorId: {
          rfqId: parsedRfqId,
          vendorId: vendor.id
        }
      }
    })

    if (!invitation) {
      return res.status(403).json({ message: 'Forbidden: vendor was not invited to this RFQ' })
    }

    // Check unique constraint
    const existingQuotation = await prisma.quotation.findUnique({
      where: {
        rfqId_vendorId: {
          rfqId: parsedRfqId,
          vendorId: vendor.id
        }
      }
    })

    if (existingQuotation) {
      return res.status(409).json({ message: 'Quotation already submitted for this RFQ' })
    }

    const quotationNumber = await generateQuotationNumber()

    const computedItems = items.map(item => {
      const qty = parseInt(item.quantity, 10)
      const price = parseFloat(item.unitPrice)
      return {
        productName: item.productName,
        quantity: qty,
        unitPrice: price,
        totalPrice: qty * price
      }
    })

    const totalAmount = computedItems.reduce((sum, item) => sum + item.totalPrice, 0)

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        rfqId: parsedRfqId,
        vendorId: vendor.id,
        totalAmount,
        deliveryDays: parseInt(deliveryDays, 10),
        notes,
        status: 'SUBMITTED',
        items: {
          create: computedItems
        }
      },
      include: {
        items: true,
        vendor: true
      }
    })

    await logActivity(req.user.id, 'SUBMIT', 'Quotation', quotation.id, { quotationNumber: quotation.quotationNumber })

    res.status(201).json({ quotation })
  } catch (err) {
    next(err)
  }
}

async function updateQuotation(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid quotation ID' })
    }

    const { items, deliveryDays, notes } = req.body

    const quotation = await prisma.quotation.findUnique({
      where: { id }
    })

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' })
    }

    if (quotation.status !== 'SUBMITTED') {
      return res.status(400).json({ message: 'Quotation can only be updated if status is SUBMITTED' })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    })

    if (!vendor || quotation.vendorId !== vendor.id) {
      return res.status(403).json({ message: 'Forbidden: you are not authorized to edit this quotation' })
    }

    const updateData = {}
    if (deliveryDays !== undefined) {
      updateData.deliveryDays = parseInt(deliveryDays, 10)
    }
    if (notes !== undefined) {
      updateData.notes = notes
    }

    let updatedQuotation
    if (items) {
      const computedItems = items.map(item => {
        const qty = parseInt(item.quantity, 10)
        const price = parseFloat(item.unitPrice)
        return {
          productName: item.productName,
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price
        }
      })

      const totalAmount = computedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      updateData.totalAmount = totalAmount

      updatedQuotation = await prisma.$transaction(async (tx) => {
        await tx.quotationItem.deleteMany({
          where: { quotationId: id }
        })

        return tx.quotation.update({
          where: { id },
          data: {
            ...updateData,
            items: {
              create: computedItems
            }
          },
          include: {
            items: true,
            vendor: true
          }
        })
      })
    } else {
      updatedQuotation = await prisma.quotation.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
          vendor: true
        }
      })
    }

    await logActivity(req.user.id, 'UPDATE', 'Quotation', id, { quotationNumber: updatedQuotation.quotationNumber })

    res.json({ quotation: updatedQuotation })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listQuotations,
  getQuotationsForRFQ,
  createQuotation,
  updateQuotation
}
