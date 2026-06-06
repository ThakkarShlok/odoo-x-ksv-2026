const prisma = require('../utils/prismaClient')
const { logActivity } = require('../utils/activityLogger')

async function listPendingApprovals(req, res, next) {
  try {
    const approvals = await prisma.approval.findMany({
      where: { status: 'PENDING' },
      include: {
        quotation: {
          include: {
            rfq: true,
            vendor: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { id: 'desc' }
    })

    res.json({ approvals })
  } catch (err) {
    next(err)
  }
}

async function submitForApproval(req, res, next) {
  try {
    const { quotationId, approverId } = req.body

    const parsedQuotationId = parseInt(quotationId, 10)
    const parsedApproverId = parseInt(approverId, 10)

    if (isNaN(parsedQuotationId) || isNaN(parsedApproverId)) {
      return res.status(400).json({ message: 'Invalid quotationId or approverId' })
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: parsedQuotationId }
    })

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' })
    }

    const approver = await prisma.user.findUnique({
      where: { id: parsedApproverId }
    })

    if (!approver || approver.role !== 'MANAGER') {
      return res.status(400).json({ message: 'Approver must be a User with the MANAGER role' })
    }

    const existingApproval = await prisma.approval.findUnique({
      where: { quotationId: parsedQuotationId }
    })

    if (existingApproval) {
      return res.status(409).json({ message: 'Quotation is already submitted for approval' })
    }

    const approval = await prisma.$transaction(async (tx) => {
      const app = await tx.approval.create({
        data: {
          quotationId: parsedQuotationId,
          approverId: parsedApproverId,
          status: 'PENDING'
        }
      })

      await tx.quotation.update({
        where: { id: parsedQuotationId },
        data: { status: 'UNDER_REVIEW' }
      })

      return app
    })

    await logActivity(req.user.id, 'SUBMIT_FOR_APPROVAL', 'Approval', approval.id, { quotationId: parsedQuotationId })

    res.status(201).json({ approval })
  } catch (err) {
    next(err)
  }
}

async function decideApproval(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid approval ID' })
    }

    const { status, remarks } = req.body

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' })
    }

    const existing = await prisma.approval.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ message: 'Approval record not found' })
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ message: 'Approval has already been decided' })
    }

    const approval = await prisma.$transaction(async (tx) => {
      const app = await tx.approval.update({
        where: { id },
        data: {
          status,
          remarks,
          decidedAt: new Date()
        }
      })

      await tx.quotation.update({
        where: { id: app.quotationId },
        data: { status }
      })

      return app
    })

    await logActivity(req.user.id, status, 'Approval', approval.id, { remarks })

    res.json({ approval })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listPendingApprovals,
  submitForApproval,
  decideApproval
}
