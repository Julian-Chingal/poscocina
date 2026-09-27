import { FastifyRequest, FastifyReply } from 'fastify';
import { orderRepository } from './repositories/order.repository.js';
import { CreateOrderUseCase } from './use-cases/create-order.use-case.js';
import { AppendOrderItemsUseCase } from './use-cases/append-order-items.use-case.js';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.use-case.js';
import { ModifyOrderItemUseCase } from './use-cases/modify-order-item.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import {
  CreateOrderSchema,
  UpdateItemStatusSchema,
  AppendOrderItemsSchema,
  UpdateOrderStatusSchema,
  ModifyOrderItemSchema,
} from '@poscocina/shared';

export class OrdersController {
  private readonly createUseCase = new CreateOrderUseCase(orderRepository);
  private readonly appendUseCase = new AppendOrderItemsUseCase(orderRepository);
  private readonly statusUseCase = new UpdateOrderStatusUseCase(orderRepository);
  private readonly modifyUseCase = new ModifyOrderItemUseCase(orderRepository);

  private emitToVenue(request: FastifyRequest, venueId: string | undefined, event: string, payload: any) {
    if (!request.server.io) return;
    if (venueId) {
      request.server.io.to(`venue:${venueId}`).emit(event, payload);
    }
    // Also emit broadcast to ensure legacy/station listeners receive the message
    request.server.io.emit(event, payload);
  }

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateOrderSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);
    const result = await this.createUseCase.execute({ ...data, venueId: targetVenueId });

    this.emitToVenue(request, targetVenueId, 'order:created', result);
    if (result.tableId) {
      this.emitToVenue(request, targetVenueId, 'table:status_changed', {
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

    const venueId = result.order?.venueId;
    this.emitToVenue(request, venueId, 'order:items_appended', { orderId: id, order: result.order, items: result.items });
    this.emitToVenue(request, venueId, 'kds:new_items', { orderId: id, items: result.items });
    return reply.status(201).send(result);
  }

  async updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = validate(UpdateOrderStatusSchema, request.body);
    const updated = await this.statusUseCase.updateOrderStatus(id, status);

    const venueId = updated?.venueId;
    this.emitToVenue(request, venueId, 'order:status_updated', updated);
    if (updated.tableId) {
      this.emitToVenue(request, venueId, 'table:status_changed', {
        tableId: updated.tableId,
        status: updated.status === 'check_requested' ? 'check_requested' : undefined,
        currentOrderId: updated.id,
      });
    }
    return reply.send(updated);
  }

  async getKdsOrders(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const { station, history } = request.query as { station?: string; history?: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const includeRecentCompleted = history === 'true' || history === '1';
    const activeOrders = await this.statusUseCase.getKdsOrders(targetVenueId, station, includeRecentCompleted);
    return reply.send(activeOrders);
  }

  async updateOrderItemStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = validate(UpdateItemStatusSchema, request.body);
    const result = await this.statusUseCase.updateOrderItemStatus(id, status);

    const venueId = result.venueId;
    this.emitToVenue(request, venueId, 'order_item:updated', result.updatedItem);
    this.emitToVenue(request, venueId, 'order:status_updated', {
      id: result.orderId,
      kitchenStatus: result.kitchenStatus,
      status: result.isOrderFullyClosed ? 'paid' : undefined,
      closedAt: result.isOrderFullyClosed ? new Date() : undefined,
    });

    if (result.tableId && result.newTableStatus) {
      this.emitToVenue(request, venueId, 'table:status_changed', {
        tableId: result.tableId,
        status: result.newTableStatus,
        currentOrderId: result.isTableFreed ? null : result.orderId,
      });
    }

    return reply.send(result.updatedItem);
  }

  async modifyOrderItem(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(ModifyOrderItemSchema, request.body);
    const result = await this.modifyUseCase.execute(id, data);

    const venueId = result.venueId;
    this.emitToVenue(request, venueId, 'order_item:updated', {
      ...result.updatedItem,
      wasModifiedHot: true,
    });
    this.emitToVenue(request, venueId, 'order:totals_updated', {
      orderId: result.orderId,
      order: result.order,
    });
    this.emitToVenue(request, venueId, 'kds:item_updated', {
      orderId: result.orderId,
      item: result.updatedItem,
      wasModifiedHot: true,
    });

    return reply.send(result);
  }

  async deleteOrderItem(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { kitchenApproved, source } = request.query as { kitchenApproved?: string; source?: string };
    const isApproved = kitchenApproved === 'true' || kitchenApproved === '1';

    const result = await this.modifyUseCase.removeItem(id, isApproved, source || 'pos');

    const venueId = result.venueId;
    this.emitToVenue(request, venueId, 'order_item:removed', {
      orderId: result.orderId,
      itemId: id,
    });
    this.emitToVenue(request, venueId, 'order:totals_updated', {
      orderId: result.orderId,
      order: result.order,
    });
    this.emitToVenue(request, venueId, 'kds:item_removed', {
      orderId: result.orderId,
      itemId: id,
    });

    return reply.send({ success: true, ...result });
  }
}

export const ordersController = new OrdersController();
