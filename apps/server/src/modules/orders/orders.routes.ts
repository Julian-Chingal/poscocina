import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { ordersController } from './orders.controller.js';

export async function ordersRoutes(fastify: FastifyInstance) {
  const staffGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.WAITER, ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  // 1. Create order
  fastify.post('/api/orders', staffGuard, (req, rep) => ordersController.createOrder(req, rep));

  // 2. Get order by ID
  fastify.get('/api/orders/:id', { preHandler: [fastify.authenticate] }, (req, rep) =>
    ordersController.getOrderById(req, rep)
  );

  // 3. Append items
  fastify.post('/api/orders/:id/items', staffGuard, (req, rep) => ordersController.appendItems(req, rep));

  // 4. Update order status
  fastify.patch('/api/orders/:id/status', staffGuard, (req, rep) => ordersController.updateOrderStatus(req, rep));

  // 5. KDS active orders
  fastify.get('/api/venues/:venueId/kds/orders', { preHandler: [fastify.authenticate] }, (req, rep) =>
    ordersController.getKdsOrders(req, rep)
  );

  // 6. Update KDS item status
  fastify.patch('/api/order-items/:id/status', { preHandler: [fastify.authenticate] }, (req, rep) =>
    ordersController.updateOrderItemStatus(req, rep)
  );
}
