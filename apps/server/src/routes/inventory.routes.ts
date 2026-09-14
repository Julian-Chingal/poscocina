import { FastifyInstance } from 'fastify';
import { inventoryController } from '../controllers/inventory.controller.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
  // 1. Get all inventory items for a venue
  fastify.get('/api/venues/:venueId/inventory/items', (request, reply) =>
    inventoryController.getInventoryItems(request, reply)
  );

  // 2. Create new inventory item
  fastify.post('/api/venues/:venueId/inventory/items', (request, reply) =>
    inventoryController.createInventoryItem(request, reply)
  );

  // 3. Register inventory movement (Purchase, Waste, Adjustment)
  fastify.post('/api/inventory/movements', (request, reply) =>
    inventoryController.registerMovement(request, reply)
  );

  // 4. Get recipe for a specific product
  fastify.get('/api/products/:productId/recipe', (request, reply) =>
    inventoryController.getProductRecipe(request, reply)
  );

  // 5. Update or set recipe ingredients for a product
  fastify.post('/api/products/:productId/recipe', (request, reply) =>
    inventoryController.setProductRecipe(request, reply)
  );

  // 6. Get recent inventory movements
  fastify.get('/api/venues/:venueId/inventory/movements', (request, reply) =>
    inventoryController.getRecentMovements(request, reply)
  );
}
