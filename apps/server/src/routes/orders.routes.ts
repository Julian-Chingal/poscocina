import { FastifyInstance } from 'fastify';
import { eq, inArray, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { CreateOrderSchema, UpdateItemStatusSchema } from '@poscocina/shared';

export async function ordersRoutes(fastify: FastifyInstance) {
  // 1. Create order
  fastify.post('/api/orders', async (request, reply) => {
    const parse = CreateOrderSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Datos de orden inválidos', details: parse.error.issues });
    }

    const { venueId, tableId, orderType, waiterId, guestCount, notes, items } = parse.data;

    // Transaction to insert order + items + modifiers + update table status
    const result = await db.transaction(async (tx) => {
      // Calculate totals
      let subtotal = 0;
      for (const item of items) {
        let itemTotal = item.unitPrice * item.quantity;
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            itemTotal += mod.priceDelta * item.quantity;
          }
        }
        subtotal += itemTotal;
      }

      const taxTotal = subtotal * 0.19; // Default 19% IVA
      const total = subtotal + taxTotal;

      const [newOrder] = await tx
        .insert(schema.orders)
        .values({
          venueId,
          tableId: tableId || null,
          orderType,
          waiterId: waiterId || null,
          guestCount,
          notes,
          status: 'sent_to_kitchen',
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          total: total.toFixed(2),
        })
        .returning();

      const createdItems = [];

      for (const item of items) {
        const [newItem] = await tx
          .insert(schema.orderItems)
          .values({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
            notes: item.notes,
            seatNumber: item.seatNumber,
            course: item.course,
            status: 'sent',
            sentAt: new Date(),
          })
          .returning();

        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            await tx.insert(schema.orderItemModifiers).values({
              orderItemId: newItem.id,
              modifierId: mod.modifierId,
              priceDelta: mod.priceDelta.toFixed(2),
            });
          }
        }

        createdItems.push(newItem);
      }

      // Update table if dine-in
      if (tableId) {
        await tx
          .update(schema.tables)
          .set({ status: 'occupied', currentOrderId: newOrder.id, updatedAt: new Date() })
          .where(eq(schema.tables.id, tableId));
      }

      return { order: newOrder, items: createdItems };
    });

    // Real-time broadcast to KDS and Salon
    fastify.io.emit('order:created', result);
    if (tableId) {
      fastify.io.emit('table:status_changed', { tableId, status: 'occupied', currentOrderId: result.order.id });
    }

    return reply.status(201).send(result);
  });

  // 2. Get active orders for KDS
  fastify.get('/api/venues/:venueId/kds/orders', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };

    const activeOrders = await db.query.orders.findMany({
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

    return reply.send(activeOrders);
  });

  // 3. Update Order Item Status (KDS bump bar / click)
  fastify.patch('/api/order-items/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = UpdateItemStatusSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Estado inválido', details: parse.error.issues });
    }

    const { status } = parse.data;

    const updateFields: Record<string, unknown> = { status };
    if (status === 'ready') updateFields.readyAt = new Date();
    if (status === 'delivered') updateFields.deliveredAt = new Date();

    const [updated] = await db
      .update(schema.orderItems)
      .set(updateFields)
      .where(eq(schema.orderItems.id, id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ error: 'Ítem no encontrado' });
    }

    // Broadcast item status update
    fastify.io.emit('order_item:updated', updated);

    return reply.send(updated);
  });
}
