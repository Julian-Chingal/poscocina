import { FastifyInstance } from 'fastify';
import { ordersController } from '../controllers/orders.controller.js';

export async function ordersRoutes(fastify: FastifyInstance) {
  // 1. Create order
  fastify.post('/api/orders', (request, reply) => ordersController.createOrder(request, reply));

  // 2. Get active orders for KDS
  fastify.get('/api/venues/:venueId/kds/orders', (request, reply) =>
    ordersController.getKdsOrders(request, reply)
  );

  // 3. Update Order Item Status (KDS bump bar / click)
  fastify.patch('/api/order-items/:id/status', (request, reply) =>
    ordersController.updateOrderItemStatus(request, reply)
  );
}
