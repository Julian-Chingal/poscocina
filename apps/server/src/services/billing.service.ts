import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { BadRequestError, NotFoundError } from '../errors/app-error.js';

export interface PaymentInput {
  method: 'cash' | 'card_credit' | 'card_debit' | 'transfer' | 'voucher' | 'other';
  amount: number;
  reference?: string;
  tipAmount?: number;
}

export interface IssueReceiptInput {
  orderId: string;
  payments: PaymentInput[];
  isSplit?: boolean;
}

export class BillingService {
  async getCurrentCashShift(venueId: string) {
    const [activeShift] = await db
      .select()
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venueId), eq(schema.cashShifts.status, 'open')))
      .orderBy(desc(schema.cashShifts.openedAt))
      .limit(1);

    if (!activeShift) {
      return { open: false };
    }

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

    return {
      open: true,
      shift: activeShift,
      salesByMethod: payments,
    };
  }

  async openCashShift(venueId: string, openingAmount: number, cashierId?: string, notes?: string) {
    const [existing] = await db
      .select({ id: schema.cashShifts.id })
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venueId), eq(schema.cashShifts.status, 'open')))
      .limit(1);

    if (existing) {
      throw new BadRequestError('Ya existe un turno de caja abierto en este local comercial.');
    }

    let assignedCashierId = cashierId;
    if (!assignedCashierId) {
      const [firstUser] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.venueId, venueId)).limit(1);
      if (!firstUser) {
        throw new NotFoundError('No hay usuarios registrados en este local para asociar el turno');
      }
      assignedCashierId = firstUser.id;
    }

    const [newShift] = await db
      .insert(schema.cashShifts)
      .values({
        venueId,
        cashierId: assignedCashierId,
        openingAmount: (openingAmount || 0).toFixed(2),
        status: 'open',
        notes,
      })
      .returning();

    return newShift;
  }

  async closeCashShift(shiftId: string, closingAmount: number, notes?: string) {
    const [shift] = await db.select().from(schema.cashShifts).where(eq(schema.cashShifts.id, shiftId)).limit(1);
    if (!shift || shift.status !== 'open') {
      throw new NotFoundError('Turno de caja no encontrado o ya cerrado.');
    }

    // Calculate cash collected during this shift
    const [cashCollected] = await db
      .select({
        totalCash: sql<string>`coalesce(sum(${schema.receiptPayments.amount}), 0)`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(and(eq(schema.receipts.cashShiftId, shiftId), eq(schema.receiptPayments.method, 'cash')));

    const opening = parseFloat(shift.openingAmount);
    const collected = parseFloat(cashCollected?.totalCash || '0');
    const expected = opening + collected;
    const actual = closingAmount;
    const difference = actual - expected;

    const diffNote = `Diferencia: $${difference.toFixed(2)}`;
    const finalNotes = notes ? `${notes} [${diffNote}]` : diffNote;

    const [closedShift] = await db
      .update(schema.cashShifts)
      .set({
        status: 'closed',
        closedAt: new Date(),
        closingAmount: actual.toFixed(2),
        expectedAmount: expected.toFixed(2),
        notes: finalNotes,
      })
      .where(eq(schema.cashShifts.id, shiftId))
      .returning();

    return { shift: closedShift, expected, actual, difference };
  }

  async issueReceipt(data: IssueReceiptInput) {
    const { orderId, payments, isSplit } = data;

    if (!payments || payments.length === 0) {
      throw new BadRequestError('Debe registrar al menos un método de pago.');
    }

    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    // Get active cash shift or auto-create fallback
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

    // Atomic transaction for receipt, payments, table release, and escandallo deduction
    return await db.transaction(async (tx) => {
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const subtotal = totalPaid / 1.19; // Standard base calculation
      const taxTotal = totalPaid - subtotal;

      // 1. Insert Receipt
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

      // 2. Insert Payments
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
      const productIds = Array.from(new Set(orderItemsList.map((i) => i.productId)));

      if (productIds.length > 0) {
        const recipes = await tx
          .select()
          .from(schema.productRecipes)
          .where(inArray(schema.productRecipes.productId, productIds));

        // Group recipes by productId
        const recipeMap = new Map<string, typeof recipes>();
        for (const r of recipes) {
          const list = recipeMap.get(r.productId) || [];
          list.push(r);
          recipeMap.set(r.productId, list);
        }

        for (const item of orderItemsList) {
          const itemRecipes = recipeMap.get(item.productId) || [];
          for (const recipe of itemRecipes) {
            const qtyToDeduct = parseFloat(recipe.quantity) * item.quantity;

            await tx.insert(schema.inventoryMovements).values({
              inventoryItemId: recipe.inventoryItemId,
              movementType: 'sale',
              quantity: (-qtyToDeduct).toFixed(4),
              referenceId: order.id,
              notes: `Descuento automático por venta de orden #${order.id.slice(0, 8)}`,
            });

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
      }

      return {
        receipt: newReceipt,
        tableId: order.tableId,
        updatedInventory: updatedInventoryItems,
      };
    });
  }
}

export const billingService = new BillingService();
