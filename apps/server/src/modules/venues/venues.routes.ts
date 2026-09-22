import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { venuesController } from './venues.controller.js';

export async function venuesRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };
  const staffGuard = { preHandler: [fastify.authenticate] };

  // Venues Endpoints
  fastify.get('/api/venues', (req, rep) => venuesController.listVenues(req, rep));
  fastify.get('/api/venues/first', (req, rep) => venuesController.getFirstVenue(req, rep));
  fastify.get('/api/venues/:id', (req, rep) => venuesController.getVenueById(req, rep));
  fastify.get('/api/venues/:id/summary', staffGuard, (req, rep) => venuesController.getVenueSummary(req, rep));
  fastify.post('/api/venues', { preHandler: [fastify.authenticate, fastify.requireRole(['super_admin'])] }, (req, rep) =>
    venuesController.createVenue(req, rep)
  );
  fastify.patch('/api/venues/:id/settings', managerGuard, (req, rep) => venuesController.updateVenueSettings(req, rep));

  // Staff / Roles Endpoints
  fastify.get('/api/roles', staffGuard, (req, rep) => venuesController.getRoles(req, rep));
  fastify.get('/api/venues/:venueId/users', staffGuard, (req, rep) => venuesController.getVenueUsers(req, rep));
  fastify.post('/api/venues/:venueId/users', managerGuard, (req, rep) => venuesController.createUser(req, rep));
  fastify.patch('/api/venues/:venueId/users/:id', managerGuard, (req, rep) => venuesController.updateUser(req, rep));
  fastify.post('/api/venues/:venueId/users/:id/reset-pin', managerGuard, (req, rep) => venuesController.resetPin(req, rep));
  fastify.delete('/api/venues/:venueId/users/:id', managerGuard, (req, rep) => venuesController.deleteUser(req, rep));
}
