import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { auditController } from '../controllers/audit.controller.js';

export async function auditRoutes(fastify: FastifyInstance) {
  // Query audit logs (Protected: only Manager & Super Admin)
  fastify.get(
    '/api/audit-logs',
    {
      preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
    },
    (request, reply) => auditController.getAuditLogs(request, reply)
  );
}
