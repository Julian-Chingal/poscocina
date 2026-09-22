import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { tablesController } from './tables.controller.js';

export async function tablesRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };
  const staffGuard = { preHandler: [fastify.authenticate] };

  // Floor Plans
  fastify.get('/api/venues/:venueId/floor-plans', staffGuard, (req, rep) => tablesController.getFloorPlans(req, rep));
  fastify.post('/api/venues/:venueId/floor-plans', managerGuard, (req, rep) => tablesController.createFloorPlan(req, rep));

  // Tables
  fastify.get('/api/venues/:venueId/tables', staffGuard, (req, rep) => tablesController.getVenueTables(req, rep));
  fastify.post('/api/tables', managerGuard, (req, rep) => tablesController.createTable(req, rep));
  fastify.patch('/api/tables/:id', managerGuard, (req, rep) => tablesController.updateTable(req, rep));
  fastify.delete('/api/tables/:id', managerGuard, (req, rep) => tablesController.deleteTable(req, rep));

  // State & Movement
  fastify.patch('/api/tables/:id/status', staffGuard, (req, rep) => tablesController.updateTableStatus(req, rep));
  fastify.post('/api/tables/transfer', staffGuard, (req, rep) => tablesController.transferTable(req, rep));
  fastify.post('/api/tables/merge', staffGuard, (req, rep) => tablesController.mergeTables(req, rep));
}
