import { eq, and, count, inArray, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { redis } from '../../../config/redis.js';
import { IVenueRepository } from '../interfaces/venue.repository.interface.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';

export class VenueRepository implements IVenueRepository {
  constructor(private readonly database = db) {}

  async listVenues() {
    return this.database.select().from(schema.venues);
  }

  async getFirstVenue() {
    const [venue] = await this.database.select().from(schema.venues).limit(1);
    if (!venue) throw new NotFoundError('No hay locales registrados en el sistema');
    return venue;
  }

  async getVenueById(id: string) {
    const [venue] = await this.database.select().from(schema.venues).where(eq(schema.venues.id, id)).limit(1);
    if (!venue) throw new NotFoundError('Local no encontrado');
    return venue;
  }

  async getVenueSummary(id: string) {
    const venue = await this.getVenueById(id);

    const tablesList = await this.database
      .select({ id: schema.tables.id, status: schema.tables.status })
      .from(schema.tables)
      .innerJoin(schema.floorPlans, eq(schema.tables.floorPlanId, schema.floorPlans.id))
      .where(eq(schema.floorPlans.venueId, id));

    const totalTables = tablesList.length;
    const occupiedTables = tablesList.filter((t) => t.status === 'occupied' || t.status === 'check_requested').length;

    const openOrders = await this.database
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.venueId, id),
          inArray(schema.orders.status, ['open', 'sent_to_kitchen', 'partially_ready', 'ready', 'check_requested'])
        )
      );

    const [activeShift] = await this.database
      .select({ id: schema.cashShifts.id, openedAt: schema.cashShifts.openedAt, openingAmount: schema.cashShifts.openingAmount })
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, id), eq(schema.cashShifts.status, 'open')))
      .limit(1);

    const [employeeCount] = await this.database
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
        tables: { total: totalTables, occupied: occupiedTables, free: totalTables - occupiedTables },
        activeOrders: openOrders.length,
        activeStaff: Number(employeeCount?.count || 0),
        openShift: activeShift || null,
      },
    };
  }

  async createVenue(data: any) {
    return await this.database.transaction(async (tx) => {
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

      const [floorPlan] = await tx
        .insert(schema.floorPlans)
        .values({ venueId: newVenue.id, name: 'Salón Principal', layout: {} })
        .returning();

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

  async updateVenueSettings(id: string, data: any) {
    const existing = await this.getVenueById(id);
    const mergedSettings = { ...((existing.settings as Record<string, unknown>) || {}), ...(data.settings || {}) };
    const updateFields: Record<string, unknown> = { settings: mergedSettings };
    if (data.name) updateFields.name = data.name;
    if (data.address) updateFields.address = data.address;
    if (data.timezone) updateFields.timezone = data.timezone;

    const [updated] = await this.database.update(schema.venues).set(updateFields).where(eq(schema.venues.id, id)).returning();
    return updated;
  }

  async getRoles() {
    return await this.database.select().from(schema.roles).orderBy(desc(schema.roles.hierarchy));
  }

  async getVenueUsers(venueId: string) {
    return await this.database
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatarUrl: schema.users.avatarUrl,
        isActive: schema.users.isActive,
        createdAt: schema.users.createdAt,
        roleId: schema.users.roleId,
        roleName: schema.roles.name,
        roleLabel: schema.roles.label,
        roleHierarchy: schema.roles.hierarchy,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(eq(schema.users.venueId, venueId))
      .orderBy(desc(schema.users.createdAt));
  }

  async createUser(venueId: string, data: any, _creatorId?: string) {
    const pinHash = await bcrypt.hash(data.pin, 10);
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null;

    if (normalizedEmail) {
      const [existing] = await this.database.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, normalizedEmail)).limit(1);
      if (existing) throw new BadRequestError('Ya existe un usuario registrado con este correo electrónico.');
    }

    const [newUser] = await this.database
      .insert(schema.users)
      .values({
        venueId,
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        pinHash,
        roleId: data.roleId,
        avatarUrl: data.avatarUrl || null,
        isActive: true,
      })
      .returning();

    return newUser;
  }

  async updateUser(userId: string, data: any, _updaterId?: string) {
    const [existing] = await this.database.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    const updatePayload: Partial<typeof schema.users.$inferInsert> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.roleId !== undefined) updatePayload.roleId = data.roleId;
    if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
    if (data.isActive !== undefined) {
      updatePayload.isActive = data.isActive;
      if (data.isActive === false) {
        updatePayload.tokenVersion = (existing.tokenVersion || 1) + 1;
        await redis.del(`user_token_version:${userId}`);
        await redis.del(`pin_lockout:${userId}`);
      }
    }
    if (data.email !== undefined) {
      const normalized = data.email ? data.email.toLowerCase().trim() : null;
      if (normalized && normalized !== existing.email) {
        const [conflict] = await this.database.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, normalized)).limit(1);
        if (conflict) throw new BadRequestError('El correo electrónico ya se encuentra en uso por otro empleado.');
      }
      updatePayload.email = normalized;
    }
    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(data.password, 10);
      updatePayload.tokenVersion = (existing.tokenVersion || 1) + 1;
      await redis.del(`user_token_version:${userId}`);
    }

    const [updated] = await this.database.update(schema.users).set(updatePayload).where(eq(schema.users.id, userId)).returning();
    return updated;
  }

  async resetPin(userId: string, newPin: string, _resetById?: string) {
    const [existing] = await this.database.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    const pinHash = await bcrypt.hash(newPin, 10);
    await this.database.update(schema.users).set({ pinHash, tokenVersion: sql`${schema.users.tokenVersion} + 1` }).where(eq(schema.users.id, userId));
    await redis.del(`pin_lockout:${userId}`);
    await redis.del(`pin_attempts:${userId}`);
    await redis.del(`user_token_version:${userId}`);

    return { success: true, message: 'PIN actualizado exitosamente' };
  }

  async deleteUser(userId: string, _deletedById?: string) {
    const [existing] = await this.database.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    await this.database.update(schema.users).set({ isActive: false, tokenVersion: sql`${schema.users.tokenVersion} + 1` }).where(eq(schema.users.id, userId));
    await redis.del(`user_token_version:${userId}`);
    await redis.del(`pin_lockout:${userId}`);
    return { success: true };
  }
}

export const venueRepository = new VenueRepository();
