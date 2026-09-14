import { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { ROLES } from '@poscocina/shared';

export async function auditRoutes(fastify: FastifyInstance) {
  // Query audit logs (Protected: only Manager & Super Admin)
  fastify.get(
    '/api/audit-logs',
    {
      preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
    },
    async (request, reply) => {
      const { limit = '50', action } = request.query as { limit?: string; action?: string };
      const venueId = request.user!.venueId;

      const logs = await db
        .select({
          id: schema.auditLogs.id,
          action: schema.auditLogs.action,
          entityType: schema.auditLogs.entityType,
          entityId: schema.auditLogs.entityId,
          payload: schema.auditLogs.payload,
          ipAddress: schema.auditLogs.ipAddress,
          userAgent: schema.auditLogs.userAgent,
          createdAt: schema.auditLogs.createdAt,
          userName: schema.users.name,
        })
        .from(schema.auditLogs)
        .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
        .where(eq(schema.auditLogs.venueId, venueId))
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(Number(limit) || 50);

      return reply.send(logs);
    }
  );
}
