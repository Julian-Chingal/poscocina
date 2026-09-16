import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';
import { auditService } from './audit.service.js';

export interface CreateOrderPayload {
  venueId: string;
  tableId?: string | null;
  customerId?: string | null;
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
    const { venueId, tableId, customerId, waiterId, notes, items } = data;
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
          customerId: customerId || null,
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

  async getOrderById(id: string) {
    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, id),
      with: {
        table: true,
        customer: true,
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
    });

    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    return order;
  }

  async appendItemsToOrder(
    orderId: string,
    items: Array<{
      productId: string;
      quantity?: number;
      unitPrice: number;
      notes?: string;
      seatNumber?: number;
      course?: number;
      modifiers?: Array<{ modifierId: string; priceDelta?: number }>;
    }>
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestError('Debe incluir al menos un ítem para anexar a la comanda.');
    }

    const [existingOrder] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!existingOrder) {
      throw new NotFoundError('Orden no encontrada');
    }

    if (
      existingOrder.status === 'paid' ||
      existingOrder.status === 'cancelled' ||
      existingOrder.status === 'voided'
    ) {
      throw new BadRequestError('No se pueden anexar productos a una orden pagada o cancelada.');
    }

    return await db.transaction(async (tx) => {
      let additionalSubtotal = 0;
      for (const item of items) {
        const qty = item.quantity || 1;
        let itemTotal = item.unitPrice * qty;
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            itemTotal += (mod.priceDelta || 0) * qty;
          }
        }
        additionalSubtotal += itemTotal;
      }

      const [venueRecord] = await tx
        .select({ settings: schema.venues.settings })
        .from(schema.venues)
        .where(eq(schema.venues.id, existingOrder.venueId))
        .limit(1);

      const venueSettings = (venueRecord?.settings as Record<string, any>) || {};
      const taxRate =
        typeof venueSettings.defaultTaxRate === 'number'
          ? venueSettings.defaultTaxRate
          : typeof venueSettings.tax_rate === 'number'
          ? venueSettings.tax_rate
          : 0.08;

      const currentSubtotal = parseFloat(existingOrder.subtotal || '0');
      const newSubtotal = currentSubtotal + additionalSubtotal;
      const newTaxTotal = newSubtotal * taxRate;
      const newTotal = newSubtotal + newTaxTotal;

      const [updatedOrder] = await tx
        .update(schema.orders)
        .set({
          subtotal: newSubtotal.toFixed(2),
          taxTotal: newTaxTotal.toFixed(2),
          total: newTotal.toFixed(2),
          status: 'sent_to_kitchen',
        })
        .where(eq(schema.orders.id, orderId))
        .returning();

      const createdItems = [];
      for (const item of items) {
        const [newItem] = await tx
          .insert(schema.orderItems)
          .values({
            orderId,
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

        const [itemWithProduct] = await tx
          .select({
            id: schema.orderItems.id,
            orderId: schema.orderItems.orderId,
            productId: schema.orderItems.productId,
            quantity: schema.orderItems.quantity,
            unitPrice: schema.orderItems.unitPrice,
            status: schema.orderItems.status,
            notes: schema.orderItems.notes,
            course: schema.orderItems.course,
            productName: schema.products.name,
            printerStation: schema.products.printerStation,
          })
          .from(schema.orderItems)
          .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
          .where(eq(schema.orderItems.id, newItem.id));

        createdItems.push(itemWithProduct || newItem);
      }

      return { order: updatedOrder, items: createdItems };
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: 'open' | 'sent_to_kitchen' | 'partially_ready' | 'ready' | 'check_requested' | 'paid' | 'cancelled' | 'voided'
  ) {
    const [existing] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Orden no encontrada');
    }

    const updateFields: Record<string, any> = { status };
    if (status === 'paid') {
      updateFields.closedAt = new Date();
    }

    const [updatedOrder] = await db
      .update(schema.orders)
      .set(updateFields)
      .where(eq(schema.orders.id, orderId))
      .returning();

    if (status === 'check_requested' && existing.tableId) {
      await db
        .update(schema.tables)
        .set({ status: 'check_requested', updatedAt: new Date() })
        .where(eq(schema.tables.id, existing.tableId));
    }

    return updatedOrder;
  }

  async getKdsOrders(venueId: string, station?: string) {
    const activeOrders = await db.query.orders.findMany({
      where: (orders, { and, eq, inArray }) =>
        and(
          eq(orders.venueId, venueId),
          inArray(orders.status, ['open', 'sent_to_kitchen', 'partially_ready', 'ready', 'check_requested'])
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

    if (!station || station === 'all') {
      return activeOrders;
    }

    return activeOrders
      .map((order) => {
        const filteredItems = order.items.filter(
          (item) =>
            item.product?.printerStation === station ||
            (!item.product?.printerStation && station === 'kitchen')
        );
        return { ...order, items: filteredItems };
      })
      .filter((order) => order.items.length > 0);
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

    if (status === 'cancelled') {
      try {
        const [itemDetails] = await db
          .select({
            venueId: schema.orders.venueId,
            orderId: schema.orderItems.orderId,
            productName: schema.products.name,
            quantity: schema.orderItems.quantity,
            unitPrice: schema.orderItems.unitPrice,
          })
          .from(schema.orderItems)
          .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
          .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
          .where(eq(schema.orderItems.id, id))
          .limit(1);

        if (itemDetails) {
          await auditService.log({
            venueId: itemDetails.venueId,
            action: 'order:item_cancelled',
            entityType: 'order_item',
            entityId: id,
            payload: {
              orderId: itemDetails.orderId,
              productName: itemDetails.productName,
              quantity: itemDetails.quantity,
              unitPrice: itemDetails.unitPrice,
            },
          });
        }
      } catch (err) {
        console.error('Failed to log order item cancellation audit:', err);
      }
    }

    return updated;
  }
}

export const ordersService = new OrdersService();

