import { NotFoundError, ConflictError } from '../../../errors/app-error.js';
import { IOrderRepository } from '../interfaces/order.repository.interface.js';
import { auditService } from '../../../utils/audit.service.js';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_preparation', 'sent', 'ready', 'cancelled'],
  sent: ['in_preparation', 'pending', 'ready', 'cancelled'],
  in_preparation: ['ready', 'sent', 'pending', 'delivered', 'cancelled'],
  ready: ['delivered', 'in_preparation', 'sent', 'pending', 'cancelled'],
  delivered: ['ready', 'in_preparation'],
  cancelled: ['pending'],
};

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async getOrderById(orderId: string) {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundError('Comanda no encontrada');
    return order;
  }

  async getKdsOrders(venueId: string, station?: string, includeRecentCompleted = false) {
    return await this.orderRepo.findKdsOrders(venueId, station, includeRecentCompleted);
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

    if (item.status === status) {
      return {
        updatedItem: item,
        orderId: item.orderId,
        tableId: null,
        kitchenStatus: 'unchanged',
        isOrderFullyClosed: false,
        isTableFreed: false,
        newTableStatus: null,
      };
    }

    const allowed = ALLOWED_TRANSITIONS[item.status] || [];
    if (!allowed.includes(status)) {
      throw new ConflictError(
        `Transición no permitida: no se puede cambiar el ítem de '${item.status}' a '${status}'`
      );
    }

    // Extra timestamp adjustments for forward and reverse transitions
    const extraData: Record<string, any> = {};
    if ((status === 'sent' || status === 'in_preparation') && !item.sentAt) {
      extraData.sentAt = new Date();
    }
    if (status === 'ready') {
      extraData.readyAt = new Date();
    } else if (item.status === 'ready' && (status === 'in_preparation' || status === 'sent')) {
      extraData.readyAt = null;
    }

    if (status === 'delivered') {
      extraData.deliveredAt = new Date();
    } else if (item.status === 'delivered' && status === 'ready') {
      extraData.deliveredAt = null;
    }

    const updatedItem = await this.orderRepo.updateOrderItemStatus(itemId, status, extraData);

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
        await this.orderRepo.updateOrderKitchenStatus(item.orderId, 'delivered');
        if (order?.tableId) {
          await this.orderRepo.setTableStatus(order.tableId, 'occupied');
          newTableStatus = 'occupied';
        }
      }
    } else {
      // If rolling back from delivered and order was previously closed, re-open it
      const extraUpdates: Record<string, any> = {};
      if (order?.closedAt) {
        extraUpdates.closedAt = null;
        if (order.status === 'paid' && order.paymentStatus !== 'paid') {
          extraUpdates.status = 'open';
        }
      }

      await this.orderRepo.updateOrderKitchenStatus(item.orderId, rolledUpKitchenStatus, extraUpdates);

      if (order?.tableId) {
        if (order.paymentStatus === 'paid') {
          await this.orderRepo.setTableStatus(order.tableId, 'paid_waiting_food');
          newTableStatus = 'paid_waiting_food';
        } else {
          await this.orderRepo.setTableStatus(order.tableId, 'occupied');
          newTableStatus = 'occupied';
        }
      }
    }

    auditService.log({
      venueId: order?.venueId,
      action: 'order_item:status_updated',
      entityType: 'order_item',
      entityId: itemId,
      payload: { previousStatus: item.status, newStatus: status, rolledUpKitchenStatus },
    }).catch(() => {});

    return {
      updatedItem,
      orderId: item.orderId,
      venueId: order?.venueId,
      tableId: order?.tableId || null,
      kitchenStatus: rolledUpKitchenStatus,
      isOrderFullyClosed,
      isTableFreed,
      newTableStatus,
    };
  }
}
