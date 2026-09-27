import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ConflictError } from '../../../errors/app-error.js';
import { IOrderRepository } from '../interfaces/order.repository.interface.js';
import { auditService } from '../../../utils/audit.service.js';
import { ModifyOrderItemInput } from '@poscocina/shared';

export class ModifyOrderItemUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(itemId: string, input: ModifyOrderItemInput) {
    return await db.transaction(async (tx) => {
      const itemWithOrder = await this.orderRepo.findOrderItemWithOrder(itemId, tx);
      if (!itemWithOrder) throw new NotFoundError('Ítem de comanda no encontrado');

      const order = itemWithOrder.order;
      if (!order) throw new NotFoundError('Comanda asociada no encontrada');

      if (order.status === 'cancelled' || order.status === 'voided') {
        throw new BadRequestError('No se puede modificar un ítem de una comanda cancelada');
      }

      // Business rule validation:
      // Can modify only if item status is 'pending' or 'sent'.
      // If already 'in_preparation', 'ready', or 'delivered':
      // allow ONLY if kitchenApproved is true (or source === 'kds')
      const isAdvancedStatus = ['in_preparation', 'ready', 'delivered'].includes(itemWithOrder.status);
      const isKitchenApproved = Boolean(input.kitchenApproved || input.source === 'kds');

      if (isAdvancedStatus && !isKitchenApproved) {
        throw new ConflictError(
          'El ítem ya se encuentra en preparación o despachado y no puede modificarse; consulte con cocina.'
        );
      }

      // Check if product is changing
      let resolvedPrice = parseFloat(itemWithOrder.unitPrice);
      const targetProductId = input.productId || itemWithOrder.productId;

      if (input.productId && input.productId !== itemWithOrder.productId) {
        const [newProduct] = await tx
          .select()
          .from(schema.products)
          .where(eq(schema.products.id, input.productId))
          .limit(1);

        if (!newProduct) {
          throw new NotFoundError(`Producto no encontrado: ${input.productId}`);
        }
        resolvedPrice = parseFloat(newProduct.price);
      }

      const updateData: Record<string, any> = {
        productId: targetProductId,
        unitPrice: resolvedPrice.toFixed(2),
      };

      if (input.quantity !== undefined) updateData.quantity = input.quantity;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.seatNumber !== undefined) updateData.seatNumber = input.seatNumber;
      if (input.course !== undefined) updateData.course = input.course;

      const updatedItem = await this.orderRepo.updateOrderItemData(itemId, updateData, tx);

      // Handle modifiers if provided
      if (input.modifiers !== undefined) {
        await this.orderRepo.deleteItemModifiers(itemId, tx);
        if (input.modifiers.length > 0) {
          const modifiersToInsert = input.modifiers.map((mod) => ({
            orderItemId: itemId,
            modifierId: mod.modifierId,
            priceDelta: (mod.priceDelta || 0).toFixed(2),
          }));
          await this.orderRepo.insertItemModifiers(modifiersToInsert, tx);
        }
      }

      // Recalculate whole order totals
      const { newSubtotal, newTaxTotal, newTotal } = await this.recalculateOrderTotals(order.id, tx);

      const updatedOrder = await this.orderRepo.updateOrderTotals(
        order.id,
        newSubtotal.toFixed(2),
        newTaxTotal.toFixed(2),
        newTotal.toFixed(2),
        {},
        tx
      );

      auditService.log({
        venueId: order.venueId,
        action: 'order_item:modified_hot',
        entityType: 'order_item',
        entityId: itemId,
        payload: {
          previousProduct: itemWithOrder.productId,
          newProduct: targetProductId,
          wasKitchenApproved: isKitchenApproved,
          newTotal: newTotal.toFixed(2),
        },
      }).catch(() => {});

      return {
        order: updatedOrder,
        updatedItem,
        venueId: order.venueId,
        orderId: order.id,
      };
    });
  }

  async removeItem(itemId: string, kitchenApproved = false, source = 'pos') {
    return await db.transaction(async (tx) => {
      const itemWithOrder = await this.orderRepo.findOrderItemWithOrder(itemId, tx);
      if (!itemWithOrder) throw new NotFoundError('Ítem de comanda no encontrado');

      const order = itemWithOrder.order;
      if (!order) throw new NotFoundError('Comanda asociada no encontrada');

      const isAdvancedStatus = ['in_preparation', 'ready', 'delivered'].includes(itemWithOrder.status);
      const isApproved = Boolean(kitchenApproved || source === 'kds');

      if (isAdvancedStatus && !isApproved) {
        throw new ConflictError(
          'El ítem ya se encuentra en preparación o despachado y no puede eliminarse; consulte con cocina.'
        );
      }

      await this.orderRepo.deleteItemModifiers(itemId, tx);
      await this.orderRepo.deleteOrderItem(itemId, tx);

      // Recalculate whole order totals
      const { newSubtotal, newTaxTotal, newTotal } = await this.recalculateOrderTotals(order.id, tx);

      const updatedOrder = await this.orderRepo.updateOrderTotals(
        order.id,
        newSubtotal.toFixed(2),
        newTaxTotal.toFixed(2),
        newTotal.toFixed(2),
        {},
        tx
      );

      auditService.log({
        venueId: order.venueId,
        action: 'order_item:removed_hot',
        entityType: 'order_item',
        entityId: itemId,
        payload: {
          productId: itemWithOrder.productId,
          wasKitchenApproved: isApproved,
          newTotal: newTotal.toFixed(2),
        },
      }).catch(() => {});

      return {
        order: updatedOrder,
        removedItemId: itemId,
        venueId: order.venueId,
        orderId: order.id,
      };
    });
  }

  private async recalculateOrderTotals(orderId: string, tx: any = db) {
    const allItems = await tx.query.orderItems.findMany({
      where: (orderItems: any, { eq }: any) => eq(orderItems.orderId, orderId),
      with: {
        product: true,
        modifiers: true,
      },
    });

    let newSubtotal = 0;
    let newTaxTotal = 0;

    for (const item of allItems) {
      if (item.status === 'cancelled') continue;
      const unitPrice = parseFloat(item.unitPrice);
      const qty = item.quantity;
      const taxRate = parseFloat(item.product?.taxRate || '0.08');

      let itemTotal = unitPrice * qty;
      for (const mod of item.modifiers || []) {
        itemTotal += parseFloat(mod.priceDelta || '0') * qty;
      }

      newSubtotal += itemTotal;
      newTaxTotal += unitPrice * qty * taxRate;
    }

    const newTotal = newSubtotal + newTaxTotal;
    return { newSubtotal, newTaxTotal, newTotal };
  }
}
