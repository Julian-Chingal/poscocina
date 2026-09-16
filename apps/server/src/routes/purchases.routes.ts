import { FastifyInstance } from 'fastify';
import { purchasesController } from '../controllers/purchases.controller.js';

export async function purchasesRoutes(app: FastifyInstance) {
  // Suppliers
  app.get('/api/venues/:venueId/suppliers', purchasesController.getSuppliers);
  app.get('/api/suppliers/:id', purchasesController.getSupplierById);
  app.post('/api/suppliers', purchasesController.createSupplier);
  app.patch('/api/suppliers/:id', purchasesController.updateSupplier);

  // Purchases
  app.get('/api/venues/:venueId/purchases', purchasesController.getPurchases);
  app.get('/api/purchases/:id', purchasesController.getPurchaseById);
  app.post('/api/purchases', purchasesController.createPurchase);
  app.post('/api/purchases/:id/receive', purchasesController.receivePurchase);
}
