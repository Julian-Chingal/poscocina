import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { auditController } from '../controllers/audit.controller.js';

export async function auditRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  // Get audit logs for venue
  fastify.get('/api/venues/:venueId/audit-logs', managerGuard, (req, rep) =>
    auditController.getLogs(req, rep)
  );

  fastify.get('/api/audit-logs', managerGuard, (req, rep) =>
    auditController.getLogs(req, rep)
  );
}
