import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';

export interface CreateOrderPayload {
  venueId: string;
  tableId?: string | null;
  orderType?: 'dine_in' | 'takeout' | 'delivery';
  waiterId?: string | null;
  guestCount?: number;
  notes?: string;
  items: Array<{
    productId: string;
    quantity?: number;
    unitPrice: number;
    notes?: string;
    seatNumber?: number;
    course?: number;
    modifiers?: Array<{ modifierId: string; priceDelta?: number }>;
  }>;
}

export class OrdersService {
  async createOrder(data: CreateOrderPayload) {
    const { venueId, tableId, waiterId, notes, items } = data;
    const orderType = data.orderType || 'dine_in';
    const guestCount = data.guestCount || 1;

    if (!items || items.length === 0) {
      throw new BadRequestError('La comanda debe contener al menos un ítem.');
    }

    return await db.transaction(async (tx) => {
      // 1. Calculate item totals and subtotal
      let subtotal = 0;
      for (const item of items) {
        const qty = item.quantity || 1;
        let itemTotal = item.unitPrice * qty;
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            itemTotal += (mod.priceDelta || 0) * qty;
          }
        }
        subtotal += itemTotal;
      }

      // Fetch venue settings to get configured tax rate (defaults to Colombian 8% INC)
      const [venueRecord] = await tx
        .select({ settings: schema.venues.settings })
        .from(schema.venues)
        .where(eq(schema.venues.id, venueId))
        .limit(1);

      const venueSettings = (venueRecord?.settings as Record<string, any>) || {};
      const taxRate = typeof venueSettings.defaultTaxRate === 'number'
        ? venueSettings.defaultTaxRate
        : typeof venueSettings.tax_rate === 'number'
        ? venueSettings.tax_rate
        : 0.08;

      const taxTotal = subtotal * taxRate;
      const total = subtotal + taxTotal;

      // 2. Insert master order
      const [newOrder] = await tx
        .insert(schema.orders)
        .values({
          venueId,
          tableId: tableId || null,
          orderType,
          waiterId: waiterId || null,
          guestCount: guestCount || 1,
          notes,
          status: 'sent_to_kitchen',
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          total: total.toFixed(2),
        })
        .returning();

      // 3. Insert order items & modifiers
      const createdItems = [];

      for (const item of items) {
        const [newItem] = await tx
          .insert(schema.orderItems)
          .values({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice.toFixed(2),
            notes: item.notes,
            seatNumber: item.seatNumber,
            course: item.course || 1,
            status: 'sent',
            sentAt: new Date(),
          })
          .returning();

        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            await tx.insert(schema.orderItemModifiers).values({
              orderItemId: newItem.id,
              modifierId: mod.modifierId,
              priceDelta: (mod.priceDelta || 0).toFixed(2),
            });
          }
        }

        createdItems.push(newItem);
      }

      // 4. Update table status if dine-in
      if (tableId) {
        await tx
          .update(schema.tables)
          .set({ status: 'occupied', currentOrderId: newOrder.id, updatedAt: new Date() })
          .where(eq(schema.tables.id, tableId));
      }

      return { order: newOrder, items: createdItems, tableId };
    });
  }

  async getKdsOrders(venueId: string) {
    return await db.query.orders.findMany({
      where: (orders, { and, eq, inArray }) =>
        and(
          eq(orders.venueId, venueId),
          inArray(orders.status, ['open', 'sent_to_kitchen', 'partially_ready'])
        ),
      with: {
        table: true,
        waiter: {
          columns: {
            id: true,
            name: true,
          },
        },
        items: {
          with: {
            product: true,
            modifiers: true,
          },
        },
      },
      orderBy: (orders, { asc }) => [asc(orders.openedAt)],
    });
  }

  async updateOrderItemStatus(
    id: string,
    status: 'pending' | 'sent' | 'in_preparation' | 'ready' | 'delivered' | 'cancelled'
  ) {
    const updateFields: Record<string, unknown> = { status };
    if (status === 'ready') updateFields.readyAt = new Date();
    if (status === 'delivered') updateFields.deliveredAt = new Date();

    const [updated] = await db
      .update(schema.orderItems)
      .set(updateFields)
      .where(eq(schema.orderItems.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError('Ítem de comanda no encontrado');
    }

    return updated;
  }
}

export const ordersService = new OrdersService();
