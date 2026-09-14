import { FastifyRequest, FastifyReply } from 'fastify';
import { ordersService } from '../services/orders.service.js';
import { validate } from '../utils/validation.util.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { CreateOrderSchema, UpdateItemStatusSchema } from '@poscocina/shared';

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

  async getKdsOrders(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const activeOrders = await ordersService.getKdsOrders(targetVenueId);
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
