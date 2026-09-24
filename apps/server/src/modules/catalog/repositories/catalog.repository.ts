import { eq, and, asc, not } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { ICatalogRepository } from '../interfaces/catalog.repository.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';

export class CatalogRepository implements ICatalogRepository {
  constructor(private readonly database = db) {}

  async findVenueCatalog(venueId: string) {
    const categories = await this.database.query.categories.findMany({
      where: (categories, { eq }) => eq(categories.venueId, venueId),
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    });

    const categoryIds = categories.map((c) => c.id);
    const rawProducts = categoryIds.length > 0
      ? await this.database.query.products.findMany({
          where: (products, { inArray }) => inArray(products.categoryId, categoryIds),
          orderBy: (products, { asc }) => [asc(products.sortOrder)],
          with: {
            category: true,
            // modifierGroups here resolves to the PIVOT table (productModifierGroups).
            // We must go one level deeper to get the actual modifierGroup entity.
            modifierGroups: {
              with: {
                modifierGroup: {
                  with: {
                    modifiers: {
                      where: (m, { eq }) => eq(m.isAvailable, true),
                      orderBy: (m, { asc }) => [asc(m.sortOrder)],
                    },
                  },
                },
              },
              orderBy: (pmg, { asc }) => [asc(pmg.sortOrder)],
            },
          },
        })
      : [];

    // Flatten pivot rows: expose modifierGroups[] with their modifiers directly on each product
    const products = rawProducts.map(({ modifierGroups: pivotRows, ...product }) => ({
      ...product,
      modifierGroups: pivotRows.map((pivot) => ({
        ...pivot.modifierGroup,
        // Allow per-product override of isRequired from the pivot
        isRequired: pivot.isRequired ?? pivot.modifierGroup.isRequired,
        sortOrder: pivot.sortOrder,
      })),
    }));

    return { categories, products };
  }

  async findCategoryById(id: string) {
    return await this.database.query.categories.findFirst({ where: (cat, { eq }) => eq(cat.id, id) });
  }

  async createCategory(venueId: string, data: any) {
    const [created] = await this.database.insert(schema.categories).values({ venueId, ...data }).returning();
    return created;
  }

  async updateCategory(id: string, data: any) {
    const [updated] = await this.database.update(schema.categories).set(data).where(eq(schema.categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.database.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  async findProductById(id: string) {
    return await this.database.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, id),
      with: { category: true },
    });
  }

  async createProduct(data: any) {
    const [created] = await this.database
      .insert(schema.products)
      .values({
        categoryId: data.categoryId,
        name: data.name.trim(),
        description: data.description,
        price: data.price.toFixed(2),
        taxRate: data.taxRate !== undefined ? data.taxRate.toFixed(4) : '0.0800',
        imageUrl: data.imageUrl,
        printerStation: data.printerStation,
        prepTimeMin: data.prepTimeMin,
        trackInventory: data.trackInventory ?? false,
        isAvailable: data.isAvailable ?? true,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();
    return created;
  }

  async updateProduct(id: string, data: any) {
    const updatePayload: Record<string, any> = { ...data };
    if (data.price !== undefined) updatePayload.price = data.price.toFixed(2);
    if (data.costPrice !== undefined) updatePayload.costPrice = data.costPrice.toFixed(2);
    if (data.taxRate !== undefined) updatePayload.taxRate = data.taxRate.toFixed(4);

    const [updated] = await this.database.update(schema.products).set(updatePayload).where(eq(schema.products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.database.delete(schema.products).where(eq(schema.products.id, id));
  }

  async toggleProductAvailability(id: string) {
    const [updated] = await this.database
      .update(schema.products)
      .set({ isAvailable: not(schema.products.isAvailable) })
      .where(eq(schema.products.id, id))
      .returning();
    return updated;
  }
}

export const catalogRepository = new CatalogRepository();
