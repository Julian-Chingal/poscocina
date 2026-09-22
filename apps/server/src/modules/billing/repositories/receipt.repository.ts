import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IReceiptRepository } from '../interfaces/billing.repository.interface.js';

export class ReceiptRepository implements IReceiptRepository {
  constructor(private readonly database = db) {}

  async findPendingBills(venueId: string) {
    return await this.database.query.orders.findMany({
      where: (orders, { and, eq, inArray }) =>
        and(
          eq(orders.venueId, venueId),
          inArray(orders.status, ['sent_to_kitchen', 'partially_ready', 'ready', 'check_requested'])
        ),
      with: {
        table: true,
        waiter: { columns: { id: true, name: true } },
        items: { with: { product: true, modifiers: true } },
      },
      orderBy: (orders, { asc }) => [asc(orders.openedAt)],
    });
  }

  async findOrderWithVenue(orderId: string, tx = this.database) {
    const [order] = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) return null;

    const [venue] = await tx
      .select({ settings: schema.venues.settings })
      .from(schema.venues)
      .where(eq(schema.venues.id, order.venueId))
      .limit(1);

    return {
      order,
      venueSettings: (venue?.settings as Record<string, any>) || {},
    };
  }

  async createReceipt(data: any, tx = this.database) {
    const [receipt] = await tx.insert(schema.receipts).values(data).returning();
    return receipt;
  }

  async createPayments(receiptId: string, payments: any[], tx = this.database) {
    for (const p of payments) {
      await tx.insert(schema.receiptPayments).values({
        receiptId,
        method: p.method,
        amount: Number(p.amount).toFixed(2),
        reference: p.reference,
        tipAmount: Number(p.tipAmount || 0).toFixed(2),
      });
    }
  }

  async deductInventoryForItems(orderId: string, items: any[], tx = this.database) {
    const updatedStockItems: any[] = [];
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    if (productIds.length === 0) return updatedStockItems;

    const recipes = await tx
      .select()
      .from(schema.productRecipes)
      .where(inArray(schema.productRecipes.productId, productIds));

    for (const item of items) {
      const itemRecipes = recipes.filter((r) => r.productId === item.productId);
      for (const recipe of itemRecipes) {
        const qtyToDeduct = parseFloat(recipe.quantity) * item.quantity;

        await tx.insert(schema.inventoryMovements).values({
          inventoryItemId: recipe.inventoryItemId,
          movementType: 'sale',
          quantity: (-qtyToDeduct).toFixed(4),
          referenceId: orderId,
          notes: `Descuento automático por venta de orden #${orderId.slice(0, 8)}`,
        });

        const [updatedStock] = await tx
          .update(schema.inventoryItems)
          .set({
            currentStock: sql`GREATEST(0, ${schema.inventoryItems.currentStock} - ${qtyToDeduct})`,
            updatedAt: new Date(),
          })
          .where(eq(schema.inventoryItems.id, recipe.inventoryItemId))
          .returning();

        if (updatedStock) updatedStockItems.push(updatedStock);
      }
    }
    return updatedStockItems;
  }

  async markOrderPaid(orderId: string, data: any, tx = this.database) {
    await tx.update(schema.orders).set(data).where(eq(schema.orders.id, orderId));
  }

  async freeTable(tableId: string, tx = this.database) {
    await tx
      .update(schema.tables)
      .set({ status: 'free', currentOrderId: null, updatedAt: new Date() })
      .where(eq(schema.tables.id, tableId));
  }
}

export const receiptRepository = new ReceiptRepository();
