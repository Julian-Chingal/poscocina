import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError } from '../errors/app-error.js';

export class TablesService {
  async getFloorPlans(venueId: string) {
    return await db
      .select()
      .from(schema.floorPlans)
      .where(and(eq(schema.floorPlans.venueId, venueId), eq(schema.floorPlans.isActive, true)));
  }

  async createFloorPlan(venueId: string, data: { name: string; layout?: Record<string, any> }) {
    const [plan] = await db
      .insert(schema.floorPlans)
      .values({
        venueId,
        name: data.name.trim(),
        layout: data.layout || {},
        isActive: true,
      })
      .returning();
    return plan;
  }

  async getVenueTables(venueId: string) {
    return await db
      .select({
        id: schema.tables.id,
        floorPlanId: schema.tables.floorPlanId,
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

  async createTable(data: {
    floorPlanId: string;
    label: string;
    capacity?: number;
    positionX?: number;
    positionY?: number;
    shape?: 'rect' | 'circle' | 'square';
  }) {
    const [plan] = await db.select().from(schema.floorPlans).where(eq(schema.floorPlans.id, data.floorPlanId)).limit(1);
    if (!plan) throw new NotFoundError('Salón o plano de planta no encontrado');

    const [table] = await db
      .insert(schema.tables)
      .values({
        floorPlanId: data.floorPlanId,
        label: data.label.trim(),
        capacity: data.capacity || 4,
        positionX: (data.positionX ?? 0).toString(),
        positionY: (data.positionY ?? 0).toString(),
        shape: data.shape || 'rect',
        status: 'free',
      })
      .returning();
    return table;
  }

  async updateTable(
    id: string,
    data: {
      label?: string;
      capacity?: number;
      positionX?: number;
      positionY?: number;
      shape?: string;
      status?: 'free' | 'occupied' | 'check_requested' | 'reserved' | 'blocked';
    }
  ) {
    const [existing] = await db.select().from(schema.tables).where(eq(schema.tables.id, id)).limit(1);
    if (!existing) throw new NotFoundError('Mesa no encontrada');

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (data.label !== undefined) updatePayload.label = data.label.trim();
    if (data.capacity !== undefined) updatePayload.capacity = data.capacity;
    if (data.positionX !== undefined) updatePayload.positionX = data.positionX.toString();
    if (data.positionY !== undefined) updatePayload.positionY = data.positionY.toString();
    if (data.shape !== undefined) updatePayload.shape = data.shape;
    if (data.status !== undefined) updatePayload.status = data.status;

    const [updated] = await db
      .update(schema.tables)
      .set(updatePayload)
      .where(eq(schema.tables.id, id))
      .returning();
    return updated;
  }

  async deleteTable(id: string) {
    const [existing] = await db.select().from(schema.tables).where(eq(schema.tables.id, id)).limit(1);
    if (!existing) throw new NotFoundError('Mesa no encontrada');

    await db.delete(schema.tables).where(eq(schema.tables.id, id));
    return { success: true };
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
