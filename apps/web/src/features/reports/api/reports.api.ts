import { api } from '@/services/api';
import {
  OverviewMetrics,
  HourlySale,
  TopProduct,
  KdsMetrics,
  CogsMetrics,
  AuditLogItem,
} from '../types/reports.types';

export const reportsApi = {
  getOverview: (params: any): Promise<OverviewMetrics> =>
    api.get('/analytics/overview', { params }),

  getHourlySales: (params: any): Promise<HourlySale[]> =>
    api.get('/analytics/hourly-sales', { params }),

  getTopProducts: (params: any): Promise<TopProduct[]> =>
    api.get('/analytics/top-products', { params }),

  getKdsMetrics: (params: any): Promise<KdsMetrics> =>
    api.get('/analytics/kds-metrics', { params }),

  getCogsProfitability: (params: any): Promise<CogsMetrics> =>
    api.get('/analytics/cogs-profitability', { params }),

  getAuditLogs: (venueId: string, action?: string): Promise<AuditLogItem[]> => {
    const url = action && action !== 'all'
      ? `/audit?venueId=${venueId}&action=${action}`
      : `/audit?venueId=${venueId}`;
    return api.get(url);
  },
};
