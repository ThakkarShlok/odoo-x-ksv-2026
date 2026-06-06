const prisma = require('../utils/prismaClient')
const bcrypt = require('bcryptjs')

async function main() {
  const adminPass = await bcrypt.hash('admin1234', 10)
  const userPass = await bcrypt.hash('user1234', 10)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@example.com', password: adminPass, role: 'ADMIN' },
  })

  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com', password: userPass },
  })

  await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob', email: 'bob@example.com', password: userPass },
  })

  console.log('Seed complete: admin@example.com / admin1234, alice@example.com / user1234, bob@example.com / user1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
