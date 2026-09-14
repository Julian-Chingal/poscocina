import { FastifyRequest, FastifyReply } from 'fastify';
import { tablesService } from '../services/tables.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { BadRequestError } from '../errors/app-error.js';

export class TablesController {
  async getVenueTables(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const tables = await tablesService.getVenueTables(targetVenueId);
    return reply.send(tables);
  }

  async updateTableStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = request.body as {
      status: 'free' | 'occupied' | 'check_requested' | 'reserved' | 'blocked';
    };

    if (!status) {
      throw new BadRequestError('El estado de la mesa (status) es requerido.');
    }

    const updated = await tablesService.updateTableStatus(id, status);

    // Broadcast table status change
    request.server.io?.emit('table:updated', updated);

    return reply.send(updated);
  }
}

export const tablesController = new TablesController();
