import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError } from '../errors/app-error.js';

export interface CreateInventoryItemInput {
  name: string;
  unit: string;
  currentStock?: number;
  alertThreshold?: number;
  costPerUnit?: number;
}

export interface RegisterMovementInput {
  inventoryItemId: string;
  movementType: 'purchase' | 'waste' | 'adjustment';
  quantity: number;
  notes?: string;
  createdBy?: string;
}

export class InventoryService {
  async getInventoryItems(venueId: string) {
    return await db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.venueId, venueId))
      .orderBy(schema.inventoryItems.name);
  }

  async createInventoryItem(venueId: string, data: CreateInventoryItemInput) {
    const [newItem] = await db
      .insert(schema.inventoryItems)
      .values({
        venueId,
        name: data.name,
        unit: data.unit || 'g',
        currentStock: (data.currentStock || 0).toFixed(4),
        alertThreshold: (data.alertThreshold || 10).toFixed(4),
        costPerUnit: (data.costPerUnit || 0).toFixed(4),
      })
      .returning();

    return newItem;
  }

  async registerMovement(data: RegisterMovementInput) {
    const { inventoryItemId, movementType, quantity, notes, createdBy } = data;

    const [item] = await db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, inventoryItemId))
      .limit(1);

    if (!item) {
      throw new NotFoundError('Insumo de inventario no encontrado');
    }

    const currentStockNum = parseFloat(item.currentStock);
    let delta = quantity;
    if (movementType === 'waste') {
      delta = -Math.abs(quantity);
    } else if (movementType === 'purchase') {
      delta = Math.abs(quantity);
    }

    const newStock = Math.max(0, currentStockNum + delta);

    return await db.transaction(async (tx) => {
      const [movement] = await tx
        .insert(schema.inventoryMovements)
        .values({
          inventoryItemId,
          movementType,
          quantity: delta.toFixed(4),
          notes,
          createdBy: createdBy || null,
        })
        .returning();

      const [updatedItem] = await tx
        .update(schema.inventoryItems)
        .set({
          currentStock: newStock.toFixed(4),
          updatedAt: new Date(),
        })
        .where(eq(schema.inventoryItems.id, inventoryItemId))
        .returning();

      const isLowStock = newStock <= parseFloat(item.alertThreshold);

      return { movement, item: updatedItem, isLowStock };
    });
  }

  async getLowStockItems(venueId: string) {
    const items = await db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.venueId, venueId))
      .orderBy(schema.inventoryItems.name);

    return items.filter((item) => parseFloat(item.currentStock) <= parseFloat(item.alertThreshold));
  }

  async getProductRecipe(productId: string) {
    return await db
      .select({
        id: schema.productRecipes.id,
        productId: schema.productRecipes.productId,
        inventoryItemId: schema.productRecipes.inventoryItemId,
        quantity: schema.productRecipes.quantity,
        isWaste: schema.productRecipes.isWaste,
        itemName: schema.inventoryItems.name,
        itemUnit: schema.inventoryItems.unit,
        currentStock: schema.inventoryItems.currentStock,
        costPerUnit: schema.inventoryItems.costPerUnit,
      })
      .from(schema.productRecipes)
      .innerJoin(schema.inventoryItems, eq(schema.productRecipes.inventoryItemId, schema.inventoryItems.id))
      .where(eq(schema.productRecipes.productId, productId));
  }

  async setProductRecipe(productId: string, ingredients: Array<{ inventoryItemId: string; quantity: number }>) {
    await db.transaction(async (tx) => {
      await tx.delete(schema.productRecipes).where(eq(schema.productRecipes.productId, productId));

      for (const ing of ingredients) {
        await tx.insert(schema.productRecipes).values({
          productId,
          inventoryItemId: ing.inventoryItemId,
          quantity: ing.quantity.toFixed(4),
        });
      }
    });

    return { success: true, count: ingredients.length };
  }

  async getRecentMovements(venueId: string, limit = 50) {
    return await db
      .select({
        id: schema.inventoryMovements.id,
        movementType: schema.inventoryMovements.movementType,
        quantity: schema.inventoryMovements.quantity,
        notes: schema.inventoryMovements.notes,
        createdAt: schema.inventoryMovements.createdAt,
        itemName: schema.inventoryItems.name,
        itemUnit: schema.inventoryItems.unit,
      })
      .from(schema.inventoryMovements)
      .innerJoin(schema.inventoryItems, eq(schema.inventoryMovements.inventoryItemId, schema.inventoryItems.id))
      .where(eq(schema.inventoryItems.venueId, venueId))
      .orderBy(desc(schema.inventoryMovements.createdAt))
      .limit(limit);
  }
}

export const inventoryService = new InventoryService();
