import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { catalogController } from '../controllers/catalog.controller.js';

export async function productsRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  // 1. Get full menu catalog for a venue (Categories, Products, Modifier Groups and Modifiers)
  fastify.get('/api/venues/:venueId/catalog', (request, reply) =>
    catalogController.getVenueCatalog(request, reply)
  );

  // 2. Category CRUD (Manager only)
  fastify.post('/api/venues/:venueId/categories', managerGuard, (request, reply) =>
    catalogController.createCategory(request, reply)
  );

  fastify.patch('/api/venues/:venueId/categories/:id', managerGuard, (request, reply) =>
    catalogController.updateCategory(request, reply)
  );

  fastify.delete('/api/venues/:venueId/categories/:id', managerGuard, (request, reply) =>
    catalogController.deleteCategory(request, reply)
  );

  // 3. Product CRUD (Manager only)
  fastify.post('/api/products', managerGuard, (request, reply) =>
    catalogController.createProduct(request, reply)
  );

  fastify.patch('/api/products/:id', managerGuard, (request, reply) =>
    catalogController.updateProduct(request, reply)
  );

  fastify.delete('/api/products/:id', managerGuard, (request, reply) =>
    catalogController.deleteProduct(request, reply)
  );

  // 4. Toggle 86'd (product out of stock / availability) (Staff)
  fastify.patch(
    '/api/products/:id/toggle-availability',
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole([
          ROLES.WAITER,
          ROLES.CASHIER,
          ROLES.KITCHEN,
          ROLES.MANAGER,
          ROLES.SUPER_ADMIN,
        ]),
      ],
    },
    (request, reply) => catalogController.toggleProductAvailability(request, reply)
  );
}
