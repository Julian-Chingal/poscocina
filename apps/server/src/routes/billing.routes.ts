import { FastifyInstance } from 'fastify';
import { billingController } from '../controllers/billing.controller.js';

export async function billingRoutes(fastify: FastifyInstance) {
  // 1. Get currently open cash shift for a venue
  fastify.get('/api/cash-shifts/current/:venueId', (request, reply) =>
    billingController.getCurrentCashShift(request, reply)
  );

  // 2. Open a new cash shift
  fastify.post('/api/cash-shifts/open', (request, reply) =>
    billingController.openCashShift(request, reply)
  );

  // 3. Close cash shift with blind count
  fastify.post('/api/cash-shifts/:id/close', (request, reply) =>
    billingController.closeCashShift(request, reply)
  );

  // 4. Issue Receipt & Pay Order (with Automatic Inventory Decrement!)
  fastify.post('/api/receipts', (request, reply) =>
    billingController.issueReceipt(request, reply)
  );
}
