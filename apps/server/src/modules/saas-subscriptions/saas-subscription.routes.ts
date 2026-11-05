import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { saasSubscriptionController } from './saas-subscription.controller.js';

export async function saasSubscriptionRoutes(fastify: FastifyInstance) {
  const superAdminGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.SUPER_ADMIN])],
  };

  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };

  const authGuard = {
    preHandler: [fastify.authenticate],
  };

  // --- PUBLIC / RESTAURANT MANAGER ROUTES ---
  fastify.get('/api/saas/public-plans', (req, rep) =>
    saasSubscriptionController.listPlans(req, rep)
  );

  fastify.post('/api/saas/coupons/validate', authGuard, (req, rep) =>
    saasSubscriptionController.validateCoupon(req, rep)
  );

  fastify.get('/api/saas/my-subscription', managerGuard, (req, rep) =>
    saasSubscriptionController.getCompanySubscription(req, rep)
  );

  fastify.get('/api/saas/my-invoices', managerGuard, (req, rep) =>
    saasSubscriptionController.listCompanyInvoices(req, rep)
  );

  // --- SUPER ADMIN MANAGEMENT ROUTES ---
  // Plans
  fastify.get('/api/saas/plans', superAdminGuard, (req, rep) =>
    saasSubscriptionController.listPlans(req, rep)
  );
  fastify.get('/api/saas/plans/:id', superAdminGuard, (req, rep) =>
    saasSubscriptionController.getPlan(req, rep)
  );
  fastify.post('/api/saas/plans', superAdminGuard, (req, rep) =>
    saasSubscriptionController.createPlan(req, rep)
  );
  fastify.put('/api/saas/plans/:id', superAdminGuard, (req, rep) =>
    saasSubscriptionController.updatePlan(req, rep)
  );
  fastify.delete('/api/saas/plans/:id', superAdminGuard, (req, rep) =>
    saasSubscriptionController.deletePlan(req, rep)
  );

  // Coupons
  fastify.get('/api/saas/coupons', superAdminGuard, (req, rep) =>
    saasSubscriptionController.listCoupons(req, rep)
  );
  fastify.post('/api/saas/coupons', superAdminGuard, (req, rep) =>
    saasSubscriptionController.createCoupon(req, rep)
  );
  fastify.put('/api/saas/coupons/:id', superAdminGuard, (req, rep) =>
    saasSubscriptionController.updateCoupon(req, rep)
  );

  // Subscriptions & Assignments
  fastify.get('/api/saas/subscriptions', superAdminGuard, (req, rep) =>
    saasSubscriptionController.listAllSubscriptions(req, rep)
  );
  fastify.post('/api/saas/subscriptions/assign', superAdminGuard, (req, rep) =>
    saasSubscriptionController.assignSubscription(req, rep)
  );
  fastify.post('/api/saas/subscriptions/manual-payment', superAdminGuard, (req, rep) =>
    saasSubscriptionController.recordManualPayment(req, rep)
  );
  fastify.get('/api/saas/companies/:companyId/subscription', superAdminGuard, (req, rep) =>
    saasSubscriptionController.getCompanySubscription(req, rep)
  );
  fastify.get('/api/saas/companies/:companyId/invoices', superAdminGuard, (req, rep) =>
    saasSubscriptionController.listCompanyInvoices(req, rep)
  );
}
