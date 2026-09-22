import { eq, and, inArray, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IOrderRepository } from '../interfaces/order.repository.interface.js';

export class OrderRepository implements IOrderRepository {
  constructor(private readonly database = db) {}

  async findActiveShift(venueId: string, tx = this.database) {
    const [shift] = await tx
      .select()
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venueId), eq(schema.cashShifts.status, 'open')))
      .limit(1);
    return shift || null;
  }

  async findOrderById(orderId: string, tx = this.database) {
    return await this.database.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
      with: {
        table: true,
        waiter: { columns: { id: true, name: true } },
        items: { with: { product: true, modifiers: true } },
      },
    });
  }

  async findKdsOrders(venueId: string, station?: string) {
    const rawOrders = await this.database.query.orders.findMany({
      where: (orders, { and, eq, inArray }) =>
        and(
          eq(orders.venueId, venueId),
          inArray(orders.status, ['sent_to_kitchen', 'partially_ready', 'ready'])
        ),
      with: {
        table: true,
        waiter: { columns: { id: true, name: true } },
        items: {
          with: { product: true, modifiers: true },
        },
      },
      orderBy: (orders, { asc }) => [asc(orders.openedAt)],
    });

    if (!station) return rawOrders;

    return rawOrders
      .map((ord) => ({
        ...ord,
        items: ord.items.filter((item: any) => item.product?.printerStation === station),
      }))
      .filter((ord) => ord.items.length > 0);
  }

  async createOrder(data: any, tx = this.database) {
    const [created] = await tx.insert(schema.orders).values(data).returning();
    return created;
  }

  async insertOrderItems(items: any[], tx = this.database) {
    return await tx.insert(schema.orderItems).values(items).returning();
  }

  async insertItemModifiers(modifiers: any[], tx = this.database) {
    if (modifiers.length > 0) {
      await tx.insert(schema.orderItemModifiers).values(modifiers);
    }
  }

  async updateTableOccupied(tableId: string, orderId: string, tx = this.database) {
    await tx
      .update(schema.tables)
      .set({ status: 'occupied', currentOrderId: orderId, updatedAt: new Date() })
      .where(eq(schema.tables.id, tableId));
  }

  async updateOrderStatus(orderId: string, status: any) {
    const [updated] = await this.database
      .update(schema.orders)
      .set({ status })
      .where(eq(schema.orders.id, orderId))
      .returning();
    return updated;
  }

  async updateOrderItemStatus(itemId: string, status: any) {
    const [updated] = await this.database
      .update(schema.orderItems)
      .set({ status })
      .where(eq(schema.orderItems.id, itemId))
      .returning();
    return updated;
  }

  async updateOrderTotals(orderId: string, subtotal: string, taxTotal: string, total: string, tx = this.database) {
    const [updated] = await tx
      .update(schema.orders)
      .set({ subtotal, taxTotal, total })
      .where(eq(schema.orders.id, orderId))
      .returning();
    return updated;
  }
}

export const orderRepository = new OrderRepository();
