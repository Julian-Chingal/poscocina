import { FastifyRequest, FastifyReply } from 'fastify';
import { analyticsService } from '../services/analytics.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';

export class AnalyticsController {
  async getOverview(request: FastifyRequest, reply: FastifyReply) {
    const { from, to } = request.query as { from?: string; to?: string };
    const venueId = await resolveVenueId(request);

    const overview = await analyticsService.getOverviewKpis(venueId, { from, to });
    return reply.send(overview);
  }

  async getHourlySales(request: FastifyRequest, reply: FastifyReply) {
    const { from, to } = request.query as { from?: string; to?: string };
    const venueId = await resolveVenueId(request);

    const hourly = await analyticsService.getHourlySales(venueId, { from, to });
    return reply.send(hourly);
  }

  async getTopProducts(request: FastifyRequest, reply: FastifyReply) {
    const { limit } = request.query as { limit?: string };
    const venueId = await resolveVenueId(request);

    const top = await analyticsService.getTopSellingProducts(venueId, Number(limit) || 10);
    return reply.send(top);
  }

  async getKdsMetrics(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);

    const metrics = await analyticsService.getKdsMetrics(venueId);
    return reply.send(metrics);
  }

  async getCogsProfitability(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);

    const cogs = await analyticsService.getCogsProfitability(venueId);
    return reply.send(cogs);
  }
}

export const analyticsController = new AnalyticsController();
