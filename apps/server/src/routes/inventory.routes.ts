import { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
  // 1. Get all inventory items for a venue
  fastify.get('/api/venues/:venueId/inventory/items', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };

    const items = await db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.venueId, venueId))
      .orderBy(schema.inventoryItems.name);

    return reply.send(items);
  });

  // 2. Create new inventory item
  fastify.post('/api/venues/:venueId/inventory/items', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };
    const { name, unit, currentStock, alertThreshold, costPerUnit } = request.body as {
      name: string;
      unit: string;
      currentStock?: number;
      alertThreshold?: number;
      costPerUnit?: number;
    };

    const [newItem] = await db
      .insert(schema.inventoryItems)
      .values({
        venueId,
        name,
        unit: unit || 'g',
        currentStock: (currentStock || 0).toFixed(4),
        alertThreshold: (alertThreshold || 10).toFixed(4),
        costPerUnit: (costPerUnit || 0).toFixed(4),
      })
      .returning();

    fastify.io.emit('inventory:item_created', newItem);
    return reply.status(201).send(newItem);
  });

  // 3. Register inventory movement (Purchase, Waste, Adjustment)
  fastify.post('/api/inventory/movements', async (request, reply) => {
    const { inventoryItemId, movementType, quantity, notes, createdBy } = request.body as {
      inventoryItemId: string;
      movementType: 'purchase' | 'waste' | 'adjustment';
      quantity: number;
      notes?: string;
      createdBy?: string;
    };

    const [item] = await db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, inventoryItemId))
      .limit(1);

    if (!item) {
      return reply.status(404).send({ error: 'Insumo no encontrado' });
    }

    const currentStockNum = parseFloat(item.currentStock);
    let delta = quantity;
    if (movementType === 'waste') {
      delta = -Math.abs(quantity);
    } else if (movementType === 'purchase') {
      delta = Math.abs(quantity);
    }

    const newStock = Math.max(0, currentStockNum + delta);

    const result = await db.transaction(async (tx) => {
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

      return { movement, item: updatedItem };
    });

    fastify.io.emit('inventory:stock_updated', result.item);
    return reply.status(201).send(result);
  });

  // 4. Get recipe for a specific product
  fastify.get('/api/products/:productId/recipe', async (request, reply) => {
    const { productId } = request.params as { productId: string };

    const recipeItems = await db
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

    return reply.send(recipeItems);
  });

  // 5. Update or set recipe ingredients for a product
  fastify.post('/api/products/:productId/recipe', async (request, reply) => {
    const { productId } = request.params as { productId: string };
    const { ingredients } = request.body as {
      ingredients: Array<{ inventoryItemId: string; quantity: number }>;
    };

    await db.transaction(async (tx) => {
      // Delete existing recipe links for this product
      await tx.delete(schema.productRecipes).where(eq(schema.productRecipes.productId, productId));

      for (const ing of ingredients) {
        await tx.insert(schema.productRecipes).values({
          productId,
          inventoryItemId: ing.inventoryItemId,
          quantity: ing.quantity.toFixed(4),
        });
      }
    });

    return reply.send({ success: true, count: ingredients.length });
  });

  // 6. Get recent inventory movements
  fastify.get('/api/venues/:venueId/inventory/movements', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };

    const movements = await db
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
      .limit(50);

    return reply.send(movements);
  });
}
