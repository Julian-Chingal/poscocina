import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export interface AnalyticsDateFilter {
  from?: string;
  to?: string;
}

export class AnalyticsService {
  async getOverviewKpis(venueId: string, filter?: AnalyticsDateFilter) {
    const conditions = [];
    if (filter?.from) {
      conditions.push(gte(schema.receipts.issuedAt, new Date(filter.from)));
    }
    if (filter?.to) {
      conditions.push(lte(schema.receipts.issuedAt, new Date(filter.to)));
    }

    // Receipts summary
    const [receiptsSummary] = await db
      .select({
        totalSales: sql<string>`COALESCE(SUM(${schema.receipts.total}), 0)`,
        subtotalSales: sql<string>`COALESCE(SUM(${schema.receipts.subtotal}), 0)`,
        taxTotal: sql<string>`COALESCE(SUM(${schema.receipts.taxTotal}), 0)`,
        discountTotal: sql<string>`COALESCE(SUM(${schema.receipts.discountTotal}), 0)`,
        ticketCount: sql<number>`COUNT(${schema.receipts.id})::int`,
      })
      .from(schema.receipts)
      .innerJoin(schema.orders, eq(schema.receipts.orderId, schema.orders.id))
      .where(and(eq(schema.orders.venueId, venueId), ...conditions));

    const totalSalesNum = Number(receiptsSummary?.totalSales || 0);
    const ticketCountNum = Number(receiptsSummary?.ticketCount || 0);
    const avgTicket = ticketCountNum > 0 ? totalSalesNum / ticketCountNum : 0;

    // Payments breakdown
    const paymentsSummary = await db
      .select({
        method: schema.receiptPayments.method,
        totalAmount: sql<string>`COALESCE(SUM(${schema.receiptPayments.amount}), 0)`,
        totalTip: sql<string>`COALESCE(SUM(${schema.receiptPayments.tipAmount}), 0)`,
        transactionCount: sql<number>`COUNT(${schema.receiptPayments.id})::int`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .innerJoin(schema.orders, eq(schema.receipts.orderId, schema.orders.id))
      .where(and(eq(schema.orders.venueId, venueId), ...conditions))
      .groupBy(schema.receiptPayments.method);

    const totalTipsNum = paymentsSummary.reduce((acc, curr) => acc + Number(curr.totalTip || 0), 0);

    return {
      totalSales: totalSalesNum,
      subtotalSales: Number(receiptsSummary?.subtotalSales || 0),
      taxTotal: Number(receiptsSummary?.taxTotal || 0),
      discountTotal: Number(receiptsSummary?.discountTotal || 0),
      ticketCount: ticketCountNum,
      avgTicket,
      totalTips: totalTipsNum,
      paymentMethods: paymentsSummary.map((p) => ({
        method: p.method,
        totalAmount: Number(p.totalAmount),
        totalTip: Number(p.totalTip),
        count: Number(p.transactionCount),
        percentage: totalSalesNum > 0 ? Math.round((Number(p.totalAmount) / totalSalesNum) * 100) : 0,
      })),
    };
  }

  async getHourlySales(venueId: string, filter?: AnalyticsDateFilter) {
    const conditions = [];
    if (filter?.from) {
      conditions.push(gte(schema.receipts.issuedAt, new Date(filter.from)));
    }
    if (filter?.to) {
      conditions.push(lte(schema.receipts.issuedAt, new Date(filter.to)));
    }

    const hourlyData = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})::int`,
        sales: sql<string>`COALESCE(SUM(${schema.receipts.total}), 0)`,
        tickets: sql<number>`COUNT(${schema.receipts.id})::int`,
      })
      .from(schema.receipts)
      .innerJoin(schema.orders, eq(schema.receipts.orderId, schema.orders.id))
      .where(and(eq(schema.orders.venueId, venueId), ...conditions))
      .groupBy(sql`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})`);

    const hourlyMap = new Map(hourlyData.map((d) => [d.hour, { sales: Number(d.sales), tickets: d.tickets }]));
    return Array.from({ length: 24 }, (_, i) => {
      const matched = hourlyMap.get(i);
      return {
        hour: i,
        hourLabel: `${i.toString().padStart(2, '0')}:00`,
        sales: matched?.sales || 0,
        tickets: matched?.tickets || 0,
      };
    });
  }

  async getTopSellingProducts(venueId: string, limit = 10) {
    const topProducts = await db
      .select({
        productId: schema.products.id,
        productName: schema.products.name,
        categoryName: schema.categories.name,
        unitPrice: schema.products.price,
        totalQuantity: sql<number>`COALESCE(SUM(${schema.orderItems.quantity}), 0)::int`,
        totalRevenue: sql<string>`COALESCE(SUM(${schema.orderItems.quantity} * ${schema.orderItems.unitPrice}), 0)`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(eq(schema.orders.venueId, venueId))
      .groupBy(schema.products.id, schema.products.name, schema.categories.name, schema.products.price)
      .orderBy(desc(sql`SUM(${schema.orderItems.quantity} * ${schema.orderItems.unitPrice})`))
      .limit(limit);

    return topProducts.map((p) => ({
      id: p.productId,
      name: p.productName,
      category: p.categoryName,
      price: Number(p.unitPrice),
      quantity: p.totalQuantity,
      revenue: Number(p.totalRevenue),
    }));
  }

  async getKdsMetrics(venueId: string) {
    const [speedStats] = await db
      .select({
        avgPrepMinutes: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${schema.orderItems.readyAt} - ${schema.orderItems.sentAt})) / 60), 0)::float`,
        totalCompleted: sql<number>`COUNT(CASE WHEN ${schema.orderItems.status} IN ('ready', 'served') THEN 1 END)::int`,
        totalPending: sql<number>`COUNT(CASE WHEN ${schema.orderItems.status} = 'pending' THEN 1 END)::int`,
        totalPreparing: sql<number>`COUNT(CASE WHEN ${schema.orderItems.status} = 'in_prep' THEN 1 END)::int`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(eq(schema.orders.venueId, venueId));

    return {
      avgPrepMinutes: Math.round(Number(speedStats?.avgPrepMinutes || 0) * 10) / 10,
      totalCompleted: speedStats?.totalCompleted || 0,
      totalPending: speedStats?.totalPending || 0,
      totalPreparing: speedStats?.totalPreparing || 0,
    };
  }

  async getCogsProfitability(venueId: string) {
    const [revenueRes] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${schema.orderItems.quantity} * ${schema.orderItems.unitPrice}), 0)`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(eq(schema.orders.venueId, venueId));

    const totalRevenue = Number(revenueRes?.totalRevenue || 0);

    const [cogsRes] = await db
      .select({
        totalCogs: sql<string>`COALESCE(SUM(${schema.orderItems.quantity} * ${schema.productRecipes.quantity} * ${schema.inventoryItems.costPerUnit}), 0)`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .innerJoin(schema.productRecipes, eq(schema.orderItems.productId, schema.productRecipes.productId))
      .innerJoin(schema.inventoryItems, eq(schema.productRecipes.inventoryItemId, schema.inventoryItems.id))
      .where(eq(schema.orders.venueId, venueId));

    const totalCogs = Number(cogsRes?.totalCogs || 0);
    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPct = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 1000) / 10 : 0;

    return {
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMarginPct,
    };
  }
}

export const analyticsService = new AnalyticsService();
