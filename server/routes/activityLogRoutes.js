const { Router } = require('express')
const { listActivity } = require('../controllers/activityLogController')
const authMiddleware = require('../middleware/authMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/', listActivity)

module.exports = router
