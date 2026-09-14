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

    const categoryIds = categoriesList.map((c) => c.id);

    let productsList: (typeof schema.products.$inferSelect)[] = [];
    if (categoryIds.length > 0) {
      productsList = await db
        .select()
        .from(schema.products)
        .orderBy(schema.products.sortOrder);
    }

    const modifierGroupsList = await db
      .select()
      .from(schema.modifierGroups)
      .where(eq(schema.modifierGroups.venueId, venueId));

    const modifiersList = await db
      .select()
      .from(schema.modifiers)
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

  // Category CRUD
  async createCategory(venueId: string, data: { name: string; color?: string; icon?: string; sortOrder?: number; printerStation?: string }) {
    const [newCategory] = await db
      .insert(schema.categories)
      .values({
        venueId,
        name: data.name.trim(),
        color: data.color || '#f97316',
        icon: data.icon || 'Utensils',
        sortOrder: data.sortOrder || 0,
        printerStation: data.printerStation || 'kitchen',
      })
      .returning();
    return newCategory;
  }

  async updateCategory(id: string, data: { name?: string; color?: string | null; icon?: string | null; sortOrder?: number; printerStation?: string | null }) {
    const [existing] = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
    if (!existing) throw new NotFoundError('Categoría no encontrada');

    const [updated] = await db
      .update(schema.categories)
      .set({
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.printerStation !== undefined && { printerStation: data.printerStation }),
      })
      .where(eq(schema.categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string) {
    const [existing] = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
    if (!existing) throw new NotFoundError('Categoría no encontrada');

    await db.delete(schema.categories).where(eq(schema.categories.id, id));
    return { success: true };
  }

  // Product CRUD
  async createProduct(data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    taxRate?: number;
    imageUrl?: string | null;
    printerStation?: string | null;
    prepTimeMin?: number | null;
    trackInventory?: boolean;
    isAvailable?: boolean;
    sortOrder?: number;
  }) {
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.id, data.categoryId)).limit(1);
    if (!category) throw new NotFoundError('Categoría no encontrada');

    const [newProduct] = await db
      .insert(schema.products)
      .values({
        categoryId: data.categoryId,
        name: data.name.trim(),
        description: data.description || null,
        price: data.price.toFixed(2),
        taxRate: (data.taxRate !== undefined ? data.taxRate : 0.08).toString(),
        imageUrl: data.imageUrl || null,
        printerStation: data.printerStation || category.printerStation || 'kitchen',
        prepTimeMin: data.prepTimeMin || null,
        trackInventory: data.trackInventory || false,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        sortOrder: data.sortOrder || 0,
      })
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, data: {
    categoryId?: string;
    name?: string;
    description?: string | null;
    price?: number;
    taxRate?: number;
    imageUrl?: string | null;
    printerStation?: string | null;
    prepTimeMin?: number | null;
    trackInventory?: boolean;
    isAvailable?: boolean;
    sortOrder?: number;
  }) {
    const [existing] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (!existing) throw new NotFoundError('Producto no encontrado');

    const updatePayload: Record<string, any> = {};
    if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId;
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.price !== undefined) updatePayload.price = data.price.toFixed(2);
    if (data.taxRate !== undefined) updatePayload.taxRate = data.taxRate.toString();
    if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;
    if (data.printerStation !== undefined) updatePayload.printerStation = data.printerStation;
    if (data.prepTimeMin !== undefined) updatePayload.prepTimeMin = data.prepTimeMin;
    if (data.trackInventory !== undefined) updatePayload.trackInventory = data.trackInventory;
    if (data.isAvailable !== undefined) updatePayload.isAvailable = data.isAvailable;
    if (data.sortOrder !== undefined) updatePayload.sortOrder = data.sortOrder;

    const [updated] = await db
      .update(schema.products)
      .set(updatePayload)
      .where(eq(schema.products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string) {
    const [existing] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (!existing) throw new NotFoundError('Producto no encontrado');

    await db.delete(schema.products).where(eq(schema.products.id, id));
    return { success: true };
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
