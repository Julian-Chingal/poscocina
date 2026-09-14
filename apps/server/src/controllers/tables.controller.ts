import { FastifyRequest, FastifyReply } from 'fastify';
import { tablesService } from '../services/tables.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { validate } from '../utils/validation.util.js';
import { BadRequestError } from '../errors/app-error.js';
import {
  CreateFloorPlanSchema,
  CreateTableSchema,
  UpdateTableSchema,
  TableTransferSchema,
  TableMergeSchema,
} from '@poscocina/shared';

export class TablesController {
  async getFloorPlans(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const plans = await tablesService.getFloorPlans(targetVenueId);
    return reply.send(plans);
  }

  async createFloorPlan(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const data = validate(CreateFloorPlanSchema, request.body);

    const plan = await tablesService.createFloorPlan(targetVenueId, data);
    return reply.status(201).send(plan);
  }

  async getVenueTables(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const tables = await tablesService.getVenueTables(targetVenueId);
    return reply.send(tables);
  }

  async createTable(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateTableSchema, request.body);

    const newTable = await tablesService.createTable(data);
    request.server.io?.emit('table:created', newTable);
    return reply.status(201).send(newTable);
  }

  async updateTable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateTableSchema, request.body);

    const updated = await tablesService.updateTable(id, data);
    request.server.io?.emit('table:updated', updated);
    return reply.send(updated);
  }

  async deleteTable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await tablesService.deleteTable(id);
    request.server.io?.emit('table:deleted', { id });
    return reply.send(result);
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

  async transferTable(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(TableTransferSchema, request.body);
    const result = await tablesService.transferTable(data.sourceTableId, data.targetTableId);

    // Broadcast table updates
    request.server.io?.emit('table:transferred', result);
    request.server.io?.emit('table:updated', { id: data.sourceTableId, status: 'free', currentOrderId: null });
    request.server.io?.emit('table:updated', { id: data.targetTableId, status: 'occupied', currentOrderId: result.orderId });

    return reply.send(result);
  }

  async mergeTables(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(TableMergeSchema, request.body);
    const result = await tablesService.mergeTables(data.sourceTableId, data.targetTableId);

    const targetOrderId = 'consolidatedOrderId' in result ? result.consolidatedOrderId : result.orderId;

    request.server.io?.emit('table:merged', result);
    request.server.io?.emit('table:updated', { id: data.sourceTableId, status: 'free', currentOrderId: null });
    request.server.io?.emit('table:updated', {
      id: data.targetTableId,
      status: 'occupied',
      currentOrderId: targetOrderId,
    });

    return reply.send(result);
  }
}

export const tablesController = new TablesController();

