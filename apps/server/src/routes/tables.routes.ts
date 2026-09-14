import { FastifyInstance } from 'fastify';
import { tablesController } from '../controllers/tables.controller.js';

export async function tablesRoutes(fastify: FastifyInstance) {
  // 1. Get all tables for a venue with current order info
  fastify.get('/api/venues/:venueId/tables', (request, reply) =>
    tablesController.getVenueTables(request, reply)
  );

  // 2. Update table status
  fastify.patch('/api/tables/:id/status', (request, reply) =>
    tablesController.updateTableStatus(request, reply)
  );
}
