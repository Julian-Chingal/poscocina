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

  // 2. Get order by ID (Staff)
  fastify.get(
    '/api/orders/:id',
    { preHandler: [fastify.authenticate] },
    (request, reply) => ordersController.getOrderById(request, reply)
  );

  // 3. Append items to existing order (Staff: Waiter, Cashier, Manager, Admin)
  fastify.post(
    '/api/orders/:id/items',
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole([ROLES.WAITER, ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN]),
      ],
    },
    (request, reply) => ordersController.appendItems(request, reply)
  );

  // 4. Update order status (e.g. check_requested) (Staff: Waiter, Cashier, Manager, Admin)
  fastify.patch(
    '/api/orders/:id/status',
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole([ROLES.WAITER, ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN]),
      ],
    },
    (request, reply) => ordersController.updateOrderStatus(request, reply)
  );

  // 5. Get active orders for KDS (Authenticated terminals)
  fastify.get(
    '/api/venues/:venueId/kds/orders',
    { preHandler: [fastify.authenticate] },
    (request, reply) => ordersController.getKdsOrders(request, reply)
  );

  // 6. Update Order Item Status (KDS bump bar / Kitchen click)
  fastify.patch(
    '/api/order-items/:id/status',
    { preHandler: [fastify.authenticate] },
    (request, reply) => ordersController.updateOrderItemStatus(request, reply)
  );
}

