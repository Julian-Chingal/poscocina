import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { inArray } from 'drizzle-orm';
import { BadRequestError } from '../../../errors/app-error.js';
import { IOrderRepository, CreateOrderPayload } from '../interfaces/order.repository.interface.js';
import { auditService } from '../../../utils/audit.service.js';

export class CreateOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(data: CreateOrderPayload) {
    const { venueId, tableId, customerId, waiterId, notes, items } = data;
    const orderType = data.orderType || 'dine_in';
    const guestCount = data.guestCount || 1;

    if (!items || items.length === 0) {
      throw new BadRequestError('La comanda debe contener al menos un ítem.');
    }

    return await db.transaction(async (tx) => {
      const activeShift = await this.orderRepo.findActiveShift(venueId, tx);
      if (!activeShift) {
        throw new BadRequestError('Caja cerrada: Debes abrir la caja antes de registrar pedidos');
      }

      let subtotal = 0;
      for (const item of items) {
        const qty = item.quantity || 1;
        let itemTotal = item.unitPrice * qty;
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) itemTotal += (mod.priceDelta || 0) * qty;
        }
        subtotal += itemTotal;
      }

      const productIds = items.map((i) => i.productId);
      const products = await tx.select().from(schema.products).where(inArray(schema.products.id, productIds));
      const productMap = new Map(products.map((p) => [p.id, p]));

      let taxTotal = 0;
      for (const item of items) {
        const prod = productMap.get(item.productId);
        const rate = prod ? parseFloat(prod.taxRate || '0.08') : 0.08;
        const qty = item.quantity || 1;
        taxTotal += item.unitPrice * qty * rate;
      }
      const total = subtotal + taxTotal;

      const order = await this.orderRepo.createOrder({
        venueId,
        tableId: tableId || null,
        customerId: customerId || null,
        waiterId: waiterId || null,
        orderType,
        status: 'sent_to_kitchen',
        guestCount,
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        total: total.toFixed(2),
        notes,
      }, tx);

      const itemsToInsert = items.map((item) => {
        const prod = productMap.get(item.productId);
        return {
          orderId: order.id,
          productId: item.productId,
          station: prod?.printerStation || 'kitchen',
          status: 'pending',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice.toFixed(2),
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

      if (tableId) {
        await this.orderRepo.updateTableOccupied(tableId, order.id, tx);
      }

      auditService.log({
        venueId,
        action: 'order:created',
        entityType: 'order',
        entityId: order.id,
        payload: { tableId, itemsCount: items.length, total: total.toFixed(2) },
      }).catch(() => {});

      return { order, items: insertedItems, tableId };
    });
  }
}
