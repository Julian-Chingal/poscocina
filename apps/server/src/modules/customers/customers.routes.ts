import { FastifyInstance } from 'fastify';
import { customersController } from './customers.controller.js';

export async function customersRoutes(fastify: FastifyInstance) {
  const authGuard = { preHandler: [fastify.authenticate] };

  fastify.get('/api/venues/:venueId/customers', authGuard, (req, rep) => customersController.search(req, rep));
  fastify.get('/api/customers', authGuard, (req, rep) => customersController.search(req, rep));
  fastify.get('/api/customers/:id', authGuard, (req, rep) => customersController.getById(req, rep));
  fastify.post('/api/venues/:venueId/customers', authGuard, (req, rep) => customersController.create(req, rep));
  fastify.post('/api/customers', authGuard, (req, rep) => customersController.create(req, rep));
  fastify.put('/api/customers/:id', authGuard, (req, rep) => customersController.update(req, rep));
}
