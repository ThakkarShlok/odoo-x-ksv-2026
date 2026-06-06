const prisma = require('../utils/prismaClient')
const { logActivity } = require('../utils/activityLogger')

async function listVendors(req, res, next) {
  try {
    const { search, category, isActive } = req.query
    const where = {}

    if (category) {
      where.category = category
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    res.json({ vendors })
  } catch (err) {
    next(err)
  }
}

async function getVendor(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid vendor ID' })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id }
    })

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    res.json({ vendor })
  } catch (err) {
    next(err)
  }
}

async function createVendor(req, res, next) {
  try {
    const { name, contactName, email, phone, gstNumber, category, address } = req.body

    const existingVendor = await prisma.vendor.findUnique({ where: { email } })
    if (existingVendor) {
      return res.status(409).json({ message: 'Vendor with this email already exists' })
    }

    // Link user if user already exists with this email
    const user = await prisma.user.findUnique({ where: { email } })
    const userId = user ? user.id : null

    const vendor = await prisma.vendor.create({
      data: {
        name,
        contactName,
        email,
        phone,
        gstNumber,
        category,
        address,
        userId
      }
    })

    await logActivity(req.user.id, 'CREATE', 'Vendor', vendor.id, { name: vendor.name })

    res.status(201).json({ vendor })
  } catch (err) {
    next(err)
  }
}

async function updateVendor(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid vendor ID' })
    }

    const { name, contactName, email, phone, gstNumber, category, address, isActive } = req.body

    const existing = await prisma.vendor.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    const updatedData = {
      name,
      contactName,
      email,
      phone,
      gstNumber,
      category,
      address
    }

    if (isActive !== undefined) {
      updatedData.isActive = isActive
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updatedData
    })

    await logActivity(req.user.id, 'UPDATE', 'Vendor', vendor.id, { name: vendor.name })

    res.json({ vendor })
  } catch (err) {
    next(err)
  }
}

async function deleteVendor(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid vendor ID' })
    }

    const existing = await prisma.vendor.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { isActive: false }
    })

    await logActivity(req.user.id, 'DELETE', 'Vendor', vendor.id, { isActive: false })

    res.json({ vendor })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor
}
