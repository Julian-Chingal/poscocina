import { FastifyRequest, FastifyReply } from 'fastify';
import { analyticsRepository } from './repositories/analytics.repository.js';
import { ManageAnalyticsUseCase } from './use-cases/manage-analytics.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';

export class AnalyticsController {
  private readonly useCase = new ManageAnalyticsUseCase(analyticsRepository);

  async getOverview(request: FastifyRequest, reply: FastifyReply) {
    const { from, to } = request.query as { from?: string; to?: string };
    const venueId = await resolveVenueId(request);
    return reply.send(await this.useCase.getOverview(venueId, { from, to }));
  }

  async getHourlySales(request: FastifyRequest, reply: FastifyReply) {
    const { from, to } = request.query as { from?: string; to?: string };
    const venueId = await resolveVenueId(request);
    return reply.send(await this.useCase.getHourlySales(venueId, { from, to }));
  }

  async getTopProducts(request: FastifyRequest, reply: FastifyReply) {
    const { limit } = request.query as { limit?: string };
    const venueId = await resolveVenueId(request);
    return reply.send(await this.useCase.getTopProducts(venueId, Number(limit) || 10));
  }

  async getKdsMetrics(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    return reply.send(await this.useCase.getKdsMetrics(venueId));
  }

  async getCogsProfitability(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    return reply.send(await this.useCase.getCogsProfitability(venueId));
  }

  async getAuditLogs(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const { action, limit } = request.query as { action?: string; limit?: string };
    return reply.send(await this.useCase.getAuditLogs(venueId, { action, limit: limit ? parseInt(limit, 10) : 50 }));
  }
}

export const analyticsController = new AnalyticsController();
