const { Router } = require('express')
const {
  listInvoices,
  getInvoice,
  createInvoiceFromPO,
  getInvoicePDF,
  sendInvoiceEmail
} = require('../controllers/invoiceController')
const authMiddleware = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/', listInvoices)
router.get('/:id', getInvoice)
router.post('/from-po/:poId', requireRole('PROCUREMENT_OFFICER'), createInvoiceFromPO)
router.get('/:id/pdf', getInvoicePDF)
router.post('/:id/email', sendInvoiceEmail)

module.exports = router
