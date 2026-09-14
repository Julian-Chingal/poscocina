import { FastifyRequest, FastifyReply } from 'fastify';
import { usersService } from '../services/users.service.js';
import { validate } from '../utils/validation.util.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { CreateUserSchema, UpdateUserSchema, ResetPinSchema } from '@poscocina/shared';

export class UsersController {
  async getRoles(request: FastifyRequest, reply: FastifyReply) {
    const roles = await usersService.getRoles();
    return reply.send(roles);
  }

  async getVenueUsers(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const users = await usersService.getVenueUsers(targetVenueId);
    return reply.send(users);
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const data = validate(CreateUserSchema, request.body);

    const newUser = await usersService.createUser(targetVenueId, data, request.user?.sub);
    return reply.status(201).send(newUser);
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateUserSchema, request.body);

    const updated = await usersService.updateUser(id, data, request.user?.sub);
    return reply.send(updated);
  }

  async resetPin(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(ResetPinSchema, request.body);

    const result = await usersService.resetPin(id, data.newPin, request.user?.sub);
    return reply.send(result);
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await usersService.deleteUser(id, request.user?.sub);
    return reply.send(result);
  }
}

export const usersController = new UsersController();
