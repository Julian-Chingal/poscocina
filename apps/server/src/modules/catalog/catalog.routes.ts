import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { catalogController } from './catalog.controller.js';

export async function catalogRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };
  const staffGuard = { preHandler: [fastify.authenticate] };

  // 1. Get full menu catalog
  fastify.get('/api/venues/:venueId/catalog', staffGuard, (req, rep) => catalogController.getVenueCatalog(req, rep));

  // 2. Category CRUD
  fastify.post('/api/venues/:venueId/categories', managerGuard, (req, rep) => catalogController.createCategory(req, rep));
  fastify.patch('/api/venues/:venueId/categories/:id', managerGuard, (req, rep) => catalogController.updateCategory(req, rep));
  fastify.delete('/api/venues/:venueId/categories/:id', managerGuard, (req, rep) => catalogController.deleteCategory(req, rep));

  // 3. Product CRUD
  fastify.post('/api/products', managerGuard, (req, rep) => catalogController.createProduct(req, rep));
  fastify.patch('/api/products/:id', managerGuard, (req, rep) => catalogController.updateProduct(req, rep));
  fastify.delete('/api/products/:id', managerGuard, (req, rep) => catalogController.deleteProduct(req, rep));

  // 4. Toggle 86'd
  fastify.patch(
    '/api/products/:id/toggle-availability',
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole([ROLES.WAITER, ROLES.CASHIER, ROLES.KITCHEN, ROLES.MANAGER, ROLES.SUPER_ADMIN]),
      ],
    },
    (req, rep) => catalogController.toggleProductAvailability(req, rep)
  );
}
