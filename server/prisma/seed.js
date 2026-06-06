const prisma = require('../utils/prismaClient')
const bcrypt = require('bcryptjs')

async function main() {
  const pass = await bcrypt.hash('password123', 10)

  // ── Users ──────────────────────────────────────────────────────────────────
  const officer = await prisma.user.upsert({
    where: { email: 'officer@vb.com' },
    update: {},
    create: { name: 'Priya Sharma', email: 'officer@vb.com', password: pass, role: 'PROCUREMENT_OFFICER' },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@vb.com' },
    update: {},
    create: { name: 'Rahul Mehta', email: 'manager@vb.com', password: pass, role: 'MANAGER' },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vb.com' },
    update: {},
    create: { name: 'Sanya Kapoor', email: 'admin@vb.com', password: pass, role: 'ADMIN' },
  })

  const vendorUser1 = await prisma.user.upsert({
    where: { email: 'acme@vendor.com' },
    update: {},
    create: { name: 'Arjun Patel', email: 'acme@vendor.com', password: pass, role: 'VENDOR' },
  })

  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'techsupplies@vendor.com' },
    update: {},
    create: { name: 'Meera Nair', email: 'techsupplies@vendor.com', password: pass, role: 'VENDOR' },
  })

  const vendorUser3 = await prisma.user.upsert({
    where: { email: 'officemart@vendor.com' },
    update: {},
    create: { name: 'Vikram Singh', email: 'officemart@vendor.com', password: pass, role: 'VENDOR' },
  })

  // ── Vendors ────────────────────────────────────────────────────────────────
  const vendor1 = await prisma.vendor.upsert({
    where: { email: 'acme@vendor.com' },
    update: {},
    create: {
      name: 'Acme Hardware Pvt. Ltd.',
      contactName: 'Arjun Patel',
      email: 'acme@vendor.com',
      phone: '+91-9876543210',
      gstNumber: '27AABCT1234A1Z5',
      category: 'Hardware',
      address: '42, MG Road, Bengaluru, Karnataka 560001',
      rating: 4.5,
      userId: vendorUser1.id,
    },
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { email: 'techsupplies@vendor.com' },
    update: {},
    create: {
      name: 'TechSupplies India',
      contactName: 'Meera Nair',
      email: 'techsupplies@vendor.com',
      phone: '+91-9123456789',
      gstNumber: '29AABCO5678B1Z3',
      category: 'Electronics',
      address: '15, Anna Salai, Chennai, Tamil Nadu 600002',
      rating: 4.1,
      userId: vendorUser2.id,
    },
  })

  const vendor3 = await prisma.vendor.upsert({
    where: { email: 'officemart@vendor.com' },
    update: {},
    create: {
      name: 'OfficeMart Solutions',
      contactName: 'Vikram Singh',
      email: 'officemart@vendor.com',
      phone: '+91-9988776655',
      gstNumber: '07AABCL9012C1Z1',
      category: 'Stationery',
      address: '8, Connaught Place, New Delhi 110001',
      rating: 3.8,
      userId: vendorUser3.id,
    },
  })

  // ── RFQ ───────────────────────────────────────────────────────────────────
  const rfq = await prisma.rFQ.upsert({
    where: { rfqNumber: 'RFQ-2026-001' },
    update: {},
    create: {
      rfqNumber: 'RFQ-2026-001',
      title: 'Q2 Laptop Procurement',
      description: 'Procurement of laptops and accessories for the engineering team expansion.',
      deadline: new Date('2026-07-01T00:00:00.000Z'),
      status: 'PUBLISHED',
      createdById: officer.id,
      items: {
        create: [
          { productName: 'Laptop 15" (Core i7, 16GB RAM, 512GB SSD)', quantity: 10, unit: 'units' },
          { productName: 'Laptop Bag', quantity: 10, unit: 'units' },
          { productName: 'Wireless Mouse', quantity: 10, unit: 'units' },
        ],
      },
      vendors: {
        create: [
          { vendorId: vendor1.id },
          { vendorId: vendor2.id },
        ],
      },
    },
  })

  // ── Quotation ─────────────────────────────────────────────────────────────
  const quotation = await prisma.quotation.upsert({
    where: { quotationNumber: 'QT-2026-001' },
    update: {},
    create: {
      quotationNumber: 'QT-2026-001',
      rfqId: rfq.id,
      vendorId: vendor1.id,
      totalAmount: 875000.00,
      deliveryDays: 14,
      notes: 'Includes 1-year on-site warranty for all units.',
      status: 'UNDER_REVIEW',
      items: {
        create: [
          { productName: 'Laptop 15" (Core i7, 16GB RAM, 512GB SSD)', quantity: 10, unitPrice: 82000.00, totalPrice: 820000.00 },
          { productName: 'Laptop Bag', quantity: 10, unitPrice: 1500.00, totalPrice: 15000.00 },
          { productName: 'Wireless Mouse', quantity: 10, unitPrice: 4000.00, totalPrice: 40000.00 },
        ],
      },
    },
  })

  // ── Approval ──────────────────────────────────────────────────────────────
  await prisma.approval.upsert({
    where: { quotationId: quotation.id },
    update: {},
    create: {
      quotationId: quotation.id,
      approverId: manager.id,
      status: 'PENDING',
    },
  })

  // ── Activity Logs ─────────────────────────────────────────────────────────
  const logsExist = await prisma.activityLog.count({ where: { userId: officer.id } })
  if (logsExist === 0) {
    await prisma.activityLog.createMany({
      data: [
        { userId: officer.id, action: 'CREATE', entityType: 'RFQ', entityId: rfq.id, metadata: { rfqNumber: 'RFQ-2026-001' } },
        { userId: officer.id, action: 'PUBLISH', entityType: 'RFQ', entityId: rfq.id, metadata: { status: 'PUBLISHED' } },
        { userId: manager.id, action: 'REVIEW', entityType: 'Quotation', entityId: quotation.id, metadata: { quotationNumber: 'QT-2026-001' } },
      ],
    })
  }

  console.log('\nSeed complete:')
  console.log('  officer@vb.com           / password123  (PROCUREMENT_OFFICER)')
  console.log('  manager@vb.com           / password123  (MANAGER)')
  console.log('  admin@vb.com             / password123  (ADMIN)')
  console.log('  acme@vendor.com          / password123  (VENDOR → Acme Hardware Pvt. Ltd.)')
  console.log('  techsupplies@vendor.com  / password123  (VENDOR → TechSupplies India)')
  console.log('  officemart@vendor.com    / password123  (VENDOR → OfficeMart Solutions)')
  console.log('\n  RFQ: RFQ-2026-001 (PUBLISHED)')
  console.log('  Quotation: QT-2026-001 (UNDER_REVIEW, pending approval by Rahul Mehta)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
