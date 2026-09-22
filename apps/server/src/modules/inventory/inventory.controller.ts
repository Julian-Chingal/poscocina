import { FastifyRequest, FastifyReply } from 'fastify';
import { inventoryRepository } from './repositories/inventory.repository.js';
import { ManageStockUseCase } from './use-cases/manage-stock.use-case.js';
import { ManagePurchasesUseCase } from './use-cases/manage-purchases.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { validate } from '../../utils/validation.util.js';
import { BadRequestError } from '../../errors/app-error.js';
import { CreateSupplierSchema, UpdateSupplierSchema, CreatePurchaseSchema } from '@poscocina/shared';

export class InventoryController {
  private readonly stockUseCase = new ManageStockUseCase(inventoryRepository);
  private readonly purchasesUseCase = new ManagePurchasesUseCase(inventoryRepository);

  async getInventoryItems(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const items = await this.stockUseCase.getItems(targetVenueId);
    return reply.send(items);
  }

  async createInventoryItem(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const body = request.body as any;
    if (!body?.name) throw new BadRequestError('El nombre del insumo es obligatorio.');

    const newItem = await this.stockUseCase.createItem(targetVenueId, body);
    request.server.io?.emit('inventory:item_created', newItem);
    return reply.status(201).send(newItem);
  }

  async registerMovement(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    if (!body?.inventoryItemId || !body?.movementType || body.quantity === undefined) {
      throw new BadRequestError('Faltan parámetros requeridos para el movimiento de inventario.');
    }
    const result = await this.stockUseCase.registerMovement(body);
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
    const items = await this.stockUseCase.getLowStock(targetVenueId);
    return reply.send(items);
  }

  async getProductRecipe(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const recipe = await this.stockUseCase.getRecipe(productId);
    return reply.send(recipe);
  }

  async setProductRecipe(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const body = request.body as { ingredients: Array<{ inventoryItemId: string; quantity: number }> };
    if (!body?.ingredients || !Array.isArray(body.ingredients)) {
      throw new BadRequestError('Se requiere una lista de ingredientes válida.');
    }
    const result = await this.stockUseCase.setRecipe(productId, body.ingredients);
    return reply.send(result);
  }

  async getRecentMovements(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const movements = await this.stockUseCase.getMovements(targetVenueId);
    return reply.send(movements);
  }

  // Suppliers & Purchases
  async getSuppliers(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId?: string };
    const { q } = request.query as { q?: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    return reply.send(await this.purchasesUseCase.getSuppliers(targetVenueId, q));
  }

  async getSupplierById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return reply.send(await this.purchasesUseCase.getSupplierById(id));
  }

  async createSupplier(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateSupplierSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);
    return reply.status(201).send(await this.purchasesUseCase.createSupplier({ ...data, venueId: targetVenueId }));
  }

  async updateSupplier(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateSupplierSchema, request.body);
    return reply.send(await this.purchasesUseCase.updateSupplier(id, data));
  }

  async getPurchases(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId?: string };
    const { status } = request.query as { status?: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    return reply.send(await this.purchasesUseCase.getPurchases(targetVenueId, status));
  }

  async getPurchaseById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return reply.send(await this.purchasesUseCase.getPurchaseById(id));
  }

  async createPurchase(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreatePurchaseSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);
    const user = request.user as { id?: string } | undefined;
    const result = await this.purchasesUseCase.createPurchase({ ...data, venueId: targetVenueId }, user?.id);

    request.server.io?.to(`venue:${targetVenueId}`).emit('inventory:stock_updated', {
      timestamp: new Date().toISOString(),
      purchaseId: result.id,
    });
    return reply.status(201).send(result);
  }

  async receivePurchase(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = request.user as { id?: string } | undefined;
    const updated = await this.purchasesUseCase.receivePurchase(id, user?.id);

    request.server.io?.to(`venue:${updated.venueId}`).emit('inventory:stock_updated', {
      timestamp: new Date().toISOString(),
      purchaseId: id,
    });
    return reply.send(updated);
  }
}

export const inventoryController = new InventoryController();
