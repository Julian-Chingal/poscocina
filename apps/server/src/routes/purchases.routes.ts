import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { purchasesController } from '../controllers/purchases.controller.js';

export async function purchasesRoutes(app: FastifyInstance) {
  const managerGuard = {
    preHandler: [
      app.authenticate,
      app.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  const staffGuard = {
    preHandler: [app.authenticate],
  };

  // Suppliers
  app.get('/api/venues/:venueId/suppliers', staffGuard, purchasesController.getSuppliers);
  app.get('/api/suppliers/:id', staffGuard, purchasesController.getSupplierById);
  app.post('/api/suppliers', managerGuard, purchasesController.createSupplier);
  app.patch('/api/suppliers/:id', managerGuard, purchasesController.updateSupplier);

  // Purchases
  app.get('/api/venues/:venueId/purchases', managerGuard, purchasesController.getPurchases);
  app.get('/api/purchases/:id', managerGuard, purchasesController.getPurchaseById);
  app.post('/api/purchases', managerGuard, purchasesController.createPurchase);
  app.post('/api/purchases/:id/receive', managerGuard, purchasesController.receivePurchase);
}
