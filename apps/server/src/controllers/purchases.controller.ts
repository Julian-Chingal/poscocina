import { FastifyRequest, FastifyReply } from 'fastify';
import { suppliersService } from '../services/suppliers.service.js';
import { purchasesService } from '../services/purchases.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { validate } from '../utils/validation.util.js';
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
  CreatePurchaseSchema,
} from '@poscocina/shared';

export class PurchasesController {
  // Suppliers Handlers
  async getSuppliers(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId?: string };
    const { q } = request.query as { q?: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const suppliers = await suppliersService.getSuppliers(targetVenueId, q);
    return reply.send(suppliers);
  }

  async getSupplierById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const supplier = await suppliersService.getSupplierById(id);
    return reply.send(supplier);
  }

  async createSupplier(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateSupplierSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);

    const newSupplier = await suppliersService.createSupplier({
      ...data,
      venueId: targetVenueId,
    });
    return reply.status(201).send(newSupplier);
  }

  async updateSupplier(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateSupplierSchema, request.body);

    const updated = await suppliersService.updateSupplier(id, data);
    return reply.send(updated);
  }

  // Purchases Handlers
  async getPurchases(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId?: string };
    const { status } = request.query as { status?: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const purchases = await purchasesService.getPurchases(targetVenueId, status);
    return reply.send(purchases);
  }

  async getPurchaseById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const purchase = await purchasesService.getPurchaseById(id);
    return reply.send(purchase);
  }

  async createPurchase(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreatePurchaseSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);

    const user = request.user as { id?: string } | undefined;

    const result = await purchasesService.createPurchase(
      {
        ...data,
        venueId: targetVenueId,
      },
      user?.id
    );

    // Broadcast inventory stock update
    request.server.io?.to(`venue:${targetVenueId}`).emit('inventory:stock_updated', {
      timestamp: new Date().toISOString(),
      purchaseId: result.id,
    });

    return reply.status(201).send(result);
  }

  async receivePurchase(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = request.user as { id?: string } | undefined;

    const updated = await purchasesService.receivePurchase(id, user?.id);

    // Broadcast inventory stock update
    request.server.io?.to(`venue:${updated.venueId}`).emit('inventory:stock_updated', {
      timestamp: new Date().toISOString(),
      purchaseId: id,
    });

    return reply.send(updated);
  }
}

export const purchasesController = new PurchasesController();
