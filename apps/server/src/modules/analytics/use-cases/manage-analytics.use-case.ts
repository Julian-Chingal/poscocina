import { IAnalyticsRepository } from '../interfaces/analytics.repository.interface.js';

export class ManageAnalyticsUseCase {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async getOverview(venueId: string, range: { from?: string; to?: string }) {
    return await this.repo.getOverviewKpis(venueId, range);
  }

  async getHourlySales(venueId: string, range: { from?: string; to?: string }) {
    return await this.repo.getHourlySales(venueId, range);
  }

  async getTopProducts(venueId: string, limit = 10) {
    return await this.repo.getTopSellingProducts(venueId, limit);
  }

  async getKdsMetrics(venueId: string) {
    return await this.repo.getKdsMetrics(venueId);
  }

  async getCogsProfitability(venueId: string) {
    return await this.repo.getCogsProfitability(venueId);
  }

  async getAuditLogs(venueId: string, options: { action?: string; limit?: number }) {
    return await this.repo.getAuditLogs(venueId, options);
  }
}
