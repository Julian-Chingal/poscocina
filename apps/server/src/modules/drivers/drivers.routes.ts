import { FastifyInstance } from 'fastify';
import { driversController } from './drivers.controller.js';

export async function driversRoutes(fastify: FastifyInstance) {
  // Public registration for couriers
  fastify.post('/api/driver/register', (req, rep) => driversController.register(req, rep));

  // Authenticated driver operations
  const driverGuard = { preHandler: [fastify.authenticate] };

  fastify.get('/api/driver/profile', driverGuard, (req, rep) => driversController.getProfile(req, rep));
  fastify.patch('/api/driver/status', driverGuard, (req, rep) => driversController.updateStatus(req, rep));
  fastify.get('/api/driver/available-orders', driverGuard, (req, rep) => driversController.getAvailableOrders(req, rep));
  fastify.post('/api/driver/orders/:id/claim', driverGuard, (req, rep) => driversController.claimOrder(req, rep));
  fastify.post('/api/driver/orders/:id/confirm-pickup', driverGuard, (req, rep) => driversController.confirmPickup(req, rep));
  fastify.post('/api/driver/orders/:id/complete-delivery', driverGuard, (req, rep) => driversController.completeDelivery(req, rep));
  fastify.get('/api/driver/wallet', driverGuard, (req, rep) => driversController.getWallet(req, rep));
}
