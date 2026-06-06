const { Router } = require('express')
const { getSummary } = require('../controllers/dashboardController')
const authMiddleware = require('../middleware/authMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/summary', getSummary)

module.exports = router
