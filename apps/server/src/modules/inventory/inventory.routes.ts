import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { inventoryController } from './inventory.controller.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };
  const staffGuard = { preHandler: [fastify.authenticate] };

  // Stock & Recipe
  fastify.get('/api/venues/:venueId/inventory/items', staffGuard, (req, rep) => inventoryController.getInventoryItems(req, rep));
  fastify.post('/api/venues/:venueId/inventory/items', managerGuard, (req, rep) => inventoryController.createInventoryItem(req, rep));
  fastify.post('/api/inventory/movements', managerGuard, (req, rep) => inventoryController.registerMovement(req, rep));
  fastify.get('/api/products/:productId/recipe', staffGuard, (req, rep) => inventoryController.getProductRecipe(req, rep));
  fastify.post('/api/products/:productId/recipe', managerGuard, (req, rep) => inventoryController.setProductRecipe(req, rep));
  fastify.get('/api/venues/:venueId/inventory/movements', managerGuard, (req, rep) => inventoryController.getRecentMovements(req, rep));
  fastify.get('/api/venues/:venueId/inventory/low-stock', staffGuard, (req, rep) => inventoryController.getLowStockItems(req, rep));

  // Suppliers & Purchases
  fastify.get('/api/venues/:venueId/suppliers', staffGuard, (req, rep) => inventoryController.getSuppliers(req, rep));
  fastify.get('/api/suppliers/:id', staffGuard, (req, rep) => inventoryController.getSupplierById(req, rep));
  fastify.post('/api/suppliers', managerGuard, (req, rep) => inventoryController.createSupplier(req, rep));
  fastify.patch('/api/suppliers/:id', managerGuard, (req, rep) => inventoryController.updateSupplier(req, rep));

  fastify.get('/api/venues/:venueId/purchases', managerGuard, (req, rep) => inventoryController.getPurchases(req, rep));
  fastify.get('/api/purchases/:id', managerGuard, (req, rep) => inventoryController.getPurchaseById(req, rep));
  fastify.post('/api/purchases', managerGuard, (req, rep) => inventoryController.createPurchase(req, rep));
  fastify.post('/api/purchases/:id/receive', managerGuard, (req, rep) => inventoryController.receivePurchase(req, rep));
}
