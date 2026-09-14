import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { tablesController } from '../controllers/tables.controller.js';

export async function tablesRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  const staffGuard = {
    preHandler: [fastify.authenticate],
  };

  // 1. Floor Plans
  fastify.get('/api/venues/:venueId/floor-plans', staffGuard, (request, reply) =>
    tablesController.getFloorPlans(request, reply)
  );

  fastify.post('/api/venues/:venueId/floor-plans', managerGuard, (request, reply) =>
    tablesController.createFloorPlan(request, reply)
  );

  // 2. Get all tables for a venue with current order info
  fastify.get('/api/venues/:venueId/tables', (request, reply) =>
    tablesController.getVenueTables(request, reply)
  );

  // 3. Table CRUD (Manager only)
  fastify.post('/api/tables', managerGuard, (request, reply) =>
    tablesController.createTable(request, reply)
  );

  fastify.patch('/api/tables/:id', managerGuard, (request, reply) =>
    tablesController.updateTable(request, reply)
  );

  fastify.delete('/api/tables/:id', managerGuard, (request, reply) =>
    tablesController.deleteTable(request, reply)
  );

  // 4. Update table status (Staff)
  fastify.patch(
    '/api/tables/:id/status',
    staffGuard,
    (request, reply) => tablesController.updateTableStatus(request, reply)
  );
}
