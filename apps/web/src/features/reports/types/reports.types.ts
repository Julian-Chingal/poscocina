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
  total?: number;
  tip?: number;
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
  salesByPaymentMethod?: PaymentMethodMetric[];
}

export interface HourlySale {
  hour: number;
  hourLabel: string;
  sales: number;
  tickets: number;
  orderCount?: number;
}

export interface TopProduct {
  id: string;
  productId?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unitsSold?: number;
  revenue: number;
}

export interface KdsMetrics {
  avgPrepMinutes: number;
  avgPrepTimeMinutes?: number;
  totalCompleted: number;
  totalOrdersPrepared?: number;
  totalPending: number;
  totalPreparing: number;
  targetMinutes?: number;
}

export interface CogsMetrics {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
  items?: Array<{
    productId: string;
    name: string;
    unitsSold: number;
    totalRevenue: number;
    estimatedCogs: number;
    grossProfit: number;
    profitMarginPct: number;
  }>;
}
