import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { eq, and, inArray } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../../../errors/app-error.js';
import { ICashShiftRepository, IReceiptRepository } from '../interfaces/billing.repository.interface.js';
import { SplitItemsDTO } from '../types/billing.types.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { auditService } from '../../../utils/audit.service.js';

export class SplitItemsUseCase {
  constructor(
    private readonly receiptRepo: IReceiptRepository,
    private readonly shiftRepo: ICashShiftRepository
  ) {}

  async execute(data: SplitItemsDTO) {
    const { orderId, itemIds, payments, discountType, discountValue, discountReason } = data;
    if (!payments || payments.length === 0) throw new BadRequestError('Debe registrar al menos un método de pago.');
    if (!itemIds || itemIds.length === 0) throw new BadRequestError('Debe seleccionar al menos un ítem para cobro parcial.');

    const orderData = await this.receiptRepo.findOrderWithVenue(orderId);
    if (!orderData) throw new NotFoundError('Orden no encontrada');
    const { order, venueSettings } = orderData;

    const activeShift = await this.shiftRepo.findActiveShiftByVenue(order.venueId);
    if (!activeShift) throw new BadRequestError('Caja cerrada: Debes abrir la caja antes de registrar cobros');

    return await db.transaction(async (tx) => {
      const selectedItems = await tx
        .select()
        .from(schema.orderItems)
        .where(and(eq(schema.orderItems.orderId, orderId), inArray(schema.orderItems.id, itemIds)));

      if (selectedItems.length === 0) {
        throw new BadRequestError('Ninguno de los ítems seleccionados pertenece a esta comanda.');
      }

      const itemsGross = selectedItems.reduce((sum, i) => sum + parseFloat(i.unitPrice) * i.quantity, 0);
      let discountTotal = 0;
      if (discountValue && discountValue > 0) {
        discountTotal = discountType === 'percent' ? (itemsGross * discountValue) / 100 : Math.min(itemsGross, discountValue);
      }

      const taxRate = typeof venueSettings.defaultTaxRate === 'number'
        ? venueSettings.defaultTaxRate
        : typeof venueSettings.tax_rate === 'number' ? venueSettings.tax_rate : 0.08;

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const subtotal = totalPaid / (1 + taxRate);
      const taxTotal = totalPaid - subtotal;
      const targetCustomerId = data.customerId || order.customerId || null;

      const newReceipt = await this.receiptRepo.createReceipt({
        orderId,
        cashShiftId: activeShift.id,
        customerId: targetCustomerId,
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        total: totalPaid.toFixed(2),
        isSplit: true,
      }, tx);

      if (targetCustomerId) {
        customerRepository.addLoyaltyPointsAndSpend(targetCustomerId, totalPaid).catch(() => {});
      }

      if (discountTotal > 0) {
        auditService.log({
          venueId: order.venueId,
          action: 'billing:discount_applied',
          entityType: 'order',
          entityId: order.id,
          payload: { discountType, discountValue, discountReason, discountTotal, receiptNumber: newReceipt.receiptNumber },
        }).catch(() => {});
      }

      await this.receiptRepo.createPayments(newReceipt.id, payments, tx);
      const updatedInventoryItems = await this.receiptRepo.deductInventoryForItems(order.id, selectedItems, tx);
      await tx.delete(schema.orderItems).where(inArray(schema.orderItems.id, itemIds));

      const remainingItems = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
      const isCompleted = remainingItems.length === 0;
      let remainingBalance = 0;
      let isTableFreed = false;
      let tableStatus = 'free';

      if (isCompleted) {
        const isDelivered = order.kitchenStatus === 'delivered';
        const markPaidPayload: Record<string, any> = { paymentStatus: 'paid' };

        if (isDelivered) {
          markPaidPayload.status = 'paid';
          markPaidPayload.closedAt = new Date();
          if (order.tableId) {
            await this.receiptRepo.freeTable(order.tableId, tx);
            isTableFreed = true;
            tableStatus = 'free';
          }
        } else if (order.tableId) {
          await this.receiptRepo.setTableWaitingFood(order.tableId, tx);
          isTableFreed = false;
          tableStatus = 'paid_waiting_food';
        }

        await this.receiptRepo.markOrderPaid(orderId, markPaidPayload, tx);
      } else {
        const newSubtotal = remainingItems.reduce((sum, i) => sum + parseFloat(i.unitPrice) * i.quantity, 0);
        const newTax = newSubtotal * taxRate;
        const newTotal = newSubtotal + newTax;
        remainingBalance = newTotal;

        await tx.update(schema.orders).set({
          paymentStatus: 'partially_paid',
          subtotal: newSubtotal.toFixed(2),
          taxTotal: newTax.toFixed(2),
          total: newTotal.toFixed(2),
        }).where(eq(schema.orders.id, orderId));
      }

      return {
        receipt: newReceipt,
        orderId: order.id,
        isCompleted,
        isComplete: isCompleted,
        isTableFreed,
        tableStatus,
        tableId: order.tableId,
        remainingItemsCount: remainingItems.length,
        remainingBalance,
        remainingAmount: remainingBalance,
        updatedInventory: updatedInventoryItems,
      };
    });
  }
}
