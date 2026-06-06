const { Router } = require('express')
const {
  listPOs,
  getPO,
  createPOFromQuotation
} = require('../controllers/purchaseOrderController')
const authMiddleware = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/', listPOs)
router.get('/:id', getPO)
router.post('/from-quotation/:quotationId', requireRole('PROCUREMENT_OFFICER'), createPOFromQuotation)

module.exports = router
