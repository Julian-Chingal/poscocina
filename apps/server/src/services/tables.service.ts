import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError } from '../errors/app-error.js';

export class TablesService {
  async getVenueTables(venueId: string) {
    return await db
      .select({
        id: schema.tables.id,
        label: schema.tables.label,
        capacity: schema.tables.capacity,
        positionX: schema.tables.positionX,
        positionY: schema.tables.positionY,
        shape: schema.tables.shape,
        status: schema.tables.status,
        currentOrderId: schema.tables.currentOrderId,
      })
      .from(schema.tables)
      .innerJoin(schema.floorPlans, eq(schema.tables.floorPlanId, schema.floorPlans.id))
      .where(eq(schema.floorPlans.venueId, venueId));
  }

  async updateTableStatus(
    id: string,
    status: 'free' | 'occupied' | 'check_requested' | 'reserved' | 'blocked'
  ) {
    const [updated] = await db
      .update(schema.tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.tables.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError('Mesa no encontrada');
    }

    return updated;
  }
}

export const tablesService = new TablesService();
