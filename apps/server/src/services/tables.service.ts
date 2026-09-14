import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';

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

  async transferTable(sourceTableId: string, targetTableId: string) {
    if (sourceTableId === targetTableId) {
      throw new BadRequestError('La mesa origen y destino no pueden ser la misma.');
    }

    const [sourceTable] = await db.select().from(schema.tables).where(eq(schema.tables.id, sourceTableId)).limit(1);
    const [targetTable] = await db.select().from(schema.tables).where(eq(schema.tables.id, targetTableId)).limit(1);

    if (!sourceTable) throw new NotFoundError('Mesa origen no encontrada');
    if (!targetTable) throw new NotFoundError('Mesa destino no encontrada');

    if (!sourceTable.currentOrderId) {
      throw new BadRequestError(`La mesa ${sourceTable.label} no tiene ninguna comanda activa para transferir.`);
    }

    if (targetTable.currentOrderId && targetTable.status !== 'free') {
      throw new BadRequestError(`La mesa ${targetTable.label} ya está ocupada. Utilice la función 'Unir Mesas' si desea fusionarlas.`);
    }

    const orderId = sourceTable.currentOrderId;

    await db.transaction(async (tx) => {
      // 1. Move order to target table
      await tx
        .update(schema.orders)
        .set({ tableId: targetTableId })
        .where(eq(schema.orders.id, orderId));

      // 2. Free source table
      await tx
        .update(schema.tables)
        .set({ status: 'free', currentOrderId: null, updatedAt: new Date() })
        .where(eq(schema.tables.id, sourceTableId));

      // 3. Occupy target table
      await tx
        .update(schema.tables)
        .set({ status: sourceTable.status, currentOrderId: orderId, updatedAt: new Date() })
        .where(eq(schema.tables.id, targetTableId));
    });

    return {
      success: true,
      orderId,
      sourceTable: { id: sourceTable.id, label: sourceTable.label },
      targetTable: { id: targetTable.id, label: targetTable.label },
    };
  }

  async mergeTables(sourceTableId: string, targetTableId: string) {
    if (sourceTableId === targetTableId) {
      throw new BadRequestError('No se puede unir una mesa consigo misma.');
    }

    const [sourceTable] = await db.select().from(schema.tables).where(eq(schema.tables.id, sourceTableId)).limit(1);
    const [targetTable] = await db.select().from(schema.tables).where(eq(schema.tables.id, targetTableId)).limit(1);

    if (!sourceTable) throw new NotFoundError('Mesa origen no encontrada');
    if (!targetTable) throw new NotFoundError('Mesa destino no encontrada');

    if (!sourceTable.currentOrderId) {
      throw new BadRequestError(`La mesa origen ${sourceTable.label} no tiene ninguna comanda activa.`);
    }

    if (!targetTable.currentOrderId) {
      return await this.transferTable(sourceTableId, targetTableId);
    }

    const sourceOrderId = sourceTable.currentOrderId;
    const targetOrderId = targetTable.currentOrderId;

    await db.transaction(async (tx) => {
      // 1. Reassign all order items from source to target order
      await tx
        .update(schema.orderItems)
        .set({ orderId: targetOrderId })
        .where(eq(schema.orderItems.orderId, sourceOrderId));

      // 2. Recalculate target order totals
      const allItems = await tx
        .select({
          unitPrice: schema.orderItems.unitPrice,
          quantity: schema.orderItems.quantity,
        })
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, targetOrderId));

      let newSubtotal = 0;
      for (const item of allItems) {
        newSubtotal += parseFloat(item.unitPrice) * item.quantity;
      }

      const [targetOrder] = await tx.select().from(schema.orders).where(eq(schema.orders.id, targetOrderId)).limit(1);
      const [venueRecord] = await tx
        .select({ settings: schema.venues.settings })
        .from(schema.venues)
        .where(eq(schema.venues.id, targetOrder.venueId))
        .limit(1);

      const venueSettings = (venueRecord?.settings as Record<string, any>) || {};
      const taxRate =
        typeof venueSettings.defaultTaxRate === 'number'
          ? venueSettings.defaultTaxRate
          : typeof venueSettings.tax_rate === 'number'
          ? venueSettings.tax_rate
          : 0.08;

      const newTaxTotal = newSubtotal * taxRate;
      const newTotal = newSubtotal + newTaxTotal;

      await tx
        .update(schema.orders)
        .set({
          subtotal: newSubtotal.toFixed(2),
          taxTotal: newTaxTotal.toFixed(2),
          total: newTotal.toFixed(2),
        })
        .where(eq(schema.orders.id, targetOrderId));

      // 3. Mark source order as voided/merged
      await tx
        .update(schema.orders)
        .set({
          status: 'voided',
          notes: `Orden fusionada con comanda de ${targetTable.label}`,
          closedAt: new Date(),
        })
        .where(eq(schema.orders.id, sourceOrderId));

      // 4. Free source table
      await tx
        .update(schema.tables)
        .set({ status: 'free', currentOrderId: null, updatedAt: new Date() })
        .where(eq(schema.tables.id, sourceTableId));
    });

    return {
      success: true,
      consolidatedOrderId: targetOrderId,
      sourceTable: { id: sourceTable.id, label: sourceTable.label },
      targetTable: { id: targetTable.id, label: targetTable.label },
    };
  }
}

export const tablesService = new TablesService();

