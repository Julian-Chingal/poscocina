import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { billingController } from '../controllers/billing.controller.js';

export async function billingRoutes(fastify: FastifyInstance) {
  const cashierGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  // 1. Get currently open cash shift for a venue
  fastify.get('/api/cash-shifts/current/:venueId', cashierGuard, (request, reply) =>
    billingController.getCurrentCashShift(request, reply)
  );

  // 2. Open a new cash shift
  fastify.post('/api/cash-shifts/open', cashierGuard, (request, reply) =>
    billingController.openCashShift(request, reply)
  );

  // 3. Close cash shift with blind count
  fastify.post('/api/cash-shifts/:id/close', cashierGuard, (request, reply) =>
    billingController.closeCashShift(request, reply)
  );

  // 4. Issue Receipt & Pay Order (with Automatic Inventory Decrement!)
  fastify.post('/api/receipts', cashierGuard, (request, reply) =>
    billingController.issueReceipt(request, reply)
  );
}
