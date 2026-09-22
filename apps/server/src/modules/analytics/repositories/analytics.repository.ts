import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IAnalyticsRepository } from '../interfaces/analytics.repository.interface.js';

export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly database = db) {}

  async getOverviewKpis(venueId: string, filter?: { from?: string; to?: string }) {
    const conditions = [];
    if (filter?.from) conditions.push(gte(schema.receipts.issuedAt, new Date(filter.from)));
    if (filter?.to) conditions.push(lte(schema.receipts.issuedAt, new Date(filter.to)));

    const [receiptsSummary] = await this.database
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

    const paymentsSummary = await this.database
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
      salesByPaymentMethod: paymentsSummary.map((p) => ({
        method: p.method,
        total: Number(p.totalAmount),
        tip: Number(p.totalTip),
        count: p.transactionCount,
      })),
    };
  }

  async getHourlySales(venueId: string, filter?: { from?: string; to?: string }) {
    const conditions = [];
    if (filter?.from) conditions.push(gte(schema.receipts.issuedAt, new Date(filter.from)));
    if (filter?.to) conditions.push(lte(schema.receipts.issuedAt, new Date(filter.to)));

    const results = await this.database
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})::int`,
        sales: sql<string>`COALESCE(SUM(${schema.receipts.total}), 0)`,
        orderCount: sql<number>`COUNT(${schema.receipts.id})::int`,
      })
      .from(schema.receipts)
      .innerJoin(schema.orders, eq(schema.receipts.orderId, schema.orders.id))
      .where(and(eq(schema.orders.venueId, venueId), ...conditions))
      .groupBy(sql`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})`);

    return results.map((r) => ({
      hour: r.hour,
      hourLabel: `${String(r.hour).padStart(2, '0')}:00`,
      sales: Number(r.sales),
      orderCount: r.orderCount,
    }));
  }

  async getTopSellingProducts(venueId: string, limit = 10) {
    const results = await this.database
      .select({
        productId: schema.orderItems.productId,
        productName: schema.products.name,
        categoryName: schema.categories.name,
        totalQuantity: sql<number>`SUM(${schema.orderItems.quantity})::int`,
        totalRevenue: sql<string>`SUM(${schema.orderItems.quantity} * ${schema.orderItems.unitPrice})`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(and(eq(schema.orders.venueId, venueId), eq(schema.orders.status, 'paid')))
      .groupBy(schema.orderItems.productId, schema.products.name, schema.categories.name)
      .orderBy(desc(sql`SUM(${schema.orderItems.quantity})`))
      .limit(limit);

    return results.map((r) => ({
      productId: r.productId,
      name: r.productName,
      category: r.categoryName,
      unitsSold: r.totalQuantity,
      revenue: Number(r.totalRevenue),
    }));
  }

  async getKdsMetrics(venueId: string) {
    const [speedMetrics] = await this.database
      .select({
        avgPrepSeconds: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${schema.orderItems.readyAt} - ${schema.orderItems.sentAt}))), 0)::int`,
        countPrepared: sql<number>`COUNT(${schema.orderItems.id})::int`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.orders.venueId, venueId),
          sql`${schema.orderItems.sentAt} IS NOT NULL`,
          sql`${schema.orderItems.readyAt} IS NOT NULL`
        )
      );

    return {
      avgPrepTimeMinutes: Math.round(((speedMetrics?.avgPrepSeconds || 0) / 60) * 10) / 10,
      totalOrdersPrepared: speedMetrics?.countPrepared || 0,
      targetMinutes: 15,
    };
  }

  async getCogsProfitability(venueId: string) {
    const rawItems = await this.database
      .select({
        productId: schema.orderItems.productId,
        productName: schema.products.name,
        sellingPrice: schema.orderItems.unitPrice,
        quantity: schema.orderItems.quantity,
      })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(and(eq(schema.orders.venueId, venueId), eq(schema.orders.status, 'paid')));

    const productTotals: Record<string, { name: string; units: number; revenue: number }> = {};
    for (const item of rawItems) {
      if (!productTotals[item.productId]) {
        productTotals[item.productId] = { name: item.productName, units: 0, revenue: 0 };
      }
      productTotals[item.productId].units += item.quantity;
      productTotals[item.productId].revenue += Number(item.sellingPrice) * item.quantity;
    }

    return Object.entries(productTotals).map(([id, p]) => ({
      productId: id,
      name: p.name,
      unitsSold: p.units,
      totalRevenue: p.revenue,
      estimatedCogs: p.revenue * 0.35,
      grossProfit: p.revenue * 0.65,
      profitMarginPct: 65,
    }));
  }

  async getAuditLogs(venueId: string, options: { action?: string; limit?: number }) {
    const limit = options?.limit || 50;
    return await this.database.query.auditLogs.findMany({
      where: (logs, { and, eq }) =>
        options?.action ? and(eq(logs.venueId, venueId), eq(logs.action, options.action)) : eq(logs.venueId, venueId),
      with: {
        user: { columns: { id: true, name: true, roleId: true } },
      },
      orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      limit,
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
