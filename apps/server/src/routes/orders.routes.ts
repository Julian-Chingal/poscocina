import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { ordersController } from '../controllers/orders.controller.js';

export async function ordersRoutes(fastify: FastifyInstance) {
  // 1. Create order (Staff only: Waiter, Cashier, Manager, Admin)
  fastify.post(
    '/api/orders',
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole([ROLES.WAITER, ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN]),
      ],
    },
    (request, reply) => ordersController.createOrder(request, reply)
  );

  // 2. Get active orders for KDS (Authenticated terminals)
  fastify.get(
    '/api/venues/:venueId/kds/orders',
    { preHandler: [fastify.authenticate] },
    (request, reply) => ordersController.getKdsOrders(request, reply)
  );

  // 3. Update Order Item Status (KDS bump bar / Kitchen click)
  fastify.patch(
    '/api/order-items/:id/status',
    { preHandler: [fastify.authenticate] },
    (request, reply) => ordersController.updateOrderItemStatus(request, reply)
  );
}
