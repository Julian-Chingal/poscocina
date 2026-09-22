import { FastifyRequest, FastifyReply } from 'fastify';
import { venueRepository } from './repositories/venue.repository.js';
import { ManageVenuesUseCase } from './use-cases/manage-venues.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { CreateVenueSchema, UpdateVenueSchema, CreateUserSchema, UpdateUserSchema, ResetPinSchema } from '@poscocina/shared';

export class VenuesController {
  private readonly useCase = new ManageVenuesUseCase(venueRepository);

  async listVenues(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(await this.useCase.listVenues());
  }

  async getFirstVenue(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(await this.useCase.getFirstVenue());
  }

  async getVenueById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return reply.send(await this.useCase.getVenueById(id));
  }

  async getVenueSummary(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return reply.send(await this.useCase.getVenueSummary(id));
  }

  async createVenue(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateVenueSchema, request.body);
    const created = await this.useCase.createVenue(data);
    request.server.io?.emit('venue:created', created);
    return reply.status(201).send(created);
  }

  async updateVenueSettings(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateVenueSchema, request.body);
    const updated = await this.useCase.updateVenueSettings(id, data);
    request.server.io?.emit('venue:settings_updated', updated);
    return reply.send(updated);
  }

  // Staff Handlers
  async getRoles(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(await this.useCase.getRoles());
  }

  async getVenueUsers(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    return reply.send(await this.useCase.getVenueUsers(targetVenueId));
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const data = validate(CreateUserSchema, request.body);
    const newUser = await this.useCase.createUser(targetVenueId, data, request.user?.sub);
    request.server.io?.emit('user:created', newUser);
    return reply.status(201).send(newUser);
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateUserSchema, request.body);
    const updated = await this.useCase.updateUser(id, data, request.user?.sub);
    request.server.io?.emit('user:updated', updated);
    if (data.isActive === false) {
      request.server.io?.emit('user:deactivated', { userId: id });
    }
    return reply.send(updated);
  }

  async resetPin(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(ResetPinSchema, request.body);
    const result = await this.useCase.resetPin(id, data.newPin, request.user?.sub);
    request.server.io?.emit('user:pin_reset', { userId: id });
    return reply.send(result);
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.useCase.deleteUser(id, request.user?.sub);
    request.server.io?.emit('user:deactivated', { userId: id });
    return reply.send(result);
  }
}

export const venuesController = new VenuesController();
