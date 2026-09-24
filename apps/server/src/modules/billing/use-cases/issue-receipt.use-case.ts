import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../../../errors/app-error.js';
import { ICashShiftRepository, IReceiptRepository } from '../interfaces/billing.repository.interface.js';
import { IssueReceiptDTO } from '../types/billing.types.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { auditService } from '../../../utils/audit.service.js';

export class IssueReceiptUseCase {
  constructor(
    private readonly receiptRepo: IReceiptRepository,
    private readonly shiftRepo: ICashShiftRepository
  ) {}

  async execute(data: IssueReceiptDTO) {
    const { orderId, payments, isSplit, discountType, discountValue, discountReason } = data;
    if (!payments || payments.length === 0) {
      throw new BadRequestError('Debe registrar al menos un método de pago.');
    }

    const orderData = await this.receiptRepo.findOrderWithVenue(orderId);
    if (!orderData) throw new NotFoundError('Orden no encontrada');
    const { order, venueSettings } = orderData;

    const activeShift = await this.shiftRepo.findActiveShiftByVenue(order.venueId);
    if (!activeShift) {
      throw new BadRequestError('Caja cerrada: Debes abrir la caja antes de registrar cobros');
    }

    return await db.transaction(async (tx) => {
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      let discountTotal = 0;
      if (discountValue && discountValue > 0) {
        discountTotal = discountType === 'percent'
          ? (parseFloat(order.subtotal) * discountValue) / 100
          : Math.min(parseFloat(order.subtotal), discountValue);
      }

      let subtotal: number;
      let taxTotal: number;

      if (!isSplit && Math.abs(totalPaid - parseFloat(order.total)) < 0.01 && discountTotal === 0) {
        subtotal = parseFloat(order.subtotal);
        taxTotal = parseFloat(order.taxTotal);
      } else {
        const taxRate = typeof venueSettings.defaultTaxRate === 'number'
          ? venueSettings.defaultTaxRate
          : typeof venueSettings.tax_rate === 'number'
          ? venueSettings.tax_rate
          : 0.08;
        subtotal = totalPaid / (1 + taxRate);
        taxTotal = totalPaid - subtotal;
      }

      const targetCustomerId = data.customerId || order.customerId || null;

      const newReceipt = await this.receiptRepo.createReceipt({
        orderId,
        cashShiftId: activeShift.id,
        customerId: targetCustomerId,
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        total: totalPaid.toFixed(2),
        isSplit: isSplit || false,
      }, tx);

      await this.receiptRepo.createPayments(newReceipt.id, payments, tx);

      const isDelivered = order.kitchenStatus === 'delivered';
      const markPaidPayload: Record<string, any> = {
        paymentStatus: 'paid',
        discountTotal: discountTotal.toFixed(2),
        notes: discountReason ? `${order.notes || ''} [Desc: ${discountReason}]`.trim() : order.notes,
      };

      let tableStatus = 'free';
      let isTableFreed = false;

      if (isDelivered) {
        // Kitchen already delivered everything -> order is closed & table is freed
        markPaidPayload.status = 'paid';
        markPaidPayload.closedAt = new Date();
        if (order.tableId) {
          await this.receiptRepo.freeTable(order.tableId, tx);
          isTableFreed = true;
          tableStatus = 'free';
        }
      } else {
        // Food is still being cooked/served -> table remains active with paid_waiting_food
        if (order.tableId) {
          await this.receiptRepo.setTableWaitingFood(order.tableId, tx);
          isTableFreed = false;
          tableStatus = 'paid_waiting_food';
        }
      }

      await this.receiptRepo.markOrderPaid(orderId, markPaidPayload, tx);

      const orderItems = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
      const updatedInventory = await this.receiptRepo.deductInventoryForItems(order.id, orderItems, tx);

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

      return {
        receipt: newReceipt,
        orderId: order.id,
        tableId: order.tableId,
        isTableFreed,
        tableStatus,
        updatedInventory,
      };
    });
  }
}
