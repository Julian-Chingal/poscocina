import { FastifyInstance } from 'fastify';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export async function analyticsRoutes(fastify: FastifyInstance) {
  // 1. Overview KPIs & Payment Breakdown
  fastify.get('/api/analytics/overview', async (request, reply) => {
    const { venueId, from, to } = request.query as {
      venueId?: string;
      from?: string;
      to?: string;
    };

    // Find default venue if not supplied
    let targetVenueId = venueId;
    if (!targetVenueId) {
      const [firstVenue] = await db.select({ id: schema.venues.id }).from(schema.venues).limit(1);
      targetVenueId = firstVenue?.id;
    }

    if (!targetVenueId) {
      return reply.status(404).send({ error: 'Venue no encontrado' });
    }

    // Build date condition
    const conditions = [];
    if (from) {
      conditions.push(gte(schema.receipts.issuedAt, new Date(from)));
    }
    if (to) {
      conditions.push(lte(schema.receipts.issuedAt, new Date(to)));
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
      .where(and(eq(schema.orders.venueId, targetVenueId), ...conditions));

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
      .where(and(eq(schema.orders.venueId, targetVenueId), ...conditions))
      .groupBy(schema.receiptPayments.method);

    const totalTipsNum = paymentsSummary.reduce((acc, curr) => acc + Number(curr.totalTip || 0), 0);

    return reply.send({
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
    });
  });

  // 2. Hourly Sales Aggregation (00:00 to 23:00)
  fastify.get('/api/analytics/hourly-sales', async (request, reply) => {
    const { venueId, from, to } = request.query as {
      venueId?: string;
      from?: string;
      to?: string;
    };

    let targetVenueId = venueId;
    if (!targetVenueId) {
      const [firstVenue] = await db.select({ id: schema.venues.id }).from(schema.venues).limit(1);
      targetVenueId = firstVenue?.id;
    }

    if (!targetVenueId) {
      return reply.status(404).send({ error: 'Venue no encontrado' });
    }

    const conditions = [];
    if (from) {
      conditions.push(gte(schema.receipts.issuedAt, new Date(from)));
    }
    if (to) {
      conditions.push(lte(schema.receipts.issuedAt, new Date(to)));
    }

    // Extract hour from issued_at
    const hourlyData = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})::int`,
        sales: sql<string>`COALESCE(SUM(${schema.receipts.total}), 0)`,
        tickets: sql<number>`COUNT(${schema.receipts.id})::int`,
      })
      .from(schema.receipts)
      .innerJoin(schema.orders, eq(schema.receipts.orderId, schema.orders.id))
      .where(and(eq(schema.orders.venueId, targetVenueId), ...conditions))
      .groupBy(sql`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${schema.receipts.issuedAt})`);

    // Normalize into 24-hour array (0-23)
    const hourlyMap = new Map(hourlyData.map((d) => [d.hour, { sales: Number(d.sales), tickets: d.tickets }]));
    const result = Array.from({ length: 24 }, (_, i) => {
      const matched = hourlyMap.get(i);
      return {
        hour: i,
        hourLabel: `${i.toString().padStart(2, '0')}:00`,
        sales: matched?.sales || 0,
        tickets: matched?.tickets || 0,
      };
    });

    return reply.send(result);
  });

  // 3. Top Selling Products
  fastify.get('/api/analytics/top-products', async (request, reply) => {
    const { venueId, limit = '10' } = request.query as {
      venueId?: string;
      limit?: string;
    };

    let targetVenueId = venueId;
    if (!targetVenueId) {
      const [firstVenue] = await db.select({ id: schema.venues.id }).from(schema.venues).limit(1);
      targetVenueId = firstVenue?.id;
    }

    if (!targetVenueId) {
      return reply.status(404).send({ error: 'Venue no encontrado' });
    }

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
      .where(eq(schema.orders.venueId, targetVenueId))
      .groupBy(schema.products.id, schema.products.name, schema.categories.name, schema.products.price)
      .orderBy(desc(sql`SUM(${schema.orderItems.quantity} * ${schema.orderItems.unitPrice})`))
      .limit(Number(limit) || 10);

    return reply.send(
      topProducts.map((p) => ({
        id: p.productId,
        name: p.productName,
        category: p.categoryName,
        price: Number(p.unitPrice),
        quantity: p.totalQuantity,
        revenue: Number(p.totalRevenue),
      }))
    );
  });

  // 4. KDS Velocity & Kitchen Metrics
  fastify.get('/api/analytics/kds-metrics', async (request, reply) => {
    const { venueId } = request.query as { venueId?: string };

    let targetVenueId = venueId;
    if (!targetVenueId) {
      const [firstVenue] = await db.select({ id: schema.venues.id }).from(schema.venues).limit(1);
      targetVenueId = firstVenue?.id;
    }

    if (!targetVenueId) {
      return reply.status(404).send({ error: 'Venue no encontrado' });
    }

    // Average duration in minutes between sentAt and readyAt
    const [speedStats] = await db
      .select({
        avgPrepMinutes: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${schema.orderItems.readyAt} - ${schema.orderItems.sentAt})) / 60), 0)::float`,
        totalCompleted: sql<number>`COUNT(CASE WHEN ${schema.orderItems.status} IN ('ready', 'served') THEN 1 END)::int`,
        totalPending: sql<number>`COUNT(CASE WHEN ${schema.orderItems.status} = 'pending' THEN 1 END)::int`,
        totalPreparing: sql<number>`COUNT(CASE WHEN ${schema.orderItems.status} = 'in_prep' THEN 1 END)::int`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(eq(schema.orders.venueId, targetVenueId));

    return reply.send({
      avgPrepMinutes: Math.round(Number(speedStats?.avgPrepMinutes || 0) * 10) / 10,
      totalCompleted: speedStats?.totalCompleted || 0,
      totalPending: speedStats?.totalPending || 0,
      totalPreparing: speedStats?.totalPreparing || 0,
    });
  });

  // 5. COGS & Gross Profit Margins (Escandallos / Recipe Costing)
  fastify.get('/api/analytics/cogs-profitability', async (request, reply) => {
    const { venueId } = request.query as { venueId?: string };

    let targetVenueId = venueId;
    if (!targetVenueId) {
      const [firstVenue] = await db.select({ id: schema.venues.id }).from(schema.venues).limit(1);
      targetVenueId = firstVenue?.id;
    }

    if (!targetVenueId) {
      return reply.status(404).send({ error: 'Venue no encontrado' });
    }

    // Calculate total product sales revenue
    const [revenueRes] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${schema.orderItems.quantity} * ${schema.orderItems.unitPrice}), 0)`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(eq(schema.orders.venueId, targetVenueId));

    const totalRevenue = Number(revenueRes?.totalRevenue || 0);

    // Calculate theoretical COGS based on recipes of items sold
    const [cogsRes] = await db
      .select({
        totalCogs: sql<string>`COALESCE(SUM(${schema.orderItems.quantity} * ${schema.productRecipes.quantity} * ${schema.inventoryItems.costPerUnit}), 0)`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .innerJoin(schema.productRecipes, eq(schema.orderItems.productId, schema.productRecipes.productId))
      .innerJoin(schema.inventoryItems, eq(schema.productRecipes.inventoryItemId, schema.inventoryItems.id))
      .where(eq(schema.orders.venueId, targetVenueId));

    const totalCogs = Number(cogsRes?.totalCogs || 0);
    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPct = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 1000) / 10 : 0;

    return reply.send({
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMarginPct,
    });
  });
}
