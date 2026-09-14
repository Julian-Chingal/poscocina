import { FastifyRequest, FastifyReply } from 'fastify';
import { ordersService } from '../services/orders.service.js';
import { validate } from '../utils/validation.util.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import {
  CreateOrderSchema,
  UpdateItemStatusSchema,
  AppendOrderItemsSchema,
  UpdateOrderStatusSchema,
} from '@poscocina/shared';

export class OrdersController {
  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateOrderSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);

    const result = await ordersService.createOrder({
      ...data,
      venueId: targetVenueId,
    });

    // Real-time broadcast
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
    const order = await ordersService.getOrderById(id);
    return reply.send(order);
  }

  async appendItems(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { items } = validate(AppendOrderItemsSchema, request.body);

    const result = await ordersService.appendItemsToOrder(id, items);

    // Broadcast to KDS and POS
    request.server.io?.emit('order:items_appended', {
      orderId: id,
      order: result.order,
      items: result.items,
    });
    request.server.io?.emit('kds:new_items', {
      orderId: id,
      items: result.items,
    });

    return reply.status(201).send(result);
  }

  async updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = validate(UpdateOrderStatusSchema, request.body);

    const updated = await ordersService.updateOrderStatus(id, status);

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

    const activeOrders = await ordersService.getKdsOrders(targetVenueId, station);
    return reply.send(activeOrders);
  }

  async updateOrderItemStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = validate(UpdateItemStatusSchema, request.body);

    const updated = await ordersService.updateOrderItemStatus(id, status);

    // Broadcast status change
    request.server.io?.emit('order_item:updated', updated);

    return reply.send(updated);
  }
}

export const ordersController = new OrdersController();

