const { Router } = require('express')
const {
  listPendingApprovals,
  submitForApproval,
  decideApproval
} = require('../controllers/approvalController')
const authMiddleware = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/pending', requireRole('MANAGER'), listPendingApprovals)
router.post('/', requireRole('PROCUREMENT_OFFICER'), submitForApproval)
router.post('/:id/decide', requireRole('MANAGER'), decideApproval)

module.exports = router
