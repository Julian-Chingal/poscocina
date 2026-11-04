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
            productStations: {
              with: {
                station: true,
              },
              orderBy: (ps, { asc }) => [asc(ps.sortOrder)],
            },
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
      stationIds: ((product as any).productStations || []).map((ps: any) => ps.stationId),
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
      with: {
        category: true,
        productStations: {
          with: { station: true },
          orderBy: (ps, { asc }) => [asc(ps.sortOrder)],
        },
      },
    });
  }

  async createProduct(data: any) {
    const { stationIds, ...rest } = data;
    return await this.database.transaction(async (tx) => {
      const [created] = await tx
        .insert(schema.products)
        .values({
          categoryId: rest.categoryId,
          name: rest.name.trim(),
          description: rest.description,
          price: rest.price.toFixed(2),
          taxRate: rest.taxRate !== undefined ? rest.taxRate.toFixed(4) : '0.0800',
          imageUrl: rest.imageUrl,
          model3dUrl: rest.model3dUrl,
          model3dType: rest.model3dType || 'glb',
          dimensions: rest.dimensions || {},
          displayMedia: rest.displayMedia || 'both',
          printerStation: rest.printerStation,
          prepTimeMin: rest.prepTimeMin,
          trackInventory: rest.trackInventory ?? false,
          isAvailable: rest.isAvailable ?? true,
          sortOrder: rest.sortOrder ?? 0,
        })
        .returning();

      if (stationIds && Array.isArray(stationIds) && stationIds.length > 0) {
        for (let i = 0; i < stationIds.length; i++) {
          await tx.insert(schema.productStations).values({
            productId: created.id,
            stationId: stationIds[i],
            isPrimary: i === 0,
            sortOrder: i,
          }).onConflictDoNothing();
        }
      }

      return created;
    });
  }

  async updateProduct(id: string, data: any) {
    const { stationIds, ...rest } = data;
    const updatePayload: Record<string, any> = { ...rest };
    if (rest.price !== undefined) updatePayload.price = rest.price.toFixed(2);
    if (rest.costPrice !== undefined) updatePayload.costPrice = rest.costPrice.toFixed(2);
    if (rest.taxRate !== undefined) updatePayload.taxRate = rest.taxRate.toFixed(4);

    return await this.database.transaction(async (tx) => {
      let updated;
      if (Object.keys(updatePayload).length > 0) {
        const [u] = await tx.update(schema.products).set(updatePayload).where(eq(schema.products.id, id)).returning();
        updated = u;
      } else {
        const [current] = await tx.select().from(schema.products).where(eq(schema.products.id, id));
        updated = current;
      }

      if (stationIds !== undefined && Array.isArray(stationIds)) {
        await tx.delete(schema.productStations).where(eq(schema.productStations.productId, id));
        for (let i = 0; i < stationIds.length; i++) {
          await tx.insert(schema.productStations).values({
            productId: id,
            stationId: stationIds[i],
            isPrimary: i === 0,
            sortOrder: i,
          }).onConflictDoNothing();
        }
      }

      return updated;
    });
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

  async findModifierGroups(venueId: string) {
    return await this.database.query.modifierGroups.findMany({
      where: (mg, { eq }) => eq(mg.venueId, venueId),
      orderBy: (mg, { asc }) => [asc(mg.sortOrder)],
      with: {
        modifiers: {
          orderBy: (m, { asc }) => [asc(m.sortOrder)],
        },
        products: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  async findModifierGroupById(id: string) {
    return await this.database.query.modifierGroups.findFirst({
      where: (mg, { eq }) => eq(mg.id, id),
      with: {
        modifiers: {
          orderBy: (m, { asc }) => [asc(m.sortOrder)],
        },
      },
    });
  }

  async createModifierGroup(venueId: string, data: any) {
    const [created] = await this.database
      .insert(schema.modifierGroups)
      .values({
        venueId,
        name: data.name.trim(),
        selectionType: data.selectionType || 'single',
        isRequired: data.isRequired ?? false,
        minSelections: data.minSelections ?? 0,
        maxSelections: data.maxSelections ?? null,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();
    return created;
  }

  async updateModifierGroup(id: string, data: any) {
    const [updated] = await this.database
      .update(schema.modifierGroups)
      .set(data)
      .where(eq(schema.modifierGroups.id, id))
      .returning();
    return updated;
  }

  async deleteModifierGroup(id: string): Promise<void> {
    await this.database.delete(schema.modifierGroups).where(eq(schema.modifierGroups.id, id));
  }

  async createModifier(groupId: string, data: any) {
    const [created] = await this.database
      .insert(schema.modifiers)
      .values({
        groupId,
        name: data.name.trim(),
        priceDelta: data.priceDelta !== undefined ? Number(data.priceDelta).toFixed(2) : '0.00',
        isDefault: data.isDefault ?? false,
        isAvailable: data.isAvailable ?? true,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();
    return created;
  }

  async updateModifier(id: string, data: any) {
    const updatePayload: Record<string, any> = { ...data };
    if (data.priceDelta !== undefined) {
      updatePayload.priceDelta = Number(data.priceDelta).toFixed(2);
    }
    const [updated] = await this.database
      .update(schema.modifiers)
      .set(updatePayload)
      .where(eq(schema.modifiers.id, id))
      .returning();
    return updated;
  }

  async deleteModifier(id: string): Promise<void> {
    await this.database.delete(schema.modifiers).where(eq(schema.modifiers.id, id));
  }

  async linkProductModifierGroup(productId: string, groupId: string, isRequired?: boolean | null, sortOrder: number = 0) {
    await this.database
      .insert(schema.productModifierGroups)
      .values({
        productId,
        groupId,
        isRequired: isRequired ?? null,
        sortOrder,
      })
      .onConflictDoUpdate({
        target: [schema.productModifierGroups.productId, schema.productModifierGroups.groupId],
        set: {
          isRequired: isRequired ?? null,
          sortOrder,
        },
      });
    return { success: true, productId, groupId };
  }

  async unlinkProductModifierGroup(productId: string, groupId: string): Promise<void> {
    await this.database
      .delete(schema.productModifierGroups)
      .where(
        and(
          eq(schema.productModifierGroups.productId, productId),
          eq(schema.productModifierGroups.groupId, groupId)
        )
      );
  }
}

export const catalogRepository = new CatalogRepository();

