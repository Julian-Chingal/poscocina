import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError } from '../errors/app-error.js';

export class CatalogService {
  async getVenueCatalog(venueId: string) {
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

    return {
      categories: categoriesList,
      products: productsList,
      modifierGroups: modifierGroupsList,
      modifiers: modifiersList,
      productModifierGroups: productModGroups,
    };
  }

  async toggleProductAvailability(productId: string) {
    const [existing] = await db.select().from(schema.products).where(eq(schema.products.id, productId)).limit(1);
    if (!existing) {
      throw new NotFoundError('Producto no encontrado');
    }

    const [updated] = await db
      .update(schema.products)
      .set({ isAvailable: !existing.isAvailable })
      .where(eq(schema.products.id, productId))
      .returning();

    return updated;
  }
}

export const catalogService = new CatalogService();
