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
      where: (orders, { and, eq, notInArray }) =>
        and(
          eq(orders.venueId, venueId),
          notInArray(orders.kitchenStatus, ['delivered', 'cancelled']),
          notInArray(orders.status, ['cancelled', 'voided'])
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

  async findOrderItemById(itemId: string, tx = this.database) {
    const [item] = await tx
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.id, itemId))
      .limit(1);
    return item || null;
  }

  async findOrderItemsByOrderId(orderId: string, tx = this.database) {
    return await tx
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, orderId));
  }

  async updateOrderKitchenStatus(
    orderId: string,
    kitchenStatus: string,
    extra?: Record<string, any>,
    tx = this.database
  ) {
    const [updated] = await tx
      .update(schema.orders)
      .set({ kitchenStatus, ...(extra || {}) })
      .where(eq(schema.orders.id, orderId))
      .returning();
    return updated;
  }

  async freeTable(tableId: string, tx = this.database) {
    await tx
      .update(schema.tables)
      .set({ status: 'free', currentOrderId: null, updatedAt: new Date() })
      .where(eq(schema.tables.id, tableId));
  }

  async setTableStatus(tableId: string, status: any, tx = this.database) {
    await tx
      .update(schema.tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.tables.id, tableId));
  }

  async updateOrderTotals(
    orderId: string,
    subtotal: string,
    taxTotal: string,
    total: string,
    extra?: Record<string, any>,
    tx = this.database
  ) {
    const [updated] = await tx
      .update(schema.orders)
      .set({ subtotal, taxTotal, total, ...(extra || {}) })
      .where(eq(schema.orders.id, orderId))
      .returning();
    return updated;
  }
}

export const orderRepository = new OrderRepository();
