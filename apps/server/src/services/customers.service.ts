import { eq, and, or, ilike, sql, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';
import type { CreateCustomerInput, UpdateCustomerInput } from '@poscocina/shared';

export class CustomersService {
  async searchCustomers(venueId: string, query?: string, limit = 20) {
    if (!query || query.trim().length === 0) {
      return await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.venueId, venueId))
        .orderBy(desc(schema.customers.createdAt))
        .limit(limit);
    }

    const term = `%${query.trim()}%`;

    return await db
      .select()
      .from(schema.customers)
      .where(
        and(
          eq(schema.customers.venueId, venueId),
          or(
            ilike(schema.customers.name, term),
            ilike(schema.customers.documentNumber, term),
            ilike(schema.customers.phone, term),
            ilike(schema.customers.email, term)
          )
        )
      )
      .orderBy(schema.customers.name)
      .limit(limit);
  }

  async getCustomerById(id: string) {
    const customer = await db.query.customers.findFirst({
      where: (c, { eq }) => eq(c.id, id),
      with: {
        orders: {
          limit: 10,
          orderBy: (orders, { desc }) => [desc(orders.openedAt)],
        },
        receipts: {
          limit: 10,
          orderBy: (receipts, { desc }) => [desc(receipts.issuedAt)],
        },
        reservations: {
          limit: 5,
          orderBy: (reservations, { desc }) => [desc(reservations.reservationTime)],
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Cliente no encontrado');
    }

    return customer;
  }

  async createCustomer(data: CreateCustomerInput & { venueId: string }) {
    const { venueId, name, documentType, documentNumber, phone, email, address, notes } = data;

    // Check if customer with document already exists in this venue
    const existing = await db
      .select()
      .from(schema.customers)
      .where(
        and(
          eq(schema.customers.venueId, venueId),
          eq(schema.customers.documentNumber, documentNumber.trim())
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0];
    }

    const [newCustomer] = await db
      .insert(schema.customers)
      .values({
        venueId,
        name: name.trim(),
        documentType: documentType || 'CC',
        documentNumber: documentNumber.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        loyaltyPoints: 0,
        totalSpent: '0.00',
      })
      .returning();

    return newCustomer;
  }

  async updateCustomer(id: string, data: UpdateCustomerInput) {
    const [existing] = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
    if (!existing) {
      throw new NotFoundError('Cliente no encontrado');
    }

    const [updated] = await db
      .update(schema.customers)
      .set({
        name: data.name ? data.name.trim() : existing.name,
        documentType: data.documentType || existing.documentType,
        documentNumber: data.documentNumber ? data.documentNumber.trim() : existing.documentNumber,
        phone: data.phone !== undefined ? data.phone?.trim() || null : existing.phone,
        email: data.email !== undefined ? data.email?.trim() || null : existing.email,
        address: data.address !== undefined ? data.address?.trim() || null : existing.address,
        notes: data.notes !== undefined ? data.notes?.trim() || null : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.customers.id, id))
      .returning();

    return updated;
  }

  async addLoyaltyPointsAndSpend(customerId: string, amountSpent: number, pointsRate = 1000) {
    const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.id, customerId)).limit(1);
    if (!customer) return null;

    const pointsEarned = Math.floor(amountSpent / pointsRate);
    const newTotalSpent = (parseFloat(customer.totalSpent) + amountSpent).toFixed(2);
    const newPoints = customer.loyaltyPoints + pointsEarned;

    const [updated] = await db
      .update(schema.customers)
      .set({
        totalSpent: newTotalSpent,
        loyaltyPoints: newPoints,
        updatedAt: new Date(),
      })
      .where(eq(schema.customers.id, customerId))
      .returning();

    return { customer: updated, pointsEarned };
  }
}

export const customersService = new CustomersService();
