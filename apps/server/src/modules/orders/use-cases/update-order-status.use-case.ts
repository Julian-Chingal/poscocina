import { NotFoundError } from '../../../errors/app-error.js';
import { IOrderRepository } from '../interfaces/order.repository.interface.js';
import { auditService } from '../../../utils/audit.service.js';

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async getOrderById(orderId: string) {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundError('Comanda no encontrada');
    return order;
  }

  async getKdsOrders(venueId: string, station?: string) {
    return await this.orderRepo.findKdsOrders(venueId, station);
  }

  async updateOrderStatus(orderId: string, status: any) {
    const order = await this.getOrderById(orderId);
    const updated = await this.orderRepo.updateOrderStatus(orderId, status);

    auditService.log({
      venueId: order.venueId,
      action: 'order:status_updated',
      entityType: 'order',
      entityId: order.id,
      payload: { previousStatus: order.status, newStatus: status },
    }).catch(() => {});

    return updated;
  }

  async updateOrderItemStatus(itemId: string, status: any) {
    const item = await this.orderRepo.findOrderItemById(itemId);
    if (!item) throw new NotFoundError('Ítem de comanda no encontrado');

    const updatedItem = await this.orderRepo.updateOrderItemStatus(itemId, status);

    // Roll up order's kitchenStatus from all items
    const allItems = await this.orderRepo.findOrderItemsByOrderId(item.orderId);
    const nonCancelledItems = allItems.filter((i) => i.status !== 'cancelled');

    let rolledUpKitchenStatus = 'queued';
    if (nonCancelledItems.length === 0) {
      rolledUpKitchenStatus = 'cancelled';
    } else if (nonCancelledItems.every((i) => i.status === 'delivered')) {
      rolledUpKitchenStatus = 'delivered';
    } else if (nonCancelledItems.every((i) => i.status === 'ready' || i.status === 'delivered')) {
      rolledUpKitchenStatus = 'ready';
    } else if (nonCancelledItems.some((i) => i.status === 'in_preparation' || i.status === 'ready' || i.status === 'delivered')) {
      rolledUpKitchenStatus = 'in_preparation';
    } else {
      rolledUpKitchenStatus = 'queued';
    }

    const order = await this.orderRepo.findOrderById(item.orderId);

    let isOrderFullyClosed = false;
    let isTableFreed = false;
    let newTableStatus: string | null = null;

    if (rolledUpKitchenStatus === 'delivered') {
      if (order?.paymentStatus === 'paid') {
        // Condition met: paymentStatus === 'paid' AND kitchenStatus === 'delivered'
        // -> Order is completely closed and table is freed!
        isOrderFullyClosed = true;
        await this.orderRepo.updateOrderKitchenStatus(item.orderId, 'delivered', {
          status: 'paid',
          closedAt: new Date(),
        });
        if (order.tableId) {
          await this.orderRepo.freeTable(order.tableId);
          isTableFreed = true;
          newTableStatus = 'free';
        }
      } else {
        // Delivered, but waiting for payment!
        await this.orderRepo.updateOrderKitchenStatus(item.orderId, 'delivered');
        if (order?.tableId) {
          await this.orderRepo.setTableStatus(order.tableId, 'occupied');
          newTableStatus = 'occupied';
        }
      }
    } else {
      await this.orderRepo.updateOrderKitchenStatus(item.orderId, rolledUpKitchenStatus);
      if (order?.tableId && order?.paymentStatus === 'paid') {
        // Still cooking, but already paid!
        await this.orderRepo.setTableStatus(order.tableId, 'paid_waiting_food');
        newTableStatus = 'paid_waiting_food';
      }
    }

    return {
      updatedItem,
      orderId: item.orderId,
      tableId: order?.tableId || null,
      kitchenStatus: rolledUpKitchenStatus,
      isOrderFullyClosed,
      isTableFreed,
      newTableStatus,
    };
  }
}
