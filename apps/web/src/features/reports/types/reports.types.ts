export type ReportPeriod = 'today' | '7d' | 'month' | 'all';

export interface AuditLogItem {
  id: string;
  venueId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: any;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    roleId?: string;
  };
}

export interface PaymentMethodMetric {
  method: string;
  totalAmount: number;
  totalTip: number;
  count: number;
  percentage: number;
}

export interface OverviewMetrics {
  totalSales: number;
  subtotalSales: number;
  taxTotal: number;
  discountTotal: number;
  ticketCount: number;
  avgTicket: number;
  totalTips: number;
  paymentMethods: PaymentMethodMetric[];
}

export interface HourlySale {
  hour: number;
  hourLabel: string;
  sales: number;
  tickets: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  revenue: number;
}

export interface KdsMetrics {
  avgPrepMinutes: number;
  totalCompleted: number;
  totalPending: number;
  totalPreparing: number;
}

export interface CogsMetrics {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
}
