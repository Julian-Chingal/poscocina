import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { analyticsController } from './analytics.controller.js';

export async function analyticsRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };

  // Analytics
  fastify.get('/api/analytics/overview', managerGuard, (req, rep) => analyticsController.getOverview(req, rep));
  fastify.get('/api/analytics/hourly-sales', managerGuard, (req, rep) => analyticsController.getHourlySales(req, rep));
  fastify.get('/api/analytics/top-products', managerGuard, (req, rep) => analyticsController.getTopProducts(req, rep));
  fastify.get('/api/analytics/kds-metrics', managerGuard, (req, rep) => analyticsController.getKdsMetrics(req, rep));
  fastify.get('/api/analytics/cogs-profitability', managerGuard, (req, rep) => analyticsController.getCogsProfitability(req, rep));

  // Audit Logs
  fastify.get('/api/venues/:venueId/audit-logs', managerGuard, (req, rep) => analyticsController.getAuditLogs(req, rep));
  fastify.get('/api/audit-logs', managerGuard, (req, rep) => analyticsController.getAuditLogs(req, rep));
}
