import { eq, and, sql, desc, lte, ilike, or } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IInventoryRepository } from '../interfaces/inventory.repository.interface.js';

export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly database = db) {}

  async findItems(venueId: string) {
    return await this.database.select().from(schema.inventoryItems).where(eq(schema.inventoryItems.venueId, venueId));
  }

  async findItemById(id: string) {
    const [item] = await this.database.select().from(schema.inventoryItems).where(eq(schema.inventoryItems.id, id)).limit(1);
    return item || null;
  }

  async createItem(venueId: string, data: any) {
    const [newItem] = await this.database.insert(schema.inventoryItems).values({
      venueId,
      name: data.name.trim(),
      unit: data.unit,
      currentStock: (data.currentStock || 0).toFixed(4),
      alertThreshold: (data.alertThreshold || 5).toFixed(4),
      costPerUnit: (data.costPerUnit || 0).toFixed(2),
    }).returning();
    return newItem;
  }

  async updateStock(itemId: string, qtyDelta: number, tx = this.database) {
    const [updated] = await tx
      .update(schema.inventoryItems)
      .set({
        currentStock: sql`GREATEST(0, ${schema.inventoryItems.currentStock} + ${qtyDelta})`,
        updatedAt: new Date(),
      })
      .where(eq(schema.inventoryItems.id, itemId))
      .returning();
    return updated;
  }

  async insertMovement(data: any, tx = this.database) {
    const [mov] = await tx.insert(schema.inventoryMovements).values(data).returning();
    return mov;
  }

  async findMovements(venueId: string, limit = 50) {
    return await this.database
      .select({
        id: schema.inventoryMovements.id,
        itemName: schema.inventoryItems.name,
        unit: schema.inventoryItems.unit,
        movementType: schema.inventoryMovements.movementType,
        quantity: schema.inventoryMovements.quantity,
        notes: schema.inventoryMovements.notes,
        createdAt: schema.inventoryMovements.createdAt,
      })
      .from(schema.inventoryMovements)
      .innerJoin(schema.inventoryItems, eq(schema.inventoryMovements.inventoryItemId, schema.inventoryItems.id))
      .where(eq(schema.inventoryItems.venueId, venueId))
      .orderBy(desc(schema.inventoryMovements.createdAt))
      .limit(limit);
  }

  async findRecipe(productId: string) {
    return await this.database
      .select({
        id: schema.productRecipes.id,
        inventoryItemId: schema.productRecipes.inventoryItemId,
        name: schema.inventoryItems.name,
        unit: schema.inventoryItems.unit,
        quantity: schema.productRecipes.quantity,
      })
      .from(schema.productRecipes)
      .innerJoin(schema.inventoryItems, eq(schema.productRecipes.inventoryItemId, schema.inventoryItems.id))
      .where(eq(schema.productRecipes.productId, productId));
  }

  async setRecipe(productId: string, ingredients: any[]) {
    return await this.database.transaction(async (tx) => {
      await tx.delete(schema.productRecipes).where(eq(schema.productRecipes.productId, productId));
      if (ingredients.length > 0) {
        await tx.insert(schema.productRecipes).values(
          ingredients.map((ing) => ({
            productId,
            inventoryItemId: ing.inventoryItemId,
            quantity: Number(ing.quantity).toFixed(4),
          }))
        );
      }
      return await this.findRecipe(productId);
    });
  }

  async findLowStock(venueId: string) {
    return await this.database
      .select()
      .from(schema.inventoryItems)
      .where(and(eq(schema.inventoryItems.venueId, venueId), lte(schema.inventoryItems.currentStock, schema.inventoryItems.alertThreshold)));
  }

  async findSuppliers(venueId: string, query?: string) {
    return await this.database.query.suppliers.findMany({
      where: (s, { eq, and, ilike, or }) =>
        and(
          eq(s.venueId, venueId),
          query ? or(ilike(s.name, `%${query}%`), ilike(s.contactName || '', `%${query}%`)) : undefined
        ),
      orderBy: (s, { asc }) => [asc(s.name)],
    });
  }

  async findSupplierById(id: string) {
    return await this.database.query.suppliers.findFirst({ where: (s, { eq }) => eq(s.id, id) });
  }

  async createSupplier(data: any) {
    const [created] = await this.database.insert(schema.suppliers).values(data).returning();
    return created;
  }

  async updateSupplier(id: string, data: any) {
    const [updated] = await this.database.update(schema.suppliers).set({ ...data, updatedAt: new Date() }).where(eq(schema.suppliers.id, id)).returning();
    return updated;
  }

  async findPurchases(venueId: string, status?: string) {
    return await this.database.query.purchases.findMany({
      where: (p, { eq, and }) => and(eq(p.venueId, venueId), status ? eq(p.status, status as any) : undefined),
      with: { supplier: true, items: { with: { inventoryItem: true } } },
      orderBy: (p, { desc }) => [desc(p.purchaseDate)],
    });
  }

  async findPurchaseById(id: string) {
    return await this.database.query.purchases.findFirst({
      where: (p, { eq }) => eq(p.id, id),
      with: { supplier: true, items: { with: { inventoryItem: true } } },
    });
  }

  async createPurchase(data: any, lines: any[]) {
    return await this.database.transaction(async (tx) => {
      const [purchase] = await tx.insert(schema.purchases).values(data).returning();
      if (lines.length > 0) {
        await tx.insert(schema.purchaseItems).values(
          lines.map((l: any) => ({
            purchaseId: purchase.id,
            inventoryItemId: l.inventoryItemId,
            quantity: String(l.quantity),
            unitCost: String(l.unitCost || 0),
            totalCost: String(l.totalCost || (l.quantity * (l.unitCost || 0)).toFixed(2)),
          }))
        );
      }
      return purchase;
    });
  }

  async receivePurchase(purchaseId: string, receivedBy?: string) {
    return await this.database.transaction(async (tx) => {
      const [purchase] = await tx.select().from(schema.purchases).where(eq(schema.purchases.id, purchaseId)).limit(1);
      if (!purchase) throw new Error('Compra no encontrada');
      const lines = await tx.select().from(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, purchaseId));

      for (const line of lines) {
        await this.updateStock(line.inventoryItemId, parseFloat(line.quantity), tx as any);
        await this.insertMovement({
          inventoryItemId: line.inventoryItemId,
          movementType: 'purchase',
          quantity: line.quantity,
          referenceId: purchaseId,
          notes: `Recepción orden de compra #${purchase.invoiceNumber || purchaseId.slice(0, 8)}`,
        }, tx as any);
      }

      const [updated] = await tx
        .update(schema.purchases)
        .set({ status: 'received', receivedBy: receivedBy || null, updatedAt: new Date() })
        .where(eq(schema.purchases.id, purchaseId))
        .returning();
      return updated;
    });
  }
}

export const inventoryRepository = new InventoryRepository();
