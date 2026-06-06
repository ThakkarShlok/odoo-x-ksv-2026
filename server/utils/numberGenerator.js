const prisma = require('./prismaClient')

async function generateRFQNumber() {
  const count = await prisma.rFQ.count()
  const num = String(count + 1).padStart(4, '0')
  return `RFQ-2026-${num}`
}

async function generateQuotationNumber() {
  const count = await prisma.quotation.count()
  const num = String(count + 1).padStart(4, '0')
  return `QUO-2026-${num}`
}

async function generatePONumber() {
  const count = await prisma.purchaseOrder.count()
  const num = String(count + 1).padStart(4, '0')
  return `PO-2026-${num}`
}

async function generateInvoiceNumber() {
  const count = await prisma.invoice.count()
  const num = String(count + 1).padStart(4, '0')
  return `INV-2026-${num}`
}

module.exports = {
  generateRFQNumber,
  generateQuotationNumber,
  generatePONumber,
  generateInvoiceNumber
}
