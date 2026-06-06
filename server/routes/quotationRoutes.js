const { Router } = require('express')
const {
  listQuotations,
  createQuotation,
  updateQuotation
} = require('../controllers/quotationController')
const authMiddleware = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/', listQuotations)
router.post('/', requireRole('VENDOR'), createQuotation)
router.put('/:id', requireRole('VENDOR'), updateQuotation)

module.exports = router
