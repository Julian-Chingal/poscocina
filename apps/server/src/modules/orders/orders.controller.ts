import { FastifyRequest, FastifyReply } from 'fastify';
import { orderRepository } from './repositories/order.repository.js';
import { CreateOrderUseCase } from './use-cases/create-order.use-case.js';
import { AppendOrderItemsUseCase } from './use-cases/append-order-items.use-case.js';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.use-case.js';
import { ModifyOrderItemUseCase } from './use-cases/modify-order-item.use-case.js';
import { UpdateOrderItemStationStatusUseCase } from './use-cases/update-order-item-station-status.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import {
  CreateOrderSchema,
  CreateDeliveryOrderSchema,
  UpdateItemStatusSchema,
  AppendOrderItemsSchema,
  UpdateOrderStatusSchema,
  ModifyOrderItemSchema,
  UpdateOrderItemStationStatusSchema,
  ConfirmTransferPaymentSchema,
  CompleteDeliverySchema,
  AssignDriverSchema,
} from '@poscocina/shared';
import { confirmTransferPaymentUseCase } from './use-cases/confirm-transfer-payment.use-case.js';
import { completeDeliveryUseCase } from './use-cases/complete-delivery.use-case.js';
import { assignDriverUseCase } from './use-cases/assign-driver.use-case.js';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export class OrdersController {
  private readonly createUseCase = new CreateOrderUseCase(orderRepository);
  private readonly appendUseCase = new AppendOrderItemsUseCase(orderRepository);
  private readonly statusUseCase = new UpdateOrderStatusUseCase(orderRepository);
  private readonly modifyUseCase = new ModifyOrderItemUseCase(orderRepository);
  private readonly stationStatusUseCase = new UpdateOrderItemStationStatusUseCase(orderRepository);

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

  async createDeliveryOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateDeliveryOrderSchema, request.body);
    const result = await this.createUseCase.execute({
      venueId: data.venueId,
      orderType: 'delivery',
      customer: data.customer,
      guestName: data.customer.name,
      notes: [
        data.deliveryNotes,
        `Dirección: ${data.customer.address}`,
        `Teléfono: ${data.customer.phone}`,
        `Pago: ${data.paymentMethod}${data.cashPaymentAmount ? ` (Paga con: $${data.cashPaymentAmount})` : ''}`,
      ].filter(Boolean).join(' | '),
      items: data.items,
    });

    // Generate Double PIN handshake and calculate 3-way delivery fee
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryFee = 5000;
    const driverPayout = 4000; // 80% to courier
    const platformFee = 1000;  // 20% to platform
    const foodSubtotal = parseFloat(result.order?.subtotal || '0');
    const grandTotal = foodSubtotal + deliveryFee;

    if (result.order?.id) {
      await db
        .update(schema.orders)
        .set({
          pickupPin,
          deliveryPin,
          deliveryFee: deliveryFee.toFixed(2),
          driverPayout: driverPayout.toFixed(2),
          platformFee: platformFee.toFixed(2),
          dispatchStatus: 'seeking_driver',
          total: grandTotal.toFixed(2),
        })
        .where(eq(schema.orders.id, result.order.id));

      result.order.pickupPin = pickupPin;
      result.order.deliveryPin = deliveryPin;
      result.order.deliveryFee = deliveryFee.toFixed(2);
      result.order.driverPayout = driverPayout.toFixed(2);
      result.order.platformFee = platformFee.toFixed(2);
      result.order.dispatchStatus = 'seeking_driver';
      result.order.total = grandTotal.toFixed(2);
    }

    this.emitToVenue(request, data.venueId, 'order:created', result);
    // Broadcast gig to open city drivers pool
    request.server.io?.emit('delivery:new_available', {
      orderId: result.order?.id,
      venueId: data.venueId,
      driverPayout,
    });

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

  async updateOrderItemStationStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id, stationId } = request.params as { id: string; stationId: string };
    const { status } = validate(UpdateOrderItemStationStatusSchema, request.body);
    const result = await this.stationStatusUseCase.execute(id, stationId, status);

    const venueId = result.venueId;
    this.emitToVenue(request, venueId, 'order_item:station_updated', {
      orderItemId: id,
      stationId,
      status: result.stationStatus,
      itemStatus: result.itemStatus,
      updatedItem: result.updatedItem,
    });
    this.emitToVenue(request, venueId, 'order_item:updated', result.updatedItem);
    this.emitToVenue(request, venueId, 'order:status_updated', {
      id: result.orderId,
      kitchenStatus: result.kitchenStatus,
    });
    this.emitToVenue(request, venueId, 'kds:item_updated', {
      orderId: result.orderId,
      item: result.updatedItem,
    });

    return reply.send(result);
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

  async confirmTransferPayment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(ConfirmTransferPaymentSchema, request.body);
    const userId = (request as any).user?.sub;
    const result = await confirmTransferPaymentUseCase.execute(id, data, userId, request.server.io);
    return reply.send(result);
  }

  async completeDelivery(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(CompleteDeliverySchema, request.body);
    const driverId = (request as any).user?.sub;
    const result = await completeDeliveryUseCase.execute(id, data, driverId, request.server.io);
    return reply.send(result);
  }

  async assignDriver(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(AssignDriverSchema, request.body);
    const result = await assignDriverUseCase.execute(id, data, request.server.io);
    return reply.send(result);
  }

  async getDriverOrders(request: FastifyRequest, reply: FastifyReply) {
    const driverId = (request as any).user?.sub;
    if (!driverId) {
      return reply.status(401).send({ error: 'Usuario no autenticado' });
    }

    const assignedOrders = await db.query.orders.findMany({
      where: eq(schema.orders.driverId, driverId),
      with: {
        customer: true,
        items: {
          with: {
            product: true,
            modifiers: true,
          },
        },
      },
      orderBy: desc(schema.orders.openedAt),
      limit: 50,
    });

    return reply.send(assignedOrders);
  }
}

export const ordersController = new OrdersController();
