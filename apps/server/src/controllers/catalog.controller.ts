import { FastifyRequest, FastifyReply } from 'fastify';
import { catalogService } from '../services/catalog.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';

export class CatalogController {
  async getVenueCatalog(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const catalog = await catalogService.getVenueCatalog(targetVenueId);
    return reply.send(catalog);
  }

  async toggleProductAvailability(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const updated = await catalogService.toggleProductAvailability(id);

    // Real-time broadcast
    request.server.io?.emit('catalog:product_updated', updated);

    return reply.send(updated);
  }
}

export const catalogController = new CatalogController();
