import path from 'path';
import { FastifyRequest, FastifyReply } from 'fastify';
import { catalogRepository } from './repositories/catalog.repository.js';
import { ManageCatalogUseCase } from './use-cases/manage-catalog.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { validate } from '../../utils/validation.util.js';
import { storageService } from '../../services/storage.service.js';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateProductSchema,
  UpdateProductSchema,
  CreateModifierGroupSchema,
  UpdateModifierGroupSchema,
  CreateModifierSchema,
  UpdateModifierSchema,
  LinkProductModifierGroupSchema,
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

  // Modifier Groups & Modifiers
  async getModifierGroups(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const groups = await this.useCase.getModifierGroups(targetVenueId);
    return reply.send(groups);
  }

  async createModifierGroup(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const data = validate(CreateModifierGroupSchema, request.body);
    const newGroup = await this.useCase.createModifierGroup(targetVenueId, data);

    request.server.io?.emit('catalog:modifier_group_created', newGroup);
    return reply.status(201).send(newGroup);
  }

  async updateModifierGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateModifierGroupSchema, request.body);
    const updated = await this.useCase.updateModifierGroup(id, data);

    request.server.io?.emit('catalog:modifier_group_updated', updated);
    return reply.send(updated);
  }

  async deleteModifierGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.useCase.deleteModifierGroup(id);

    request.server.io?.emit('catalog:modifier_group_deleted', { id });
    return reply.send(result);
  }

  async createModifier(request: FastifyRequest, reply: FastifyReply) {
    const { groupId } = request.params as { groupId: string };
    const data = validate(CreateModifierSchema, request.body);
    const newModifier = await this.useCase.createModifier(groupId, data);

    request.server.io?.emit('catalog:modifier_created', newModifier);
    return reply.status(201).send(newModifier);
  }

  async updateModifier(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateModifierSchema, request.body);
    const updated = await this.useCase.updateModifier(id, data);

    request.server.io?.emit('catalog:modifier_updated', updated);
    return reply.send(updated);
  }

  async deleteModifier(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.useCase.deleteModifier(id);

    request.server.io?.emit('catalog:modifier_deleted', { id });
    return reply.send(result);
  }

  async linkProductModifierGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id: productId } = request.params as { id: string };
    const data = validate(LinkProductModifierGroupSchema, request.body);
    const result = await this.useCase.linkProductModifierGroup(productId, data.groupId, data.isRequired, data.sortOrder);

    request.server.io?.emit('catalog:product_modifier_linked', { productId, groupId: data.groupId });
    return reply.status(201).send(result);
  }

  async unlinkProductModifierGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id: productId, groupId } = request.params as { id: string; groupId: string };
    const result = await this.useCase.unlinkProductModifierGroup(productId, groupId);

    request.server.io?.emit('catalog:product_modifier_unlinked', { productId, groupId });
    return reply.send(result);
  }

  async uploadMedia(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ message: 'No se envió ningún archivo' });
    }

    const buffer = await data.toBuffer();
    const filename = data.filename || 'upload.bin';
    const is3d =
      data.mimetype.includes('model') ||
      data.mimetype.includes('gltf') ||
      data.mimetype.includes('glb') ||
      filename.toLowerCase().endsWith('.glb') ||
      filename.toLowerCase().endsWith('.gltf');

    const folder = is3d ? 'models3d' : 'images';
    const fileUrl = await storageService.uploadFile(buffer, filename, data.mimetype, folder);
    return reply.status(201).send({ url: fileUrl, filename, mimetype: data.mimetype, is3d });
  }

  async uploadBase64(request: FastifyRequest, reply: FastifyReply) {
    const body = (request.body as any) || {};
    const rawData = body.dataUrl || body.base64Data || body.data || body.base64 || body.image;
    const { filename, folder = 'images' } = body;

    if (!rawData || typeof rawData !== 'string') {
      return reply.status(400).send({ message: 'Se requiere dataUrl o base64Data' });
    }

    const sanitized = rawData.trim();
    let mimeType = body.mimeType || 'image/jpeg';
    let base64Content = sanitized;

    // Check if it has data URL prefix: data:[<mediatype>][;base64],<data>
    const dataUrlPrefixMatch = sanitized.match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/s);
    if (dataUrlPrefixMatch) {
      mimeType = dataUrlPrefixMatch[1] || mimeType;
      base64Content = dataUrlPrefixMatch[2];
    } else if (sanitized.includes(';base64,')) {
      const parts = sanitized.split(';base64,');
      const headerPart = parts[0];
      base64Content = parts.slice(1).join(';base64,');
      const mimeMatch = headerPart.match(/^data:([^;,]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    // Clean any whitespace/newlines from base64 string
    base64Content = base64Content.replace(/\s+/g, '');

    const buffer = Buffer.from(base64Content, 'base64');
    if (buffer.length === 0) {
      return reply.status(400).send({ message: 'El contenido en Base64 está vacío o no es válido' });
    }

    // Derive proper extension
    let ext = '.jpeg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('gif')) ext = '.gif';
    else if (mimeType.includes('glb') || mimeType.includes('model')) ext = '.glb';
    else if (mimeType.includes('gltf')) ext = '.gltf';
    else if (filename && path.extname(filename)) ext = path.extname(filename);

    const safeFilename = filename || `capture_${Date.now()}${ext}`;

    const is3d =
      mimeType.includes('model') ||
      mimeType.includes('glb') ||
      mimeType.includes('gltf') ||
      safeFilename.toLowerCase().endsWith('.glb') ||
      safeFilename.toLowerCase().endsWith('.gltf');

    const targetFolder = is3d ? 'models3d' : folder;

    const fileUrl = await storageService.uploadFile(buffer, safeFilename, mimeType, targetFolder);
    return reply.status(201).send({
      url: fileUrl,
      filename: safeFilename,
      mimetype: mimeType,
      key: fileUrl,
      is3d,
    });
  }
}

export const catalogController = new CatalogController();

