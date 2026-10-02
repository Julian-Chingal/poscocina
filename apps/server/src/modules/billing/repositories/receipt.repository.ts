import { eq, inArray, sql, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IReceiptRepository } from '../interfaces/billing.repository.interface.js';

export class ReceiptRepository implements IReceiptRepository {
  constructor(private readonly database = db) {}

  async findPendingBills(venueId: string) {
    const rawOrders = await this.database.query.orders.findMany({
      where: (orders, { and, eq, notInArray }) =>
        and(
          eq(orders.venueId, venueId),
          notInArray(orders.status, ['cancelled', 'voided'])
        ),
      with: {
        table: true,
        waiter: { columns: { id: true, name: true } },
        items: {
          with: {
            product: true,
            modifiers: { with: { modifier: true } },
          },
        },
        receipts: { with: { payments: true } },
      },
      orderBy: (orders, { asc }) => [asc(orders.openedAt)],
    });

    return rawOrders
      .map((order) => {
        const totalPaid = (order.receipts || []).reduce((acc: number, r: any) => {
          return acc + parseFloat(r.total || '0');
        }, 0);
        const orderTotal = parseFloat(order.total || '0');
        const pendingBalance = Math.max(0, orderTotal - totalPaid);

        return {
          ...order,
          totalPaid: totalPaid.toFixed(2),
          pendingBalance: pendingBalance.toFixed(2),
        };
      })
      .filter((order) => {
        const balance = parseFloat(order.pendingBalance);
        return balance > 0.009 || order.paymentStatus !== 'paid';
      });
  }

  async findOrderWithVenue(orderId: string, tx = this.database) {
    const [order] = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) return null;

    const [venue] = await tx
      .select({ settings: schema.venues.settings, companyId: schema.venues.companyId })
      .from(schema.venues)
      .where(eq(schema.venues.id, order.venueId))
      .limit(1);

    let [fiscal] = await tx
      .select()
      .from(schema.companyFiscalSettings)
      .where(venue?.companyId ? eq(schema.companyFiscalSettings.companyId, venue.companyId) : sql`1=1`)
      .limit(1);

    const mergedSettings = {
      ...(venue?.settings as Record<string, any>),
      ...(fiscal
        ? {
            taxType: fiscal.taxType,
            taxRate: Number(fiscal.taxRate),
            defaultTaxRate: Number(fiscal.taxRate),
            defaultTipPct: Number(fiscal.defaultTipPct),
            regime: fiscal.regime,
            receiptHeader: fiscal.receiptHeader,
            receiptFooter: fiscal.receiptFooter,
            invoicePrefix: fiscal.invoicePrefix,
            invoiceResolution: fiscal.invoiceResolution,
          }
        : {}),
    };

    return {
      order,
      venueSettings: mergedSettings,
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

    // Solo descontar si el producto tiene activa la opción de descuento de inventario (track_inventory = true)
    const trackableProducts = await tx
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(and(inArray(schema.products.id, productIds), eq(schema.products.trackInventory, true)));

    const trackableIds = new Set(trackableProducts.map((p) => p.id));
    if (trackableIds.size === 0) return updatedStockItems;

    const recipes = await tx
      .select()
      .from(schema.productRecipes)
      .where(inArray(schema.productRecipes.productId, Array.from(trackableIds)));

    for (const item of items) {
      if (!trackableIds.has(item.productId)) continue;

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

  async setTableWaitingFood(tableId: string, tx = this.database) {
    await tx
      .update(schema.tables)
      .set({ status: 'paid_waiting_food', updatedAt: new Date() })
      .where(eq(schema.tables.id, tableId));
  }
}


export const receiptRepository = new ReceiptRepository();
