import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { billingController } from './billing.controller.js';

export async function billingRoutes(fastify: FastifyInstance) {
  const cashierGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  // 1. Get pending bills
  fastify.get('/api/venues/:venueId/pending-bills', cashierGuard, (req, rep) =>
    billingController.getPendingBills(req, rep)
  );

  // 2. Current cash shift
  fastify.get('/api/cash-shifts/current/:venueId', cashierGuard, (req, rep) =>
    billingController.getCurrentCashShift(req, rep)
  );

  // 3. Open cash shift
  fastify.post('/api/cash-shifts/open', cashierGuard, (req, rep) =>
    billingController.openCashShift(req, rep)
  );

  // 4. Close cash shift
  fastify.post('/api/cash-shifts/:id/close', cashierGuard, (req, rep) =>
    billingController.closeCashShift(req, rep)
  );

  // 5. Issue Receipt & Pay Order
  fastify.post('/api/receipts', cashierGuard, (req, rep) =>
    billingController.issueReceipt(req, rep)
  );

  // 6. Split Billing: Equal Parts
  fastify.post('/api/billing/split-equal', cashierGuard, (req, rep) =>
    billingController.splitBillingEqual(req, rep)
  );

  // 7. Split Billing: Selected Items
  fastify.post('/api/billing/split-items', cashierGuard, (req, rep) =>
    billingController.splitBillingByItems(req, rep)
  );
}
