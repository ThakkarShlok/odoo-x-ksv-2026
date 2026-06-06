const { Router } = require('express')
const {
  listRFQs,
  getRFQ,
  createRFQ,
  publishRFQ,
  closeRFQ
} = require('../controllers/rfqController')
const { getQuotationsForRFQ } = require('../controllers/quotationController')
const authMiddleware = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/', listRFQs)
router.get('/:id', getRFQ)
router.get('/:rfqId/quotations', requireRole('PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN'), getQuotationsForRFQ)
router.post('/', requireRole('PROCUREMENT_OFFICER'), createRFQ)
router.put('/:id/publish', requireRole('PROCUREMENT_OFFICER'), publishRFQ)
router.put('/:id/close', requireRole('PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN'), closeRFQ)

module.exports = router
