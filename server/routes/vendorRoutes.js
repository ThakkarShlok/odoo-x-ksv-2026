const { Router } = require('express')
const {
  listVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController')
const authMiddleware = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/', listVendors)
router.get('/:id', getVendor)
router.post('/', requireRole('PROCUREMENT_OFFICER', 'ADMIN'), createVendor)
router.put('/:id', requireRole('PROCUREMENT_OFFICER', 'ADMIN'), updateVendor)
router.delete('/:id', requireRole('ADMIN'), deleteVendor)

module.exports = router
