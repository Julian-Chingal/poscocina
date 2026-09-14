import { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export async function productsRoutes(fastify: FastifyInstance) {
  // Get full menu catalog for a venue (Categories, Products, Modifier Groups and Modifiers)
  fastify.get('/api/venues/:venueId/catalog', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };

    const categoriesList = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.venueId, venueId))
      .orderBy(schema.categories.sortOrder);

    const productsList = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.isAvailable, true))
      .orderBy(schema.products.sortOrder);

    const modifierGroupsList = await db
      .select()
      .from(schema.modifierGroups)
      .where(eq(schema.modifierGroups.venueId, venueId));

    const modifiersList = await db
      .select()
      .from(schema.modifiers)
      .where(eq(schema.modifiers.isAvailable, true))
      .orderBy(schema.modifiers.sortOrder);

    const productModGroups = await db.select().from(schema.productModifierGroups);

    return reply.send({
      categories: categoriesList,
      products: productsList,
      modifierGroups: modifierGroupsList,
      modifiers: modifiersList,
      productModifierGroups: productModGroups,
    });
  });

  // Toggle 86'd (product out of stock / availability)
  fastify.patch('/api/products/:id/toggle-availability', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [existing] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (!existing) {
      return reply.status(404).send({ error: 'Producto no encontrado' });
    }

    const [updated] = await db
      .update(schema.products)
      .set({ isAvailable: !existing.isAvailable })
      .where(eq(schema.products.id, id))
      .returning();

    // Broadcast menu availability change in real-time
    fastify.io.emit('catalog:product_updated', updated);

    return reply.send(updated);
  });
}
