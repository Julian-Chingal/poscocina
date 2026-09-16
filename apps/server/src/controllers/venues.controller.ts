import { FastifyRequest, FastifyReply } from 'fastify';
import { venuesService } from '../services/venues.service.js';
import { validate } from '../utils/validation.util.js';
import { CreateVenueSchema, UpdateVenueSchema } from '@poscocina/shared';

export class VenuesController {
  async listVenues(_request: FastifyRequest, reply: FastifyReply) {
    const venues = await venuesService.listVenues();
    return reply.send(venues);
  }

  async getFirstVenue(_request: FastifyRequest, reply: FastifyReply) {
    const venue = await venuesService.getFirstVenue();
    return reply.send(venue);
  }

  async getVenueById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const venue = await venuesService.getVenueById(id);
    return reply.send(venue);
  }

  async getVenueSummary(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const summary = await venuesService.getVenueSummary(id);
    return reply.send(summary);
  }

  async createVenue(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateVenueSchema, request.body);
    const created = await venuesService.createVenue(data);

    // Broadcast new venue creation
    request.server.io?.emit('venue:created', created);

    return reply.status(201).send(created);
  }

  async updateVenueSettings(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateVenueSchema, request.body);

    const updated = await venuesService.updateVenueSettings(id, data);

    // Broadcast updated settings to connected clients in real time
    request.server.io?.emit('venue:settings_updated', updated);

    return reply.send(updated);
  }
}

export const venuesController = new VenuesController();
