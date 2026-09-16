import { FastifyInstance } from 'fastify';
import { customersController } from '../controllers/customers.controller.js';

export async function customersRoutes(fastify: FastifyInstance) {
  const authGuard = {
    preHandler: [fastify.authenticate],
  };

  // Search/List customers
  fastify.get('/api/venues/:venueId/customers', authGuard, (req, rep) =>
    customersController.search(req, rep)
  );

  // Quick search
  fastify.get('/api/customers', authGuard, (req, rep) =>
    customersController.search(req, rep)
  );

  // Get customer by id
  fastify.get('/api/customers/:id', authGuard, (req, rep) =>
    customersController.getById(req, rep)
  );

  // Create customer
  fastify.post('/api/venues/:venueId/customers', authGuard, (req, rep) =>
    customersController.create(req, rep)
  );

  fastify.post('/api/customers', authGuard, (req, rep) =>
    customersController.create(req, rep)
  );

  // Update customer
  fastify.put('/api/customers/:id', authGuard, (req, rep) =>
    customersController.update(req, rep)
  );
}
