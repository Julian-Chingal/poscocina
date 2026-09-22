import { eq, and, or, ilike, sql, desc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { ICustomerRepository } from '../interfaces/customer.repository.interface.js';

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly database = db) {}

  async search(venueId: string, q?: string, limit = 20) {
    const trimmed = q?.trim();
    return await this.database.query.customers.findMany({
      where: (customers, { eq, and, or, ilike }) =>
        and(
          eq(customers.venueId, venueId),
          trimmed
            ? or(
                ilike(customers.name, `%${trimmed}%`),
                ilike(customers.documentNumber || '', `%${trimmed}%`),
                ilike(customers.phone || '', `%${trimmed}%`)
              )
            : undefined
        ),
      limit,
      orderBy: (customers, { desc }) => [desc(customers.updatedAt)],
    });
  }

  async findById(id: string) {
    return await this.database.query.customers.findFirst({ where: (c, { eq }) => eq(c.id, id) });
  }

  async create(data: any) {
    const [customer] = await this.database.insert(schema.customers).values(data).returning();
    return customer;
  }

  async update(id: string, data: any) {
    const [updated] = await this.database
      .update(schema.customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.customers.id, id))
      .returning();
    return updated;
  }

  async addLoyaltyPointsAndSpend(customerId: string, spendAmount: number): Promise<void> {
    const earnedPoints = Math.floor(spendAmount / 1000);
    await this.database
      .update(schema.customers)
      .set({
        loyaltyPoints: sql`${schema.customers.loyaltyPoints} + ${earnedPoints}`,
        totalSpent: sql`${schema.customers.totalSpent} + ${spendAmount.toFixed(2)}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.customers.id, customerId));
  }
}

export const customerRepository = new CustomerRepository();
