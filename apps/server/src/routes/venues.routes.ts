import { FastifyInstance } from 'fastify';
import { venuesController } from '../controllers/venues.controller.js';

export async function venuesRoutes(fastify: FastifyInstance) {
  // 1. List all venues
  fastify.get('/api/venues', (request, reply) => venuesController.listVenues(request, reply));

  // 2. Get first / default venue (for terminal initialization)
  fastify.get('/api/venues/first', (request, reply) => venuesController.getFirstVenue(request, reply));

  // 3. Get venue by id
  fastify.get('/api/venues/:id', (request, reply) => venuesController.getVenueById(request, reply));

  // 4. Create new venue (Super Admin only)
  fastify.post(
    '/api/venues',
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(['super_admin']),
      ],
    },
    (request, reply) => venuesController.createVenue(request, reply)
  );

  // 5. Get venue summary metrics (Tables, Orders, Shift, Staff)
  fastify.get(
    '/api/venues/:id/summary',
    {
      preHandler: [fastify.authenticate],
    },
    (request, reply) => venuesController.getVenueSummary(request, reply)
  );

  // 6. Update venue settings / branding (Manager / Admin only)
  fastify.patch(
    '/api/venues/:id/settings',
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(['manager', 'super_admin']),
      ],
    },
    (request, reply) => venuesController.updateVenueSettings(request, reply)
  );
}
