import { FastifyRequest, FastifyReply } from 'fastify';
import { customersService } from '../services/customers.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@poscocina/shared';
import { BadRequestError } from '../errors/app-error.js';

export class CustomersController {
  async search(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const { q, limit } = request.query as { q?: string; limit?: string };

    const results = await customersService.searchCustomers(venueId, q, limit ? parseInt(limit, 10) : 20);
    return reply.send(results);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customer = await customersService.getCustomerById(id);
    return reply.send(customer);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const parsed = CreateCustomerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const customer = await customersService.createCustomer({
      ...parsed.data,
      venueId,
    });

    return reply.status(201).send(customer);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = UpdateCustomerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const updated = await customersService.updateCustomer(id, parsed.data);
    return reply.send(updated);
  }
}

export const customersController = new CustomersController();
