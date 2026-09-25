import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { inArray } from 'drizzle-orm';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';
import { IOrderRepository, CreateOrderItemInput } from '../interfaces/order.repository.interface.js';
import { auditService } from '../../../utils/audit.service.js';

export class AppendOrderItemsUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(orderId: string, items: CreateOrderItemInput[]) {
    if (!items || items.length === 0) {
      throw new BadRequestError('Debes agregar al menos un ítem');
    }

    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundError('Comanda no encontrada');
    if (order.status === 'paid' || order.status === 'cancelled') {
      throw new BadRequestError('No se pueden añadir ítems a una comanda cerrada o cancelada');
    }

    const activeShift = await this.orderRepo.findActiveShift(order.venueId);
    if (!activeShift) {
      throw new BadRequestError('Caja cerrada: Debes abrir la caja antes de añadir o marchar ítems');
    }

    return await db.transaction(async (tx) => {
      // Resolve canonical prices from DB — never trust client-supplied unitPrice
      const productIds = items.map((i) => i.productId);
      const products = await tx.select().from(schema.products).where(inArray(schema.products.id, productIds));
      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of items) {
        if (!productMap.has(item.productId)) {
          throw new NotFoundError(`Producto no encontrado: ${item.productId}`);
        }
      }

      let appendedSubtotal = 0;
      let appendedTax = 0;

      for (const item of items) {
        const prod = productMap.get(item.productId)!;
        const resolvedPrice = parseFloat(prod.price);
        const rate = parseFloat(prod.taxRate || '0.08');
        const qty = item.quantity || 1;

        let itemTotal = resolvedPrice * qty;
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) itemTotal += (mod.priceDelta || 0) * qty;
        }

        appendedSubtotal += itemTotal;
        appendedTax += resolvedPrice * qty * rate;
      }

      const newSubtotal = parseFloat(order.subtotal) + appendedSubtotal;
      const newTaxTotal = parseFloat(order.taxTotal) + appendedTax;
      const newTotal = newSubtotal + newTaxTotal;

      const resetKitchenStatus = order.kitchenStatus === 'delivered' ? 'queued' : order.kitchenStatus;
      const newPaymentStatus = order.paymentStatus === 'paid' ? 'partially_paid' : order.paymentStatus;

      const updatedOrder = await this.orderRepo.updateOrderTotals(
        orderId,
        newSubtotal.toFixed(2),
        newTaxTotal.toFixed(2),
        newTotal.toFixed(2),
        { kitchenStatus: resetKitchenStatus, paymentStatus: newPaymentStatus },
        tx
      );

      const itemsToInsert = items.map((item) => {
        const prod = productMap.get(item.productId)!;
        const resolvedPrice = parseFloat(prod.price);
        return {
          orderId,
          productId: item.productId,
          status: 'pending',
          quantity: item.quantity || 1,
          unitPrice: resolvedPrice.toFixed(2),  // Always use DB price
          seatNumber: item.seatNumber || null,
          course: item.course || 1,
          notes: item.notes || null,
        };
      });

      const insertedItems = await this.orderRepo.insertOrderItems(itemsToInsert, tx);

      const modifiersToInsert = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const inserted = insertedItems[i];
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            modifiersToInsert.push({
              orderItemId: inserted.id,
              modifierId: mod.modifierId,
              priceDelta: (mod.priceDelta || 0).toFixed(2),
            });
          }
        }
      }
      await this.orderRepo.insertItemModifiers(modifiersToInsert, tx);

      auditService.log({
        venueId: order.venueId,
        action: 'order:items_appended',
        entityType: 'order',
        entityId: order.id,
        payload: { appendedItemsCount: items.length, newTotal: newTotal.toFixed(2) },
      }).catch(() => {});

      return { order: updatedOrder, items: insertedItems };
    });
  }
}

