import { FastifyInstance } from 'fastify';
import { reservationsController } from '../controllers/reservations.controller.js';

export async function reservationsRoutes(fastify: FastifyInstance) {
  const authGuard = {
    preHandler: [fastify.authenticate],
  };

  // Get reservations for venue (optional ?date=YYYY-MM-DD)
  fastify.get('/api/venues/:venueId/reservations', authGuard, (req, rep) =>
    reservationsController.getReservations(req, rep)
  );

  fastify.get('/api/reservations', authGuard, (req, rep) =>
    reservationsController.getReservations(req, rep)
  );

  fastify.get('/api/reservations/:id', authGuard, (req, rep) =>
    reservationsController.getById(req, rep)
  );

  // Create reservation
  fastify.post('/api/venues/:venueId/reservations', authGuard, (req, rep) =>
    reservationsController.create(req, rep)
  );

  fastify.post('/api/reservations', authGuard, (req, rep) =>
    reservationsController.create(req, rep)
  );

  // Update status (confirm, cancel, no_show)
  fastify.patch('/api/reservations/:id/status', authGuard, (req, rep) =>
    reservationsController.updateStatus(req, rep)
  );

  // Seat customer and transition table to occupied
  fastify.post('/api/reservations/:id/seat', authGuard, (req, rep) =>
    reservationsController.seat(req, rep)
  );
}
