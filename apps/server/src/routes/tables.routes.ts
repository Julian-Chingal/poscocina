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
  fastify.get('/api/venues/:venueId/tables', staffGuard, (request, reply) =>
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

  // 5. Transfer table order (Staff)
  fastify.post(
    '/api/tables/transfer',
    staffGuard,
    (request, reply) => tablesController.transferTable(request, reply)
  );

  // 6. Merge tables (Staff)
  fastify.post(
    '/api/tables/merge',
    staffGuard,
    (request, reply) => tablesController.mergeTables(request, reply)
  );
}

