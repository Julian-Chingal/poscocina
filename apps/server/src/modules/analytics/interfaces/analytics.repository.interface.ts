export interface IAnalyticsRepository {
  getOverviewKpis(venueId: string, range: { from?: string; to?: string }): Promise<any>;
  getHourlySales(venueId: string, range: { from?: string; to?: string }): Promise<any>;
  getTopSellingProducts(venueId: string, limit?: number): Promise<any>;
  getKdsMetrics(venueId: string): Promise<any>;
  getCogsProfitability(venueId: string): Promise<any>;
  getAuditLogs(venueId: string, options: { action?: string; limit?: number }): Promise<any>;
}
