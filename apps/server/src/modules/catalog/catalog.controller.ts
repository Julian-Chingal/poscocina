import { FastifyRequest, FastifyReply } from 'fastify';
import { catalogRepository } from './repositories/catalog.repository.js';
import { ManageCatalogUseCase } from './use-cases/manage-catalog.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { validate } from '../../utils/validation.util.js';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateProductSchema,
  UpdateProductSchema,
} from '@poscocina/shared';

export class CatalogController {
  private readonly useCase = new ManageCatalogUseCase(catalogRepository);

  async getVenueCatalog(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const catalog = await this.useCase.getVenueCatalog(targetVenueId);
    return reply.send(catalog);
  }

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const data = validate(CreateCategorySchema, request.body);
    const newCategory = await this.useCase.createCategory(targetVenueId, data);

    request.server.io?.emit('catalog:category_created', newCategory);
    return reply.status(201).send(newCategory);
  }

  async updateCategory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateCategorySchema, request.body);
    const updated = await this.useCase.updateCategory(id, data);

    request.server.io?.emit('catalog:category_updated', updated);
    return reply.send(updated);
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.useCase.deleteCategory(id);

    request.server.io?.emit('catalog:category_deleted', { id });
    return reply.send(result);
  }

  async createProduct(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateProductSchema, request.body);
    const newProduct = await this.useCase.createProduct(data);

    request.server.io?.emit('catalog:product_created', newProduct);
    return reply.status(201).send(newProduct);
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateProductSchema, request.body);
    const updated = await this.useCase.updateProduct(id, data);

    request.server.io?.emit('catalog:product_updated', updated);
    return reply.send(updated);
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.useCase.deleteProduct(id);

    request.server.io?.emit('catalog:product_deleted', { id });
    return reply.send(result);
  }

  async toggleProductAvailability(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updated = await this.useCase.toggleAvailability(id);

    request.server.io?.emit('catalog:product_updated', updated);
    return reply.send(updated);
  }
}

export const catalogController = new CatalogController();
