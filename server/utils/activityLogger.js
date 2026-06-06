const prisma = require('./prismaClient')

async function logActivity(userId, action, entityType, entityId, metadata = null) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata
      }
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

module.exports = { logActivity }
