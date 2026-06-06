const { Router } = require('express')
const { generate } = require('../controllers/aiController')
const authMiddleware = require('../middleware/authMiddleware')

const router = Router()

router.post('/generate', authMiddleware, generate)

module.exports = router
