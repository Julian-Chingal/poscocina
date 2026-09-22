import { FastifyRequest, FastifyReply } from 'fastify';
import { customerRepository } from './repositories/customer.repository.js';
import { ManageCustomersUseCase } from './use-cases/manage-customers.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { validate } from '../../utils/validation.util.js';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@poscocina/shared';

export class CustomersController {
  private readonly useCase = new ManageCustomersUseCase(customerRepository);

  async search(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const { q, limit } = request.query as { q?: string; limit?: string };
    const results = await this.useCase.search(venueId, q, limit ? parseInt(limit, 10) : 20);
    return reply.send(results);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customer = await this.useCase.getById(id);
    return reply.send(customer);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const data = validate(CreateCustomerSchema, request.body);
    const customer = await this.useCase.create({ ...data, venueId });
    return reply.status(201).send(customer);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateCustomerSchema, request.body);
    const updated = await this.useCase.update(id, data);
    return reply.send(updated);
  }
}

export const customersController = new CustomersController();
