import { FastifyInstance } from 'fastify';
import { reservationsController } from './reservations.controller.js';

export async function reservationsRoutes(fastify: FastifyInstance) {
  const authGuard = { preHandler: [fastify.authenticate] };

  fastify.get('/api/venues/:venueId/reservations', authGuard, (req, rep) => reservationsController.getReservations(req, rep));
  fastify.get('/api/reservations', authGuard, (req, rep) => reservationsController.getReservations(req, rep));
  fastify.get('/api/reservations/:id', authGuard, (req, rep) => reservationsController.getById(req, rep));

  fastify.post('/api/venues/:venueId/reservations', authGuard, (req, rep) => reservationsController.create(req, rep));
  fastify.post('/api/reservations', authGuard, (req, rep) => reservationsController.create(req, rep));

  fastify.patch('/api/reservations/:id/status', authGuard, (req, rep) => reservationsController.updateStatus(req, rep));
  fastify.post('/api/reservations/:id/seat', authGuard, (req, rep) => reservationsController.seat(req, rep));
}
