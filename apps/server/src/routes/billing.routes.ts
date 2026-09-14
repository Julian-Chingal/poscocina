import { FastifyInstance } from 'fastify';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export async function billingRoutes(fastify: FastifyInstance) {
  // 1. Get currently open cash shift for a venue
  fastify.get('/api/cash-shifts/current/:venueId', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };

    const [activeShift] = await db
      .select()
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venueId), eq(schema.cashShifts.status, 'open')))
      .orderBy(desc(schema.cashShifts.openedAt))
      .limit(1);

    if (!activeShift) {
      return reply.send({ open: false });
    }

    // Calculate live totals collected during this shift
    const payments = await db
      .select({
        method: schema.receiptPayments.method,
        total: sql<string>`sum(${schema.receiptPayments.amount})`,
        tips: sql<string>`sum(${schema.receiptPayments.tipAmount})`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(eq(schema.receipts.cashShiftId, activeShift.id))
      .groupBy(schema.receiptPayments.method);

    return reply.send({
      open: true,
      shift: activeShift,
      salesByMethod: payments,
    });
  });

  // 2. Open a new cash shift
  fastify.post('/api/cash-shifts/open', async (request, reply) => {
    const { venueId, cashierId, openingAmount, notes } = request.body as {
      venueId: string;
      cashierId?: string;
      openingAmount: number;
      notes?: string;
    };

    // Check if there is already an open shift
    const [existing] = await db
      .select()
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venueId), eq(schema.cashShifts.status, 'open')))
      .limit(1);

    if (existing) {
      return reply.status(400).send({ error: 'Ya existe un turno de caja abierto en este local.' });
    }

    // Fallback cashier to first user if not provided in demo
    let assignedCashierId = cashierId;
    if (!assignedCashierId) {
      const [firstUser] = await db.select().from(schema.users).where(eq(schema.users.venueId, venueId)).limit(1);
      assignedCashierId = firstUser?.id;
    }

    const [newShift] = await db
      .insert(schema.cashShifts)
      .values({
        venueId,
        cashierId: assignedCashierId!,
        openingAmount: (openingAmount || 0).toFixed(2),
        status: 'open',
        notes,
      })
      .returning();

    fastify.io.emit('cash_shift:opened', newShift);
    return reply.status(201).send(newShift);
  });

  // 3. Close cash shift with blind count
  fastify.post('/api/cash-shifts/:id/close', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { closingAmount, notes } = request.body as {
      closingAmount: number;
      notes?: string;
    };

    const [shift] = await db.select().from(schema.cashShifts).where(eq(schema.cashShifts.id, id)).limit(1);
    if (!shift || shift.status !== 'open') {
      return reply.status(404).send({ error: 'Turno de caja no encontrado o ya cerrado.' });
    }

    // Calculate expected amount: openingAmount + cash receipts
    const [cashCollected] = await db
      .select({
        totalCash: sql<string>`coalesce(sum(${schema.receiptPayments.amount}), 0)`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(and(eq(schema.receipts.cashShiftId, id), eq(schema.receiptPayments.method, 'cash')));

    const opening = parseFloat(shift.openingAmount);
    const collected = parseFloat(cashCollected?.totalCash || '0');
    const expected = opening + collected;
    const actual = closingAmount;
    const difference = actual - expected;

    const [closedShift] = await db
      .update(schema.cashShifts)
      .set({
        status: 'closed',
        closedAt: new Date(),
        closingAmount: actual.toFixed(2),
        expectedAmount: expected.toFixed(2),
        notes: notes ? `${notes} [Diferencia: $${difference.toFixed(2)}]` : `Diferencia: $${difference.toFixed(2)}`,
      })
      .where(eq(schema.cashShifts.id, id))
      .returning();

    fastify.io.emit('cash_shift:closed', closedShift);
    return reply.send({ shift: closedShift, expected, actual, difference });
  });

  // 4. Issue Receipt & Pay Order (with Automatic Inventory Decrement!)
  fastify.post('/api/receipts', async (request, reply) => {
    const { orderId, payments, isSplit } = request.body as {
      orderId: string;
      payments: Array<{
        method: 'cash' | 'card_credit' | 'card_debit' | 'transfer' | 'voucher' | 'other';
        amount: number;
        reference?: string;
        tipAmount?: number;
      }>;
      isSplit?: boolean;
    };

    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) {
      return reply.status(404).send({ error: 'Orden no encontrada' });
    }

    // Ensure there is an open shift or auto-create a fallback shift
    let [activeShift] = await db
      .select()
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, order.venueId), eq(schema.cashShifts.status, 'open')))
      .limit(1);

    if (!activeShift) {
      const [firstUser] = await db.select().from(schema.users).where(eq(schema.users.venueId, order.venueId)).limit(1);
      const [autoShift] = await db
        .insert(schema.cashShifts)
        .values({
          venueId: order.venueId,
          cashierId: firstUser.id,
          openingAmount: '0.00',
          status: 'open',
          notes: 'Turno iniciado automáticamente por cobro',
        })
        .returning();
      activeShift = autoShift;
    }

    // Execute atomic transaction for checkout + inventory deduction
    const result = await db.transaction(async (tx) => {
      // 1. Create Receipt
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const subtotal = totalPaid / 1.19;
      const taxTotal = totalPaid - subtotal;

      const [newReceipt] = await tx
        .insert(schema.receipts)
        .values({
          orderId,
          cashShiftId: activeShift.id,
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          total: totalPaid.toFixed(2),
          isSplit: isSplit || false,
        })
        .returning();

      // 2. Create Payment Records
      for (const p of payments) {
        await tx.insert(schema.receiptPayments).values({
          receiptId: newReceipt.id,
          method: p.method,
          amount: p.amount.toFixed(2),
          reference: p.reference,
          tipAmount: (p.tipAmount || 0).toFixed(2),
        });
      }

      // 3. Mark Order as Paid
      await tx
        .update(schema.orders)
        .set({ status: 'paid', closedAt: new Date() })
        .where(eq(schema.orders.id, orderId));

      // 4. Free Table if assigned
      if (order.tableId) {
        await tx
          .update(schema.tables)
          .set({ status: 'free', currentOrderId: null, updatedAt: new Date() })
          .where(eq(schema.tables.id, order.tableId));
      }

      // 5. Automatic Inventory Deduction (Escandallos)
      const orderItemsList = await tx
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, orderId));

      const updatedInventoryItems = [];

      for (const item of orderItemsList) {
        // Find recipes for this product
        const recipes = await tx
          .select()
          .from(schema.productRecipes)
          .where(eq(schema.productRecipes.productId, item.productId));

        for (const recipe of recipes) {
          const qtyToDeduct = parseFloat(recipe.quantity) * item.quantity;

          // Record movement
          await tx.insert(schema.inventoryMovements).values({
            inventoryItemId: recipe.inventoryItemId,
            movementType: 'sale',
            quantity: (-qtyToDeduct).toFixed(4),
            referenceId: order.id,
            notes: `Descuento automático por venta de orden #${order.id.slice(0, 8)}`,
          });

          // Deduct from currentStock
          const [updatedStock] = await tx
            .update(schema.inventoryItems)
            .set({
              currentStock: sql`GREATEST(0, ${schema.inventoryItems.currentStock} - ${qtyToDeduct})`,
              updatedAt: new Date(),
            })
            .where(eq(schema.inventoryItems.id, recipe.inventoryItemId))
            .returning();

          if (updatedStock) {
            updatedInventoryItems.push(updatedStock);
          }
        }
      }

      return { receipt: newReceipt, tableId: order.tableId, updatedInventory: updatedInventoryItems };
    });

    // Real-time broadcasts
    fastify.io.emit('receipt:issued', result.receipt);
    if (result.tableId) {
      fastify.io.emit('table:status_changed', { tableId: result.tableId, status: 'free', currentOrderId: null });
    }
    for (const inv of result.updatedInventory) {
      fastify.io.emit('inventory:stock_updated', inv);
    }

    return reply.status(201).send(result);
  });
}
