const prisma = require('../utils/prismaClient')

async function getSummary(req, res, next) {
  try {
    let approvalWhere = { status: 'PENDING' }
    let rfqWhere = { status: 'PUBLISHED' }
    let poWhere = {}
    let invoiceWhere = {}
    let vendorWhere = { isActive: true }

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      })

      if (!vendor) {
        return res.json({
          pendingApprovals: 0,
          activeRFQs: 0,
          recentPOs: 0,
          recentInvoices: 0,
          totalVendors: 0
        })
      }

      approvalWhere = {
        status: 'PENDING',
        quotation: { vendorId: vendor.id }
      }
      rfqWhere = {
        status: 'PUBLISHED',
        vendors: { some: { vendorId: vendor.id } }
      }
      poWhere = {
        quotation: { vendorId: vendor.id }
      }
      invoiceWhere = {
        po: { quotation: { vendorId: vendor.id } }
      }
      vendorWhere = {
        id: vendor.id
      }
    }

    const [
      pendingApprovals,
      activeRFQs,
      recentPOs,
      recentInvoices,
      totalVendors
    ] = await Promise.all([
      prisma.approval.count({ where: approvalWhere }),
      prisma.rFQ.count({ where: rfqWhere }),
      prisma.purchaseOrder.count({ where: poWhere }),
      prisma.invoice.count({ where: invoiceWhere }),
      prisma.vendor.count({ where: vendorWhere })
    ])

    res.json({
      pendingApprovals,
      activeRFQs,
      recentPOs,
      recentInvoices,
      totalVendors
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getSummary
}
