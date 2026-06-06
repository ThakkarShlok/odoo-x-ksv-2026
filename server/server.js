require('dotenv').config()

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL', 'GEMINI_API_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: environment variable ${key} is not set`)
    process.exit(1)
  }
}

const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const aiRoutes = require('./routes/aiRoutes')
const vendorRoutes = require('./routes/vendorRoutes')
const rfqRoutes = require('./routes/rfqRoutes')
const quotationRoutes = require('./routes/quotationRoutes')
const approvalRoutes = require('./routes/approvalRoutes')
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const activityLogRoutes = require('./routes/activityLogRoutes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/rfqs', rfqRoutes)
app.use('/api/quotations', quotationRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/pos', purchaseOrderRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/activity', activityLogRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
