import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { BadRequestError, NotFoundError } from '../errors/app-error.js';
import { auditService } from './audit.service.js';
import { customersService } from './customers.service.js';

export interface PaymentInput {
  method: 'cash' | 'card_credit' | 'card_debit' | 'transfer' | 'voucher' | 'other';
  amount: number;
  reference?: string;
  tipAmount?: number;
}

export interface IssueReceiptInput {
  orderId: string;
  customerId?: string | null;
  payments: PaymentInput[];
  isSplit?: boolean;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountReason?: string;
}

export interface SplitEqualInput {
  orderId: string;
  customerId?: string | null;
  splitNumber: number;
  totalSplits: number;
  payments: PaymentInput[];
}

export interface SplitItemsInput {
  orderId: string;
  customerId?: string | null;
  itemIds: string[];
  payments: PaymentInput[];
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountReason?: string;
}

export class BillingService {
  private async resolveActiveShift(venueId: string) {
    let [activeShift] = await db
      .select()
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venueId), eq(schema.cashShifts.status, 'open')))
      .limit(1);

    if (!activeShift) {
      const [firstUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.venueId, venueId))
        .limit(1);
      const [autoShift] = await db
        .insert(schema.cashShifts)
        .values({
          venueId,
          cashierId: firstUser.id,
          openingAmount: '0.00',
          status: 'open',
          notes: 'Turno iniciado automáticamente por cobro',
        })
        .returning();
      activeShift = autoShift;
    }
    return activeShift;
  }

  private async deductInventoryForItems(tx: any, orderId: string, items: any[]) {
    const updatedInventoryItems: any[] = [];
    const productIds = Array.from(new Set(items.map((i: any) => i.productId)));

    if (productIds.length === 0) return updatedInventoryItems;

    const recipes = await tx
      .select()
      .from(schema.productRecipes)
      .where(inArray(schema.productRecipes.productId, productIds));

    const recipeMap = new Map<string, typeof recipes>();
    for (const r of recipes) {
      const list = recipeMap.get(r.productId) || [];
      list.push(r);
      recipeMap.set(r.productId, list);
    }

    for (const item of items) {
      const itemRecipes = recipeMap.get(item.productId) || [];
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

        if (updatedStock) {
          updatedInventoryItems.push(updatedStock);
        }
      }
    }
    return updatedInventoryItems;
  }

  async getPendingBills(venueId: string) {
    return await db.query.orders.findMany({
      where: (orders, { and, eq, inArray }) =>
        and(
          eq(orders.venueId, venueId),
          inArray(orders.status, ['sent_to_kitchen', 'partially_ready', 'ready', 'check_requested'])
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
        openingAmount: openingAmount.toFixed(2),
        status: 'open',
        notes,
      })
      .returning();

    return newShift;
  }

  async closeCashShift(shiftId: string, actualClosingAmount: number, notes?: string) {
    const [shift] = await db
      .select()
      .from(schema.cashShifts)
      .where(eq(schema.cashShifts.id, shiftId))
      .limit(1);

    if (!shift) {
      throw new NotFoundError('Turno de caja no encontrado.');
    }
    if (shift.status === 'closed') {
      throw new BadRequestError('Este turno de caja ya se encuentra cerrado.');
    }

    const [salesAggregate] = await db
      .select({
        totalSales: sql<string>`coalesce(sum(${schema.receiptPayments.amount}), 0)`,
        cashSales: sql<string>`coalesce(sum(case when ${schema.receiptPayments.method} = 'cash' then ${schema.receiptPayments.amount} else 0 end), 0)`,
        totalTips: sql<string>`coalesce(sum(${schema.receiptPayments.tipAmount}), 0)`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(eq(schema.receipts.cashShiftId, shiftId));

    const opening = parseFloat(shift.openingAmount);
    const cashSales = parseFloat(salesAggregate?.cashSales || '0');
    const expected = opening + cashSales;
    const actual = actualClosingAmount;
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
    const { orderId, payments, isSplit, discountType, discountValue, discountReason } = data;

    if (!payments || payments.length === 0) {
      throw new BadRequestError('Debe registrar al menos un método de pago.');
    }

    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    const activeShift = await this.resolveActiveShift(order.venueId);

    // Atomic transaction for receipt, payments, table release, and escandallo deduction
    return await db.transaction(async (tx) => {
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      // Calculate discount
      let discountTotal = 0;
      if (discountValue && discountValue > 0) {
        if (discountType === 'percent') {
          discountTotal = (parseFloat(order.subtotal) * discountValue) / 100;
        } else {
          discountTotal = Math.min(parseFloat(order.subtotal), discountValue);
        }
      }
      
      let subtotal: number;
      let taxTotal: number;

      if (!isSplit && Math.abs(totalPaid - parseFloat(order.total)) < 0.01 && discountTotal === 0) {
        subtotal = parseFloat(order.subtotal);
        taxTotal = parseFloat(order.taxTotal);
      } else {
        const [venueRecord] = await tx
          .select({ settings: schema.venues.settings })
          .from(schema.venues)
          .where(eq(schema.venues.id, order.venueId))
          .limit(1);

        const venueSettings = (venueRecord?.settings as Record<string, any>) || {};
        const taxRate = typeof venueSettings.defaultTaxRate === 'number'
          ? venueSettings.defaultTaxRate
          : typeof venueSettings.tax_rate === 'number'
          ? venueSettings.tax_rate
          : 0.08;

        subtotal = totalPaid / (1 + taxRate);
        taxTotal = totalPaid - subtotal;
      }

      const targetCustomerId = data.customerId || order.customerId || null;

      // 1. Insert Receipt
      const [newReceipt] = await tx
        .insert(schema.receipts)
        .values({
          orderId,
          cashShiftId: activeShift.id,
          customerId: targetCustomerId,
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          discountTotal: discountTotal.toFixed(2),
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
        .set({
          status: 'paid',
          closedAt: new Date(),
          discountTotal: discountTotal.toFixed(2),
          notes: discountReason ? `${order.notes || ''} [Desc: ${discountReason}]`.trim() : order.notes,
        })
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

      const updatedInventoryItems = await this.deductInventoryForItems(tx, order.id, orderItemsList);

      if (targetCustomerId) {
        customersService.addLoyaltyPointsAndSpend(targetCustomerId, totalPaid).catch(() => {});
      }

      if (discountTotal > 0) {
        auditService.log({
          venueId: order.venueId,
          action: 'billing:discount_applied',
          entityType: 'order',
          entityId: order.id,
          payload: {
            discountType,
            discountValue,
            discountReason,
            discountTotal,
            receiptNumber: newReceipt.receiptNumber,
          },
        }).catch(() => {});
      }

      return {
        receipt: newReceipt,
        tableId: order.tableId,
        updatedInventory: updatedInventoryItems,
      };
    });
  }

  async splitBillingEqual(data: SplitEqualInput) {
    const { orderId, splitNumber, totalSplits, payments } = data;
    if (!payments || payments.length === 0) {
      throw new BadRequestError('Debe registrar al menos un método de pago.');
    }

    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    const activeShift = await this.resolveActiveShift(order.venueId);

    return await db.transaction(async (tx) => {
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      const [venueRecord] = await tx
        .select({ settings: schema.venues.settings })
        .from(schema.venues)
        .where(eq(schema.venues.id, order.venueId))
        .limit(1);

      const venueSettings = (venueRecord?.settings as Record<string, any>) || {};
      const taxRate = typeof venueSettings.defaultTaxRate === 'number'
        ? venueSettings.defaultTaxRate
        : typeof venueSettings.tax_rate === 'number'
        ? venueSettings.tax_rate
        : 0.08;

      const subtotal = totalPaid / (1 + taxRate);
      const taxTotal = totalPaid - subtotal;
      const targetCustomerId = data.customerId || order.customerId || null;

      // 1. Insert Split Receipt
      const [newReceipt] = await tx
        .insert(schema.receipts)
        .values({
          orderId,
          cashShiftId: activeShift.id,
          customerId: targetCustomerId,
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          discountTotal: '0.00',
          total: totalPaid.toFixed(2),
          isSplit: true,
        })
        .returning();

      if (targetCustomerId) {
        customersService.addLoyaltyPointsAndSpend(targetCustomerId, totalPaid).catch(() => {});
      }

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

      // 3. Check all receipts for this order
      const existingReceipts = await tx
        .select({ total: schema.receipts.total })
        .from(schema.receipts)
        .where(eq(schema.receipts.orderId, orderId));

      const totalPaidAcrossSplits = existingReceipts.reduce((acc, r) => acc + parseFloat(r.total), 0);
      const orderTotalNum = parseFloat(order.total);
      const isCompleted = splitNumber >= totalSplits || totalPaidAcrossSplits >= (orderTotalNum - 0.05);

      let updatedInventoryItems: any[] = [];

      if (isCompleted) {
        await tx
          .update(schema.orders)
          .set({ status: 'paid', closedAt: new Date() })
          .where(eq(schema.orders.id, orderId));

        if (order.tableId) {
          await tx
            .update(schema.tables)
            .set({ status: 'free', currentOrderId: null, updatedAt: new Date() })
            .where(eq(schema.tables.id, order.tableId));
        }

        // Deduct inventory for all order items
        const orderItemsList = await tx
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, orderId));

        updatedInventoryItems = await this.deductInventoryForItems(tx, order.id, orderItemsList);
      }

      const remainingAmt = Math.max(0, orderTotalNum - totalPaidAcrossSplits);
      return {
        receipt: newReceipt,
        splitNumber,
        totalSplits,
        isCompleted,
        isComplete: isCompleted,
        tableId: isCompleted ? order.tableId : null,
        remainingAmount: remainingAmt,
        remainingBalance: remainingAmt,
        updatedInventory: updatedInventoryItems,
      };
    });
  }

  async splitBillingByItems(data: SplitItemsInput) {
    const { orderId, itemIds, payments, discountType, discountValue, discountReason } = data;
    if (!payments || payments.length === 0) {
      throw new BadRequestError('Debe registrar al menos un método de pago.');
    }
    if (!itemIds || itemIds.length === 0) {
      throw new BadRequestError('Debe seleccionar al menos un ítem para cobro parcial.');
    }

    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    const activeShift = await this.resolveActiveShift(order.venueId);

    return await db.transaction(async (tx) => {
      // 1. Get selected order items
      const selectedItems = await tx
        .select()
        .from(schema.orderItems)
        .where(and(eq(schema.orderItems.orderId, orderId), inArray(schema.orderItems.id, itemIds)));

      if (selectedItems.length === 0) {
        throw new BadRequestError('Ninguno de los ítems seleccionados pertenece a esta comanda.');
      }

      const itemsGrossTotal = selectedItems.reduce(
        (sum, i) => sum + parseFloat(i.unitPrice) * i.quantity,
        0
      );

      let discountTotal = 0;
      if (discountValue && discountValue > 0) {
        if (discountType === 'percent') {
          discountTotal = (itemsGrossTotal * discountValue) / 100;
        } else {
          discountTotal = Math.min(itemsGrossTotal, discountValue);
        }
      }

      const [venueRecord] = await tx
        .select({ settings: schema.venues.settings })
        .from(schema.venues)
        .where(eq(schema.venues.id, order.venueId))
        .limit(1);

      const venueSettings = (venueRecord?.settings as Record<string, any>) || {};
      const taxRate = typeof venueSettings.defaultTaxRate === 'number'
        ? venueSettings.defaultTaxRate
        : typeof venueSettings.tax_rate === 'number'
        ? venueSettings.tax_rate
        : 0.08;

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const subtotal = totalPaid / (1 + taxRate);
      const taxTotal = totalPaid - subtotal;
      const targetCustomerId = data.customerId || order.customerId || null;

      // 2. Insert receipt
      const [newReceipt] = await tx
        .insert(schema.receipts)
        .values({
          orderId,
          cashShiftId: activeShift.id,
          customerId: targetCustomerId,
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          discountTotal: discountTotal.toFixed(2),
          total: totalPaid.toFixed(2),
          isSplit: true,
        })
        .returning();

      if (targetCustomerId) {
        customersService.addLoyaltyPointsAndSpend(targetCustomerId, totalPaid).catch(() => {});
      }

      if (discountTotal > 0) {
        auditService.log({
          venueId: order.venueId,
          action: 'billing:discount_applied',
          entityType: 'order',
          entityId: order.id,
          payload: {
            discountType,
            discountValue,
            discountReason,
            discountTotal,
            receiptNumber: newReceipt.receiptNumber,
          },
        }).catch(() => {});
      }

      // 3. Insert payments
      for (const p of payments) {
        await tx.insert(schema.receiptPayments).values({
          receiptId: newReceipt.id,
          method: p.method,
          amount: p.amount.toFixed(2),
          reference: p.reference,
          tipAmount: (p.tipAmount || 0).toFixed(2),
        });
      }

      // 4. Deduct inventory for specifically these items
      const updatedInventoryItems = await this.deductInventoryForItems(tx, order.id, selectedItems);

      // 5. Remove paid items from orderItems
      await tx.delete(schema.orderItems).where(inArray(schema.orderItems.id, itemIds));

      // 6. Check remaining items in order
      const remainingItems = await tx
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, orderId));

      const isCompleted = remainingItems.length === 0;

      let remainingBalance = 0;

      if (isCompleted) {
        await tx
          .update(schema.orders)
          .set({ status: 'paid', closedAt: new Date() })
          .where(eq(schema.orders.id, orderId));

        if (order.tableId) {
          await tx
            .update(schema.tables)
            .set({ status: 'free', currentOrderId: null, updatedAt: new Date() })
            .where(eq(schema.tables.id, order.tableId));
        }
      } else {
        // Recalculate remaining order total
        const newSubtotal = remainingItems.reduce(
          (sum, i) => sum + parseFloat(i.unitPrice) * i.quantity,
          0
        );
        const newTax = newSubtotal * taxRate;
        const newTotal = newSubtotal + newTax;
        remainingBalance = newTotal;

        await tx
          .update(schema.orders)
          .set({
            subtotal: newSubtotal.toFixed(2),
            taxTotal: newTax.toFixed(2),
            total: newTotal.toFixed(2),
          })
          .where(eq(schema.orders.id, orderId));
      }

      return {
        receipt: newReceipt,
        isCompleted,
        isComplete: isCompleted,
        tableId: isCompleted ? order.tableId : null,
        remainingItemsCount: remainingItems.length,
        remainingBalance,
        remainingAmount: remainingBalance,
        updatedInventory: updatedInventoryItems,
      };
    });
  }
}

export const billingService = new BillingService();
