const { Router } = require('express')
const { register, login, getMe } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)

module.exports = router
