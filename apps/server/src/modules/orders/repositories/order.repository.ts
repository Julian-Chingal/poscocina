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
    const order = await this.database.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
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
    });

    if (!order) return null;

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
  }

  async findKdsOrders(venueId: string, station?: string, includeRecentCompleted = false) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const rawOrders = await this.database.query.orders.findMany({
      where: (orders, { and, or, eq, notInArray, gte }) => {
        const baseFilter = and(
          eq(orders.venueId, venueId),
          notInArray(orders.status, ['cancelled', 'voided'])
        );

        if (includeRecentCompleted) {
          return and(
            baseFilter,
            or(
              notInArray(orders.kitchenStatus, ['delivered', 'cancelled']),
              and(
                eq(orders.kitchenStatus, 'delivered'),
                gte(orders.closedAt, tenMinutesAgo)
              )
            )
          );
        }

        return and(
          baseFilter,
          notInArray(orders.kitchenStatus, ['delivered', 'cancelled'])
        );
      },
      with: {
        table: true,
        waiter: { columns: { id: true, name: true } },
        items: {
          with: {
            product: true,
            modifiers: { with: { modifier: true } },
          },
        },
      },
    });

    const filtered = !station
      ? rawOrders
      : rawOrders
          .map((ord) => ({
            ...ord,
            items: ord.items.filter((item: any) => item.product?.printerStation === station),
          }))
          .filter((ord) => ord.items.length > 0);

    // FIFO (First In, First Out) strict sorting by the earliest sentAt / openedAt
    return filtered.sort((a, b) => {
      const getEarliestTime = (ord: any) => {
        const times = ord.items
          .map((it: any) => (it.sentAt ? new Date(it.sentAt).getTime() : null))
          .filter(Boolean);
        if (times.length > 0) {
          return Math.min(...times);
        }
        return new Date(ord.openedAt).getTime();
      };
      return getEarliestTime(a) - getEarliestTime(b);
    });
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

  async updateOrderItemStatus(itemId: string, status: any, extra?: Record<string, any>, tx = this.database) {
    const [updated] = await tx
      .update(schema.orderItems)
      .set({ status, ...(extra || {}) })
      .where(eq(schema.orderItems.id, itemId))
      .returning();
    return updated;
  }

  async updateOrderItemData(itemId: string, data: Record<string, any>, tx = this.database) {
    const [updated] = await tx
      .update(schema.orderItems)
      .set(data)
      .where(eq(schema.orderItems.id, itemId))
      .returning();
    return updated;
  }

  async deleteOrderItem(itemId: string, tx = this.database) {
    await tx.delete(schema.orderItems).where(eq(schema.orderItems.id, itemId));
  }

  async deleteItemModifiers(itemId: string, tx = this.database) {
    await tx.delete(schema.orderItemModifiers).where(eq(schema.orderItemModifiers.orderItemId, itemId));
  }

  async findOrderItemById(itemId: string, tx = this.database) {
    const [item] = await tx
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.id, itemId))
      .limit(1);
    return item || null;
  }

  async findOrderItemWithOrder(itemId: string, tx = this.database) {
    return await this.database.query.orderItems.findFirst({
      where: (orderItems, { eq }) => eq(orderItems.id, itemId),
      with: {
        product: true,
        modifiers: { with: { modifier: true } },
        order: {
          with: {
            table: true,
            waiter: { columns: { id: true, name: true } },
          },
        },
      },
    });
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
