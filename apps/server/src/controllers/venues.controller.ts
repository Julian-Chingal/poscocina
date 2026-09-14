import { FastifyRequest, FastifyReply } from 'fastify';
import { venuesService } from '../services/venues.service.js';

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

  async updateVenueSettings(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      address?: string;
      timezone?: string;
      settings?: Record<string, unknown>;
    };

    const updated = await venuesService.updateVenueSettings(id, body);

    // Broadcast updated settings to connected clients in real time
    request.server.io?.emit('venue:settings_updated', updated);

    return reply.send(updated);
  }
}

export const venuesController = new VenuesController();
