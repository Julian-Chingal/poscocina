import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { analyticsController } from '../controllers/analytics.controller.js';

export async function analyticsRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };

  // 1. Overview KPIs & Payment Breakdown
  fastify.get('/api/analytics/overview', managerGuard, (request, reply) =>
    analyticsController.getOverview(request, reply)
  );

  // 2. Hourly Sales Aggregation (00:00 to 23:00)
  fastify.get('/api/analytics/hourly-sales', managerGuard, (request, reply) =>
    analyticsController.getHourlySales(request, reply)
  );

  // 3. Top Selling Products
  fastify.get('/api/analytics/top-products', managerGuard, (request, reply) =>
    analyticsController.getTopProducts(request, reply)
  );

  // 4. KDS Velocity & Kitchen Metrics
  fastify.get('/api/analytics/kds-metrics', managerGuard, (request, reply) =>
    analyticsController.getKdsMetrics(request, reply)
  );

  // 5. COGS & Gross Profit Margins (Escandallos / Recipe Costing)
  fastify.get('/api/analytics/cogs-profitability', managerGuard, (request, reply) =>
    analyticsController.getCogsProfitability(request, reply)
  );
}
