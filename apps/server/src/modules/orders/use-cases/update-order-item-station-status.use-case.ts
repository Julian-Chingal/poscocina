import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { NotFoundError } from '../../../errors/app-error.js';
import { IOrderRepository } from '../interfaces/order.repository.interface.js';
import { auditService } from '../../../utils/audit.service.js';

export class UpdateOrderItemStationStatusUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(
    orderItemId: string,
    stationId: string,
    newStatus: 'pending' | 'in_preparation' | 'ready' | 'delivered'
  ) {
    return await db.transaction(async (tx) => {
      const itemWithOrder = await this.orderRepo.findOrderItemWithOrder(orderItemId, tx);
      if (!itemWithOrder) {
        throw new NotFoundError('Ítem de comanda no encontrado');
      }

      const order = itemWithOrder.order;
      const venueId = order.venueId;

      // Check if this station is assigned
      const existingStations = await this.orderRepo.findOrderItemStations(orderItemId, tx);
      const targetStation = existingStations.find((s: any) => s.stationId === stationId);

      const now = new Date();
      if (!targetStation) {
        // If the record doesn't exist yet, insert it to keep system consistent
        await tx
          .insert(schema.orderItemStations)
          .values({
            orderItemId,
            stationId,
            status: newStatus,
            sentAt: now,
            readyAt: newStatus === 'ready' ? now : null,
            deliveredAt: newStatus === 'delivered' ? now : null,
          })
          .onConflictDoNothing();
      } else {
        const extra: Record<string, any> = {};
        if (newStatus === 'in_preparation' && !targetStation.sentAt) extra.sentAt = now;
        if (newStatus === 'ready') extra.readyAt = now;
        if (newStatus === 'delivered') extra.deliveredAt = now;

        await this.orderRepo.updateOrderItemStationStatus(orderItemId, stationId, newStatus, extra, tx);
      }

      // Rollup calculation for the order_item:
      const allStations = await this.orderRepo.findOrderItemStations(orderItemId, tx);
      const statuses = allStations.map((s: any) => s.status);

      let computedItemStatus = itemWithOrder.status;
      const itemExtra: Record<string, any> = {};

      const allReadyOrDelivered =
        statuses.length > 0 && statuses.every((s: string) => s === 'ready' || s === 'delivered');
      const allDelivered = statuses.length > 0 && statuses.every((s: string) => s === 'delivered');
      const anyInPrep = statuses.some((s: string) => s === 'in_preparation' || s === 'ready');

      if (allDelivered) {
        computedItemStatus = 'delivered';
        itemExtra.deliveredAt = now;
      } else if (allReadyOrDelivered) {
        computedItemStatus = 'ready';
        itemExtra.readyAt = now;
      } else if (anyInPrep) {
        computedItemStatus = 'in_preparation';
      } else {
        computedItemStatus = 'pending';
      }

      const updatedItem = await this.orderRepo.updateOrderItemStatus(
        orderItemId,
        computedItemStatus,
        itemExtra,
        tx
      );

      // Rollup calculation for the entire order
      const allOrderItems = await this.orderRepo.findOrderItemsByOrderId(order.id, tx);
      const allItemStatuses = allOrderItems.map((it: any) =>
        it.id === orderItemId ? computedItemStatus : it.status
      );

      let newKitchenStatus = order.kitchenStatus;
      if (allItemStatuses.every((s: string) => s === 'delivered')) {
        newKitchenStatus = 'delivered';
      } else if (allItemStatuses.every((s: string) => s === 'ready' || s === 'delivered')) {
        newKitchenStatus = 'ready';
      } else if (allItemStatuses.some((s: string) => s === 'ready' || s === 'in_preparation')) {
        newKitchenStatus = 'in_preparation';
      } else {
        newKitchenStatus = 'queued';
      }

      let updatedOrder = order;
      if (newKitchenStatus !== order.kitchenStatus) {
        updatedOrder = await this.orderRepo.updateOrderKitchenStatus(order.id, newKitchenStatus, {}, tx);
      }

      auditService
        .log({
          venueId,
          action: 'order_item:station_status_updated',
          entityType: 'order_item_station',
          entityId: `${orderItemId}:${stationId}`,
          payload: {
            orderItemId,
            stationId,
            newStatus,
            itemStatus: computedItemStatus,
            kitchenStatus: newKitchenStatus,
          },
        })
        .catch(() => {});

      return {
        updatedItem: {
          ...updatedItem,
          stations: allStations,
        },
        orderId: order.id,
        order: updatedOrder,
        venueId,
        stationId,
        stationStatus: newStatus,
        itemStatus: computedItemStatus,
        kitchenStatus: newKitchenStatus,
      };
    });
  }
}
