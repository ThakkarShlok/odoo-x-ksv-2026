const prisma = require('../utils/prismaClient')
const { generateInvoiceNumber } = require('../utils/numberGenerator')
const { logActivity } = require('../utils/activityLogger')
const PDFDocument = require('pdfkit')
const nodemailer = require('nodemailer')

async function listInvoices(req, res, next) {
  try {
    const where = {}

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      })

      if (!vendor) {
        return res.json({ invoices: [] })
      }

      where.po = {
        quotation: {
          vendorId: vendor.id
        }
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        po: {
          include: {
            quotation: {
              include: {
                vendor: true,
                rfq: true
              }
            }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })

    res.json({ invoices })
  } catch (err) {
    next(err)
  }
}

async function getInvoice(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid Invoice ID' })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        po: {
          include: {
            quotation: {
              include: {
                vendor: true,
                items: true,
                rfq: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    res.json({ invoice })
  } catch (err) {
    next(err)
  }
}

async function createInvoiceFromPO(req, res, next) {
  try {
    const poId = parseInt(req.params.poId, 10)
    if (isNaN(poId)) {
      return res.status(400).json({ message: 'Invalid PO ID' })
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId }
    })

    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' })
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { poId }
    })

    if (existingInvoice) {
      return res.status(409).json({ message: 'An Invoice already exists for this Purchase Order' })
    }

    const subtotal = Number(po.totalAmount)
    const taxRate = 18.00
    const taxAmount = subtotal * 0.18
    const totalAmount = subtotal + taxAmount

    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        poId,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        status: 'ISSUED'
      }
    })

    await logActivity(req.user.id, 'CREATE_INVOICE', 'Invoice', invoice.id, { invoiceNumber: invoice.invoiceNumber })

    res.status(201).json({ invoice })
  } catch (err) {
    next(err)
  }
}

async function generateInvoicePDFBuffer(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        resolve(Buffer.concat(buffers))
      })
      doc.on('error', (err) => {
        reject(err)
      })

      // Header
      doc.fontSize(20).text('INVOICE', { align: 'right' })
      doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' })
      doc.text(`Date: ${invoice.issuedAt.toLocaleDateString()}`, { align: 'right' })
      doc.text(`PO Number: ${invoice.po.poNumber}`, { align: 'right' })
      doc.moveDown()

      // Vendor Info
      const vendor = invoice.po.quotation.vendor
      doc.fontSize(12).text('Vendor Details:', { underline: true })
      doc.fontSize(10).text(`Name: ${vendor.name}`)
      doc.text(`Contact: ${vendor.contactName}`)
      doc.text(`Email: ${vendor.email}`)
      doc.text(`Phone: ${vendor.phone}`)
      if (vendor.gstNumber) {
        doc.text(`GST Number: ${vendor.gstNumber}`)
      }
      doc.text(`Address: ${vendor.address}`)
      doc.moveDown()

      // Items Table
      doc.fontSize(12).text('Items:', { underline: true })
      doc.moveDown(0.5)

      // Table header
      doc.fontSize(10)
      const headerY = doc.y
      doc.text('Product Name', 50, headerY, { width: 200 })
      doc.text('Qty', 250, headerY, { width: 50, align: 'right' })
      doc.text('Unit Price', 300, headerY, { width: 100, align: 'right' })
      doc.text('Total Price', 400, headerY, { width: 100, align: 'right' })
      
      // Line
      doc.moveTo(50, headerY + 12).lineTo(500, headerY + 12).stroke()
      doc.moveDown()

      // Items
      const items = invoice.po.quotation.items
      items.forEach(item => {
        const currentY = doc.y
        doc.text(item.productName, 50, currentY, { width: 200 })
        doc.text(String(item.quantity), 250, currentY, { width: 50, align: 'right' })
        doc.text(`Rs. ${Number(item.unitPrice).toFixed(2)}`, 300, currentY, { width: 100, align: 'right' })
        doc.text(`Rs. ${Number(item.totalPrice).toFixed(2)}`, 400, currentY, { width: 100, align: 'right' })
        doc.moveDown()
      })

      // Calculations
      doc.moveDown()
      const calcY = doc.y
      doc.text(`Subtotal: Rs. ${Number(invoice.subtotal).toFixed(2)}`, 350, calcY, { align: 'right', width: 150 })
      doc.text(`GST (18%): Rs. ${Number(invoice.taxAmount).toFixed(2)}`, 350, calcY + 15, { align: 'right', width: 150 })
      doc.text(`Total Amount: Rs. ${Number(invoice.totalAmount).toFixed(2)}`, 350, calcY + 30, { align: 'right', width: 150, bold: true })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

async function getInvoicePDF(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid Invoice ID' })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        po: {
          include: {
            quotation: {
              include: {
                vendor: true,
                items: true,
                rfq: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const pdfBuffer = await generateInvoicePDFBuffer(invoice)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    next(err)
  }
}

async function sendInvoiceEmail(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid Invoice ID' })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        po: {
          include: {
            quotation: {
              include: {
                vendor: true,
                items: true,
                rfq: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const pdfBuffer = await generateInvoicePDFBuffer(invoice)

    let transporter
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    } else {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
    }

    const vendorEmail = invoice.po.quotation.vendor.email
    const mailOptions = {
      from: '"VendorBridge ERP" <no-reply@vendorbridge.com>',
      to: vendorEmail,
      subject: `New Invoice Issued: ${invoice.invoiceNumber}`,
      html: `<p>Dear ${invoice.po.quotation.vendor.contactName},</p>
             <p>A new invoice <strong>${invoice.invoiceNumber}</strong> has been issued for Purchase Order <strong>${invoice.po.poNumber}</strong>.</p>
             <p>Please find the attached PDF invoice for your records.</p>
             <br/>
             <p>Best regards,<br/>VendorBridge Procurement Team</p>`,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    }

    const info = await transporter.sendMail(mailOptions)
    const previewUrl = !process.env.SMTP_HOST ? nodemailer.getTestMessageUrl(info) : null

    await prisma.invoice.update({
      where: { id },
      data: { emailSentAt: new Date() }
    })

    await logActivity(
      req.user.id,
      'EMAIL_INVOICE',
      'Invoice',
      id,
      { message: `Sent invoice via email to ${vendorEmail}`, previewUrl }
    )

    res.json({ success: true, message: 'Email sent', previewUrl })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listInvoices,
  getInvoice,
  createInvoiceFromPO,
  getInvoicePDF,
  sendInvoiceEmail
}
