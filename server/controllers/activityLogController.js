const prisma = require('../utils/prismaClient')

async function listActivity(req, res, next) {
  try {
    const { entityType, entityId, limit } = req.query
    const parsedLimit = limit ? parseInt(limit, 10) : 50

    const where = {}

    if (entityType) {
      where.entityType = entityType
    }

    if (entityId) {
      const parsedEntityId = parseInt(entityId, 10)
      if (!isNaN(parsedEntityId)) {
        where.entityId = parsedEntityId
      }
    }

    if (req.user.role === 'VENDOR') {
      where.userId = req.user.id
    }

    const logs = await prisma.activityLog.findMany({
      where,
      take: parsedLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    res.json({ logs })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listActivity
}
