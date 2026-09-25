import { eq, and, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { ITableRepository } from '../interfaces/table.repository.interface.js';

export class TableRepository implements ITableRepository {
  constructor(private readonly database = db) {}

  async findFloorPlansByVenue(venueId: string) {
    return await this.database.query.floorPlans.findMany({
      where: (plans, { eq }) => eq(plans.venueId, venueId),
      with: { tables: true },
      orderBy: (plans, { asc }) => [asc(plans.name)],
    });
  }

  async createFloorPlan(venueId: string, data: any) {
    const [plan] = await this.database.insert(schema.floorPlans).values({ venueId, ...data }).returning();
    return plan;
  }

  async findTablesWithActiveOrders(venueId: string) {
    try {
      const plans = await this.database.query.floorPlans.findMany({
        where: (p, { eq }) => eq(p.venueId, venueId),
        with: {
          tables: {
            with: {
              orders: {
                where: (o, { inArray }) => inArray(o.status, ['open', 'sent_to_kitchen', 'partially_ready', 'ready', 'check_requested']),
                with: {
                  items: { with: { product: true } },
                  waiter: { columns: { id: true, name: true } },
                },
              },
            },
          },
        },
      });

      const allTables: any[] = [];
      for (const plan of plans) {
        for (const t of (plan.tables || [])) {
          const activeOrder = t.orders?.[0] || null;
          allTables.push({
            ...t,
            floorPlan: { id: plan.id, name: plan.name },
            currentOrder: activeOrder,
          });
        }
      }
      return allTables.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
    } catch (err: any) {
      console.error('❌ [TableRepository.findTablesWithActiveOrders] Error querying database:', err);
      throw err;
    }
  }

  async findTableById(id: string) {
    return await this.database.query.tables.findFirst({
      where: (tables, { eq }) => eq(tables.id, id),
    });
  }

  async createTable(data: any) {
    const [table] = await this.database.insert(schema.tables).values(data).returning();
    return table;
  }

  async updateTable(id: string, data: any) {
    const [updated] = await this.database.update(schema.tables).set(data).where(eq(schema.tables.id, id)).returning();
    return updated;
  }

  async deleteTable(id: string): Promise<void> {
    await this.database.delete(schema.tables).where(eq(schema.tables.id, id));
  }

  async updateTableStatus(id: string, status: any) {
    const [updated] = await this.database
      .update(schema.tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.tables.id, id))
      .returning();
    return updated;
  }

  async transferOrderToTable(sourceTableId: string, targetTableId: string, orderId: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      await tx.update(schema.tables).set({ status: 'free', currentOrderId: null, updatedAt: new Date() }).where(eq(schema.tables.id, sourceTableId));
      await tx.update(schema.tables).set({ status: 'occupied', currentOrderId: orderId, updatedAt: new Date() }).where(eq(schema.tables.id, targetTableId));
      await tx.update(schema.orders).set({ tableId: targetTableId }).where(eq(schema.orders.id, orderId));
    });
  }
}

export const tableRepository = new TableRepository();
