import { FastifyRequest, FastifyReply } from 'fastify';
import { tableRepository } from './repositories/table.repository.js';
import { ManageTablesUseCase } from './use-cases/manage-tables.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { validate } from '../../utils/validation.util.js';
import { BadRequestError } from '../../errors/app-error.js';
import {
  CreateFloorPlanSchema,
  CreateTableSchema,
  UpdateTableSchema,
  TableTransferSchema,
  TableMergeSchema,
} from '@poscocina/shared';

export class TablesController {
  private readonly useCase = new ManageTablesUseCase(tableRepository);

  async getFloorPlans(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const plans = await this.useCase.getFloorPlans(targetVenueId);
    return reply.send(plans);
  }

  async createFloorPlan(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const data = validate(CreateFloorPlanSchema, request.body);
    const plan = await this.useCase.createFloorPlan(targetVenueId, data);
    return reply.status(201).send(plan);
  }

  async getVenueTables(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const tables = await this.useCase.getVenueTables(targetVenueId);
    return reply.send(tables);
  }

  async createTable(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateTableSchema, request.body);
    const newTable = await this.useCase.createTable(data);
    request.server.io?.emit('table:created', newTable);
    return reply.status(201).send(newTable);
  }

  async updateTable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateTableSchema, request.body);
    const updated = await this.useCase.updateTable(id, data);
    request.server.io?.emit('table:updated', updated);
    return reply.send(updated);
  }

  async deleteTable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.useCase.deleteTable(id);
    request.server.io?.emit('table:deleted', { id });
    return reply.send(result);
  }

  async updateTableStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: any };
    if (!status) throw new BadRequestError('El estado de la mesa es requerido');
    const updated = await this.useCase.updateTableStatus(id, status);
    request.server.io?.emit('table:updated', updated);
    return reply.send(updated);
  }

  async transferTable(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(TableTransferSchema, request.body);
    const result = await this.useCase.transferTable(data.sourceTableId, data.targetTableId);

    request.server.io?.emit('table:transferred', result);
    request.server.io?.emit('table:updated', { id: data.sourceTableId, status: 'free', currentOrderId: null });
    request.server.io?.emit('table:updated', { id: data.targetTableId, status: 'occupied', currentOrderId: result.orderId });
    return reply.send(result);
  }

  async mergeTables(request: FastifyRequest, reply: FastifyReply) {
    // Reutilizar lógica básica de unión
    const data = validate(TableMergeSchema, request.body);
    const result = await this.useCase.transferTable(data.sourceTableId, data.targetTableId);
    request.server.io?.emit('table:merged', result);
    return reply.send(result);
  }
}

export const tablesController = new TablesController();
