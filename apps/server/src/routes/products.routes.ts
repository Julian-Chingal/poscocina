import { FastifyInstance } from 'fastify';
import { catalogController } from '../controllers/catalog.controller.js';

export async function productsRoutes(fastify: FastifyInstance) {
  // 1. Get full menu catalog for a venue (Categories, Products, Modifier Groups and Modifiers)
  fastify.get('/api/venues/:venueId/catalog', (request, reply) =>
    catalogController.getVenueCatalog(request, reply)
  );

  // 2. Toggle 86'd (product out of stock / availability)
  fastify.patch('/api/products/:id/toggle-availability', (request, reply) =>
    catalogController.toggleProductAvailability(request, reply)
  );
}
