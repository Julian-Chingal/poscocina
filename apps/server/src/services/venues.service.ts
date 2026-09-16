import { eq, and, count, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError } from '../errors/app-error.js';

export class VenuesService {
  async listVenues() {
    return db.select().from(schema.venues);
  }

  async getFirstVenue() {
    const [venue] = await db.select().from(schema.venues).limit(1);
    if (!venue) {
      throw new NotFoundError('No hay locales registrados en el sistema');
    }
    return venue;
  }

  async getVenueById(id: string) {
    const [venue] = await db.select().from(schema.venues).where(eq(schema.venues.id, id)).limit(1);
    if (!venue) {
      throw new NotFoundError('Local no encontrado');
    }
    return venue;
  }

  async createVenue(data: {
    name: string;
    address?: string;
    timezone?: string;
    settings?: Record<string, unknown>;
  }) {
    return await db.transaction(async (tx) => {
      const defaultSettings = {
        companyName: data.name,
        currency: 'COP',
        taxRate: 0.08,
        defaultTaxRate: 0.08,
        taxType: 'INC',
        defaultTipPct: 10,
        receiptHeader: 'Sabor tradicional & Alta cocina',
        receiptFooter: '¡Gracias por su visita!',
        primaryColor: '#ea580c',
        ...(data.settings || {}),
      };

      const [newVenue] = await tx
        .insert(schema.venues)
        .values({
          name: data.name,
          address: data.address || '',
          timezone: data.timezone || 'America/Bogota',
          settings: defaultSettings,
        })
        .returning();

      // Create default floor plan
      const [floorPlan] = await tx
        .insert(schema.floorPlans)
        .values({
          venueId: newVenue.id,
          name: 'Salón Principal',
          layout: {},
        })
        .returning();

      // Create initial 4 tables
      const initialTables = [
        { label: 'Mesa 1', capacity: 4, shape: 'rect' },
        { label: 'Mesa 2', capacity: 4, shape: 'rect' },
        { label: 'Mesa 3', capacity: 2, shape: 'square' },
        { label: 'Mesa 4', capacity: 6, shape: 'rect' },
      ];

      for (const t of initialTables) {
        await tx.insert(schema.tables).values({
          floorPlanId: floorPlan.id,
          label: t.label,
          capacity: t.capacity,
          shape: t.shape,
          status: 'free',
        });
      }

      // Create default categories
      const initialCategories = [
        { name: 'Entradas', color: '#ea580c', sortOrder: 1, printerStation: 'kitchen' },
        { name: 'Platos Fuertes', color: '#dc2626', sortOrder: 2, printerStation: 'kitchen' },
        { name: 'Bebidas', color: '#2563eb', sortOrder: 3, printerStation: 'bar' },
        { name: 'Postres', color: '#d97706', sortOrder: 4, printerStation: 'dessert' },
      ];

      for (const cat of initialCategories) {
        await tx.insert(schema.categories).values({
          venueId: newVenue.id,
          name: cat.name,
          color: cat.color,
          sortOrder: cat.sortOrder,
          printerStation: cat.printerStation,
        });
      }

      return newVenue;
    });
  }

  async getVenueSummary(id: string) {
    const venue = await this.getVenueById(id);

    // 1. Tables summary (join with floorPlans to filter by venueId)
    const tablesList = await db
      .select({
        id: schema.tables.id,
        status: schema.tables.status,
      })
      .from(schema.tables)
      .innerJoin(schema.floorPlans, eq(schema.tables.floorPlanId, schema.floorPlans.id))
      .where(eq(schema.floorPlans.venueId, id));

    const totalTables = tablesList.length;
    const occupiedTables = tablesList.filter(
      (t) => t.status === 'occupied' || t.status === 'check_requested'
    ).length;

    // 2. Active orders
    const openOrders = await db
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.venueId, id),
          inArray(schema.orders.status, [
            'open',
            'sent_to_kitchen',
            'partially_ready',
            'ready',
            'check_requested',
          ])
        )
      );

    // 3. Active cash shift
    const [activeShift] = await db
      .select({
        id: schema.cashShifts.id,
        openedAt: schema.cashShifts.openedAt,
        openingAmount: schema.cashShifts.openingAmount,
      })
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, id), eq(schema.cashShifts.status, 'open')))
      .limit(1);

    // 4. Active employees in venue
    const [employeeCount] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(and(eq(schema.users.venueId, id), eq(schema.users.isActive, true)));

    return {
      venue,
      metrics: {
        totalTables,
        occupiedTables,
        freeTables: totalTables - occupiedTables,
        activeOrders: openOrders.length,
        hasOpenShift: !!activeShift,
        activeShift: activeShift || null,
        activeEmployees: Number(employeeCount?.count || 0),
      },
      stats: {
        tables: {
          total: totalTables,
          occupied: occupiedTables,
          free: totalTables - occupiedTables,
        },
        activeOrders: openOrders.length,
        activeStaff: Number(employeeCount?.count || 0),
        openShift: activeShift || null,
      },
    };
  }

  async updateVenueSettings(
    id: string,
    data: {
      name?: string;
      address?: string;
      timezone?: string;
      settings?: Record<string, unknown>;
    }
  ) {
    const existing = await this.getVenueById(id);

    const mergedSettings = {
      ...((existing.settings as Record<string, unknown>) || {}),
      ...(data.settings || {}),
    };

    const updateFields: Record<string, unknown> = {
      settings: mergedSettings,
    };

    if (data.name) updateFields.name = data.name;
    if (data.address) updateFields.address = data.address;
    if (data.timezone) updateFields.timezone = data.timezone;

    const [updated] = await db
      .update(schema.venues)
      .set(updateFields)
      .where(eq(schema.venues.id, id))
      .returning();

    return updated;
  }
}

export const venuesService = new VenuesService();
