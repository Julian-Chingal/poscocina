import { FastifyRequest, FastifyReply } from 'fastify';
import { inventoryService } from '../services/inventory.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { BadRequestError } from '../errors/app-error.js';

export class InventoryController {
  async getInventoryItems(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const items = await inventoryService.getInventoryItems(targetVenueId);
    return reply.send(items);
  }

  async createInventoryItem(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const body = request.body as {
      name: string;
      unit: string;
      currentStock?: number;
      alertThreshold?: number;
      costPerUnit?: number;
    };

    if (!body?.name) {
      throw new BadRequestError('El nombre del insumo es obligatorio.');
    }

    const newItem = await inventoryService.createInventoryItem(targetVenueId, body);
    request.server.io?.emit('inventory:item_created', newItem);
    return reply.status(201).send(newItem);
  }

  async registerMovement(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      inventoryItemId: string;
      movementType: 'purchase' | 'waste' | 'adjustment';
      quantity: number;
      notes?: string;
      createdBy?: string;
    };

    if (!body?.inventoryItemId || !body?.movementType || body.quantity === undefined) {
      throw new BadRequestError('Faltan parámetros requeridos para el movimiento de inventario.');
    }

    const result = await inventoryService.registerMovement(body);
    request.server.io?.emit('inventory:stock_updated', result.item);
    if (result.isLowStock) {
      request.server.io?.emit('inventory:low_stock', {
        item: result.item,
        currentStock: result.item.currentStock,
        alertThreshold: result.item.alertThreshold,
      });
    }
    return reply.status(201).send(result);
  }

  async getLowStockItems(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const items = await inventoryService.getLowStockItems(targetVenueId);
    return reply.send(items);
  }

  async getProductRecipe(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const recipeItems = await inventoryService.getProductRecipe(productId);
    return reply.send(recipeItems);
  }

  async setProductRecipe(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const body = request.body as {
      ingredients: Array<{ inventoryItemId: string; quantity: number }>;
    };

    if (!body?.ingredients || !Array.isArray(body.ingredients)) {
      throw new BadRequestError('Se requiere una lista de ingredientes válida.');
    }

    const result = await inventoryService.setProductRecipe(productId, body.ingredients);
    return reply.send(result);
  }

  async getRecentMovements(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const movements = await inventoryService.getRecentMovements(targetVenueId);
    return reply.send(movements);
  }
}

export const inventoryController = new InventoryController();
