import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { inventoryController } from '../controllers/inventory.controller.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  const staffGuard = {
    preHandler: [fastify.authenticate],
  };

  // 1. Get all inventory items for a venue
  fastify.get('/api/venues/:venueId/inventory/items', staffGuard, (request, reply) =>
    inventoryController.getInventoryItems(request, reply)
  );

  // 2. Create new inventory item (Manager only)
  fastify.post('/api/venues/:venueId/inventory/items', managerGuard, (request, reply) =>
    inventoryController.createInventoryItem(request, reply)
  );

  // 3. Register inventory movement (Purchase, Waste, Adjustment) (Manager only)
  fastify.post('/api/inventory/movements', managerGuard, (request, reply) =>
    inventoryController.registerMovement(request, reply)
  );

  // 4. Get recipe for a specific product
  fastify.get('/api/products/:productId/recipe', staffGuard, (request, reply) =>
    inventoryController.getProductRecipe(request, reply)
  );

  // 5. Update or set recipe ingredients for a product (Manager only)
  fastify.post('/api/products/:productId/recipe', managerGuard, (request, reply) =>
    inventoryController.setProductRecipe(request, reply)
  );

  // 6. Get recent inventory movements (Manager only)
  fastify.get('/api/venues/:venueId/inventory/movements', managerGuard, (request, reply) =>
    inventoryController.getRecentMovements(request, reply)
  );
}
