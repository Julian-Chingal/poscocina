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
    return await this.orderRepo.updateOrderItemStatus(itemId, status);
  }
}
