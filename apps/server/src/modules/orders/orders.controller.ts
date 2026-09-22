import { FastifyRequest, FastifyReply } from 'fastify';
import { orderRepository } from './repositories/order.repository.js';
import { CreateOrderUseCase } from './use-cases/create-order.use-case.js';
import { AppendOrderItemsUseCase } from './use-cases/append-order-items.use-case.js';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import {
  CreateOrderSchema,
  UpdateItemStatusSchema,
  AppendOrderItemsSchema,
  UpdateOrderStatusSchema,
} from '@poscocina/shared';

export class OrdersController {
  private readonly createUseCase = new CreateOrderUseCase(orderRepository);
  private readonly appendUseCase = new AppendOrderItemsUseCase(orderRepository);
  private readonly statusUseCase = new UpdateOrderStatusUseCase(orderRepository);

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateOrderSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);
    const result = await this.createUseCase.execute({ ...data, venueId: targetVenueId });

    request.server.io?.emit('order:created', result);
    if (result.tableId) {
      request.server.io?.emit('table:status_changed', {
        tableId: result.tableId,
        status: 'occupied',
        currentOrderId: result.order.id,
      });
    }
    return reply.status(201).send(result);
  }

  async getOrderById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const order = await this.statusUseCase.getOrderById(id);
    return reply.send(order);
  }

  async appendItems(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { items } = validate(AppendOrderItemsSchema, request.body);
    const result = await this.appendUseCase.execute(id, items);

    request.server.io?.emit('order:items_appended', { orderId: id, order: result.order, items: result.items });
    request.server.io?.emit('kds:new_items', { orderId: id, items: result.items });
    return reply.status(201).send(result);
  }

  async updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = validate(UpdateOrderStatusSchema, request.body);
    const updated = await this.statusUseCase.updateOrderStatus(id, status);

    request.server.io?.emit('order:status_updated', updated);
    if (updated.tableId) {
      request.server.io?.emit('table:status_changed', {
        tableId: updated.tableId,
        status: updated.status === 'check_requested' ? 'check_requested' : undefined,
        currentOrderId: updated.id,
      });
    }
    return reply.send(updated);
  }

  async getKdsOrders(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const { station } = request.query as { station?: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const activeOrders = await this.statusUseCase.getKdsOrders(targetVenueId, station);
    return reply.send(activeOrders);
  }

  async updateOrderItemStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = validate(UpdateItemStatusSchema, request.body);
    const updated = await this.statusUseCase.updateOrderItemStatus(id, status);

    request.server.io?.emit('order_item:updated', updated);
    return reply.send(updated);
  }
}

export const ordersController = new OrdersController();
