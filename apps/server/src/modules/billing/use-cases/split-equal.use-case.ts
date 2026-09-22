import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../../../errors/app-error.js';
import { ICashShiftRepository, IReceiptRepository } from '../interfaces/billing.repository.interface.js';
import { SplitEqualDTO } from '../types/billing.types.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';

export class SplitEqualUseCase {
  constructor(
    private readonly receiptRepo: IReceiptRepository,
    private readonly shiftRepo: ICashShiftRepository
  ) {}

  async execute(data: SplitEqualDTO) {
    const { orderId, splitNumber, totalSplits, payments } = data;
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
      const taxRate = typeof venueSettings.defaultTaxRate === 'number'
        ? venueSettings.defaultTaxRate
        : typeof venueSettings.tax_rate === 'number'
        ? venueSettings.tax_rate
        : 0.08;

      const subtotal = totalPaid / (1 + taxRate);
      const taxTotal = totalPaid - subtotal;
      const targetCustomerId = data.customerId || order.customerId || null;

      const newReceipt = await this.receiptRepo.createReceipt({
        orderId,
        cashShiftId: activeShift.id,
        customerId: targetCustomerId,
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        discountTotal: '0.00',
        total: totalPaid.toFixed(2),
        isSplit: true,
      }, tx);

      if (targetCustomerId) {
        customerRepository.addLoyaltyPointsAndSpend(targetCustomerId, totalPaid).catch(() => {});
      }

      await this.receiptRepo.createPayments(newReceipt.id, payments, tx);

      const existingReceipts = await tx
        .select({ total: schema.receipts.total })
        .from(schema.receipts)
        .where(eq(schema.receipts.orderId, orderId));

      const totalPaidAcrossSplits = existingReceipts.reduce((acc, r) => acc + parseFloat(r.total), 0);
      const orderTotalNum = parseFloat(order.total);
      const isCompleted = splitNumber >= totalSplits || totalPaidAcrossSplits >= (orderTotalNum - 0.05);

      let updatedInventoryItems: any[] = [];
      if (isCompleted) {
        await this.receiptRepo.markOrderPaid(orderId, { status: 'paid', closedAt: new Date() }, tx);
        if (order.tableId) {
          await this.receiptRepo.freeTable(order.tableId, tx);
        }
        const orderItems = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
        updatedInventoryItems = await this.receiptRepo.deductInventoryForItems(order.id, orderItems, tx);
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
}
