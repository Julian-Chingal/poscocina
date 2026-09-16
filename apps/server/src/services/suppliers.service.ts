import { eq, and, ilike, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';
import type { CreateSupplierInput, UpdateSupplierInput } from '@poscocina/shared';

export class SuppliersService {
  async getSuppliers(venueId: string, search?: string) {
    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      return await db.query.suppliers.findMany({
        where: (suppliers, { and, eq }) =>
          and(
            eq(suppliers.venueId, venueId),
            or(
              ilike(suppliers.name, term),
              ilike(suppliers.documentNumber, term),
              ilike(suppliers.contactName, term)
            )
          ),
        orderBy: (suppliers, { asc }) => [asc(suppliers.name)],
      });
    }

    return await db.query.suppliers.findMany({
      where: (suppliers, { eq }) => eq(suppliers.venueId, venueId),
      orderBy: (suppliers, { asc }) => [asc(suppliers.name)],
    });
  }

  async getSupplierById(id: string) {
    const supplier = await db.query.suppliers.findFirst({
      where: (suppliers, { eq }) => eq(suppliers.id, id),
      with: {
        purchases: {
          orderBy: (purchases, { desc }) => [desc(purchases.createdAt)],
          limit: 10,
        },
      },
    });

    if (!supplier) {
      throw new NotFoundError('Proveedor no encontrado');
    }

    return supplier;
  }

  async createSupplier(data: CreateSupplierInput) {
    const [existing] = await db
      .select({ id: schema.suppliers.id })
      .from(schema.suppliers)
      .where(
        and(
          eq(schema.suppliers.venueId, data.venueId),
          eq(schema.suppliers.documentNumber, data.documentNumber)
        )
      )
      .limit(1);

    if (existing) {
      throw new BadRequestError(`Ya existe un proveedor registrado con el documento/NIT ${data.documentNumber}`);
    }

    const [newSupplier] = await db
      .insert(schema.suppliers)
      .values({
        venueId: data.venueId,
        name: data.name.trim(),
        documentType: data.documentType || 'NIT',
        documentNumber: data.documentNumber.trim(),
        contactName: data.contactName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
        isActive: true,
      })
      .returning();

    return newSupplier;
  }

  async updateSupplier(id: string, data: UpdateSupplierInput) {
    await this.getSupplierById(id);

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.documentType !== undefined) updateFields.documentType = data.documentType;
    if (data.documentNumber !== undefined) updateFields.documentNumber = data.documentNumber.trim();
    if (data.contactName !== undefined) updateFields.contactName = data.contactName?.trim() || null;
    if (data.phone !== undefined) updateFields.phone = data.phone?.trim() || null;
    if (data.email !== undefined) updateFields.email = data.email?.trim() || null;
    if (data.address !== undefined) updateFields.address = data.address?.trim() || null;
    if (data.notes !== undefined) updateFields.notes = data.notes?.trim() || null;

    const [updated] = await db
      .update(schema.suppliers)
      .set(updateFields)
      .where(eq(schema.suppliers.id, id))
      .returning();

    return updated;
  }
}

export const suppliersService = new SuppliersService();
