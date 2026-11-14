import { eq, and, count, inArray, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { redis } from '../../../config/redis.js';
import { IVenueRepository } from '../interfaces/venue.repository.interface.js';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../../errors/app-error.js';
import { evaluateVenueOpenStatus } from '../../../utils/venue-status.util.js';
import { emailService } from '../../../services/email.service.js';

export class VenueRepository implements IVenueRepository {
  constructor(private readonly database = db) {}

  async listVenues(companyId?: string) {
    if (companyId) {
      return this.database
        .select()
        .from(schema.venues)
        .where(eq(schema.venues.companyId, companyId))
        .orderBy(desc(schema.venues.isPrimary), schema.venues.name);
    }
    return this.database
      .select()
      .from(schema.venues)
      .orderBy(desc(schema.venues.isPrimary), schema.venues.name);
  }

  async listPublicVenues() {
    const rows = await this.database
      .select({
        id: schema.venues.id,
        companyId: schema.venues.companyId,
        name: schema.venues.name,
        slug: schema.venues.slug,
        address: schema.venues.address,
        timezone: schema.venues.timezone,
        isPrimary: schema.venues.isPrimary,
        isActive: schema.venues.isActive,
        settings: schema.venues.settings,
      })
      .from(schema.venues)
      .where(eq(schema.venues.isActive, true))
      .orderBy(desc(schema.venues.isPrimary), schema.venues.name);

    const venueIds = rows.map((r) => r.id);
    const activeShifts = venueIds.length > 0
      ? await this.database
          .select({ venueId: schema.cashShifts.venueId })
          .from(schema.cashShifts)
          .where(and(inArray(schema.cashShifts.venueId, venueIds), eq(schema.cashShifts.status, 'open')))
      : [];
    const activeShiftVenueIds = new Set(activeShifts.map((s) => s.venueId));

    const allCompanies = await this.database.select().from(schema.companies);
    const companyMap = new Map(allCompanies.map((c) => [c.id, c]));
    const fallbackCompany = allCompanies[0] || null;

    return rows.map((v) => {
      const s = (v.settings || {}) as Record<string, any>;
      const statusEval = evaluateVenueOpenStatus(
        { timezone: v.timezone, settings: v.settings },
        activeShiftVenueIds.has(v.id)
      );

      const comp = (v.companyId ? companyMap.get(v.companyId) : null) || fallbackCompany;
      const compSlug = comp?.slug || (comp?.tradeName ? comp.tradeName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : null);
      const isGenericVenueSlug = !v.slug || v.slug === 'sede-principal';
      const effectiveSlug = isGenericVenueSlug ? (compSlug || v.slug || s.slug || v.id) : (v.slug || compSlug || s.slug || v.id);

      const displayName = comp?.tradeName
        ? (v.name && v.name !== 'Sede Principal' && rows.length > 1 ? `${comp.tradeName} - ${v.name}` : comp.tradeName)
        : v.name;

      return {
        id: v.id,
        name: displayName,
        slug: effectiveSlug,
        restaurantName: comp?.tradeName || v.name,
        restaurantSlug: compSlug || effectiveSlug,
        companyId: v.companyId || comp?.id || null,
        address: v.address || s.address || comp?.address || '',
        phone: s.phone || comp?.phone || '',
        city: s.city || '',
        logoUrl: s.logoUrl || comp?.logoUrl || null,
        primaryColor: s.primaryColor || comp?.primaryColor || '#ea580c',
        openingHours: s.openingHours || '',
        operatingStatus: statusEval.operatingStatus,
        isOpen: statusEval.isOpen,
        schedule: s.schedule,
        requireShiftForDelivery: !!s.requireShiftForDelivery,
        isPrimary: v.isPrimary,
        isActive: v.isActive,
        settings: v.settings,
      };
    });
  }

  async getPublicVenueBySlugOrId(slugOrId: string) {
    const rawInput = (slugOrId || '').trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawInput);
    const normalizedSlug = rawInput.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    let venue;
    if (isUuid) {
      const [byUuid] = await this.database
        .select()
        .from(schema.venues)
        .where(and(eq(schema.venues.id, rawInput), eq(schema.venues.isActive, true)))
        .limit(1);
      venue = byUuid;
    }

    if (!venue) {
      const [bySlug] = await this.database
        .select()
        .from(schema.venues)
        .where(and(eq(schema.venues.slug, rawInput), eq(schema.venues.isActive, true)))
        .limit(1);
      venue = bySlug;
    }

    if (!venue) {
      const allActive = await this.database
        .select()
        .from(schema.venues)
        .where(eq(schema.venues.isActive, true));

      // 1. Direct match on settings.slug or normalized venue slug
      venue = allActive.find(
        (v) => (v.settings as any)?.slug === rawInput || (v.settings as any)?.slug === normalizedSlug || v.slug === rawInput || v.slug === normalizedSlug || v.id === rawInput
      );

      // 2. Match on company slug or company tradeName (e.g. "arepamia" matching "Arepamia")
      if (!venue) {
        const allCompanies = await this.database.select().from(schema.companies);
        const matchedCompany = allCompanies.find((c) => {
          const cSlug = (c.slug || '').toLowerCase().trim();
          const tradeSlug = (c.tradeName || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
          const legalSlug = (c.legalName || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
          return (
            cSlug === rawInput.toLowerCase() ||
            cSlug === normalizedSlug ||
            tradeSlug === rawInput.toLowerCase() ||
            tradeSlug === normalizedSlug ||
            legalSlug === rawInput.toLowerCase() ||
            legalSlug === normalizedSlug
          );
        });

        if (matchedCompany) {
          venue = allActive.find((v) => v.companyId === matchedCompany.id && v.isPrimary) ||
                  allActive.find((v) => v.companyId === matchedCompany.id) ||
                  allActive[0];
        }
      }

      // 3. Fallback for generic 'sede-principal' or single venue deployment
      if (!venue && (normalizedSlug === 'sede-principal' || normalizedSlug === 'principal' || allActive.length === 1)) {
        venue = allActive.find((v) => v.isPrimary) || allActive[0];
      }
    }

    if (!venue) throw new NotFoundError(`Restaurante '${slugOrId}' no encontrado`);

    // Fetch company details for this venue
    let company = null;
    if (venue.companyId) {
      const [comp] = await this.database.select().from(schema.companies).where(eq(schema.companies.id, venue.companyId)).limit(1);
      company = comp || null;
    }
    if (!company) {
      const [firstComp] = await this.database.select().from(schema.companies).limit(1);
      company = firstComp || null;
    }

    const companySlug = company?.slug || (company?.tradeName ? company.tradeName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : null);

    // Auto-migrate generic 'sede-principal' venue slug in database to the restaurant slug
    if (venue.slug === 'sede-principal' && companySlug) {
      try {
        await this.database.update(schema.venues).set({ slug: companySlug }).where(eq(schema.venues.id, venue.id));
        venue.slug = companySlug;
      } catch (_) {}
    }

    const isGenericVenueSlug = !venue.slug || venue.slug === 'sede-principal';
    const effectiveSlug = isGenericVenueSlug ? (companySlug || venue.slug || venue.id) : (venue.slug || companySlug || venue.id);

    const [activeShift] = await this.database
      .select({ id: schema.cashShifts.id })
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venue.id), eq(schema.cashShifts.status, 'open')))
      .limit(1);

    const statusEval = evaluateVenueOpenStatus(venue, !!activeShift);
    const s = (venue.settings || {}) as Record<string, any>;

    const displayName = company?.tradeName
      ? (venue.name && venue.name !== 'Sede Principal' ? `${company.tradeName} - ${venue.name}` : company.tradeName)
      : venue.name;

    return {
      id: venue.id,
      name: displayName,
      slug: effectiveSlug,
      restaurantName: company?.tradeName || venue.name,
      restaurantSlug: companySlug || effectiveSlug,
      companyId: venue.companyId || company?.id || null,
      address: venue.address || s.address || company?.address || '',
      phone: s.phone || company?.phone || '',
      city: s.city || '',
      logoUrl: s.logoUrl || company?.logoUrl || null,
      primaryColor: s.primaryColor || company?.primaryColor || '#ea580c',
      openingHours: s.openingHours || '',
      operatingStatus: statusEval.operatingStatus,
      isOpen: statusEval.isOpen,
      schedule: s.schedule,
      requireShiftForDelivery: !!s.requireShiftForDelivery,
      currency: s.currency || 'COP',
      taxRate: s.taxRate || s.defaultTaxRate || 0.08,
      isPrimary: venue.isPrimary,
      isActive: venue.isActive,
      settings: venue.settings,
    };
  }

  async getFirstVenue() {
    const [venue] = await this.database.select().from(schema.venues).limit(1);
    if (!venue) throw new NotFoundError('No hay locales registrados en el sistema');
    return venue;
  }

  async getVenueById(id: string) {
    const [venue] = await this.database.select().from(schema.venues).where(eq(schema.venues.id, id)).limit(1);
    if (!venue) throw new NotFoundError('Local no encontrado');

    let company = null;
    if (venue.companyId) {
      const [comp] = await this.database.select().from(schema.companies).where(eq(schema.companies.id, venue.companyId)).limit(1);
      company = comp || null;
    }
    if (!company) {
      const [firstComp] = await this.database.select().from(schema.companies).limit(1);
      company = firstComp || null;
    }

    const companySlug = company?.slug || (company?.tradeName ? company.tradeName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : null);

    // Auto-migrate generic 'sede-principal' venue slug in database to the restaurant slug
    if (venue.slug === 'sede-principal' && companySlug) {
      try {
        await this.database.update(schema.venues).set({ slug: companySlug }).where(eq(schema.venues.id, venue.id));
        venue.slug = companySlug;
      } catch (_) {}
    }

    const effectiveSlug = (venue.slug === 'sede-principal' && companySlug) ? companySlug : (venue.slug || companySlug || venue.id);

    return {
      ...venue,
      restaurantSlug: companySlug || effectiveSlug,
      restaurantName: company?.tradeName || venue.name,
      effectiveSlug,
    };
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
        phone: data.phone || data.settings?.phone || '',
        slug: data.slug || data.settings?.slug || '',
        city: data.city || data.settings?.city || '',
        managerName: data.managerName || data.settings?.managerName || '',
        openingHours: data.openingHours || data.settings?.openingHours || '',
        notes: data.notes || data.settings?.notes || '',
        ...(data.settings || {}),
      };

      const computedSlug =
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

      const [newVenue] = await tx
        .insert(schema.venues)
        .values({
          companyId: data.companyId || null,
          name: data.name,
          slug: computedSlug,
          address: data.address || '',
          timezone: data.timezone || 'America/Bogota',
          settings: { ...defaultSettings, slug: computedSlug },
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
    const existingSettings = (existing.settings as Record<string, unknown>) || {};
    const mergedSettings = {
      ...existingSettings,
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.managerName !== undefined ? { managerName: data.managerName } : {}),
      ...(data.openingHours !== undefined ? { openingHours: data.openingHours } : {}),
      ...(data.operatingStatus !== undefined ? { operatingStatus: data.operatingStatus } : {}),
      ...(data.schedule !== undefined ? { schedule: data.schedule } : {}),
      ...(data.requireShiftForDelivery !== undefined ? { requireShiftForDelivery: data.requireShiftForDelivery } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.settings || {}),
    };
    const updateFields: Record<string, unknown> = { settings: mergedSettings };
    if (data.name) updateFields.name = data.name;
    if (data.slug) updateFields.slug = data.slug;
    if (data.address !== undefined) updateFields.address = data.address;
    if (data.timezone) updateFields.timezone = data.timezone;

    const [updated] = await this.database.update(schema.venues).set(updateFields).where(eq(schema.venues.id, id)).returning();
    return updated;
  }

  async toggleVenueStatus(id: string, isActive: boolean) {
    await this.getVenueById(id);
    const [updated] = await this.database
      .update(schema.venues)
      .set({ isActive })
      .where(eq(schema.venues.id, id))
      .returning();
    return updated;
  }

  async checkVenueDependencies(id: string) {
    await this.getVenueById(id);

    const activeOrders = await this.database
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.venueId, id),
          inArray(schema.orders.status, ['open', 'sent_to_kitchen', 'partially_ready', 'ready', 'check_requested'])
        )
      );

    const openShifts = await this.database
      .select({ id: schema.cashShifts.id })
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, id), eq(schema.cashShifts.status, 'open')));

    const [activeUsers] = await this.database
      .select({ count: count() })
      .from(schema.users)
      .where(and(eq(schema.users.venueId, id), eq(schema.users.isActive, true)));

    const activeOrdersCount = activeOrders.length;
    const openShiftsCount = openShifts.length;
    const activeStaffCount = Number(activeUsers?.count || 0);

    const canDelete = activeOrdersCount === 0 && openShiftsCount === 0;

    return {
      canDelete,
      activeOrdersCount,
      openShiftsCount,
      activeStaffCount,
    };
  }

  async deleteVenue(id: string) {
    const deps = await this.checkVenueDependencies(id);
    if (!deps.canDelete) {
      const reasons: string[] = [];
      if (deps.activeOrdersCount > 0) {
        reasons.push(`${deps.activeOrdersCount} comanda(s) activas`);
      }
      if (deps.openShiftsCount > 0) {
        reasons.push('un turno de caja abierto');
      }
      throw new ConflictError(
        `No se puede eliminar la sede: tiene ${reasons.join(' y ')}. Finalice o cierre estas operaciones primero, o desactive la sede.`
      );
    }

    // Soft delete: deactivate venue to preserve historical orders and receipts
    const [deleted] = await this.database
      .update(schema.venues)
      .set({ isActive: false })
      .where(eq(schema.venues.id, id))
      .returning();

    return {
      success: true,
      message: 'Sede desactivada/eliminada exitosamente',
      venue: deleted,
    };
  }

  async getRoles(requester?: any) {
    const isSuperAdmin = requester?.role === 'super_admin';
    if (isSuperAdmin) {
      return await this.database.select().from(schema.roles).orderBy(desc(schema.roles.hierarchy));
    }
    return await this.database
      .select()
      .from(schema.roles)
      .where(sql`${schema.roles.name} != 'super_admin'`)
      .orderBy(desc(schema.roles.hierarchy));
  }

  async getVenueUsers(requester: any, venueId?: string) {
    const isSuperAdmin = requester?.role === 'super_admin';

    const baseQuery = this.database
      .select({
        id: schema.users.id,
        name: schema.users.name,
        documentNumber: schema.users.documentNumber,
        companyId: schema.users.companyId,
        companyName: schema.companies.tradeName,
        venueId: schema.users.venueId,
        venueName: schema.venues.name,
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
      .leftJoin(schema.companies, eq(schema.users.companyId, schema.companies.id))
      .leftJoin(schema.venues, eq(schema.users.venueId, schema.venues.id));

    // 1. Super Admin: sees ALL users across all companies and restaurants
    if (isSuperAdmin) {
      return await baseQuery.orderBy(desc(schema.users.createdAt));
    }

    // 2. Non-Super Admin:
    // Security: Only users belonging to their linked company/restaurant, and never super_admin
    let companyId = requester?.companyId;
    if (!companyId && requester?.venueId) {
      const [v] = await this.database
        .select({ companyId: schema.venues.companyId })
        .from(schema.venues)
        .where(eq(schema.venues.id, requester.venueId))
        .limit(1);
      companyId = v?.companyId;
    }

    const conditions = [
      sql`${schema.roles.name} != 'super_admin'`,
    ];

    if (companyId) {
      conditions.push(eq(schema.users.companyId, companyId));
    } else if (requester?.venueId) {
      conditions.push(eq(schema.users.venueId, requester.venueId));
    } else {
      return [];
    }

    return await baseQuery
      .where(and(...conditions))
      .orderBy(desc(schema.users.createdAt));
  }

  async createUser(venueId: string, data: any, requester?: any) {
    const isSuperAdmin = requester?.role === 'super_admin';

    // Verify role being assigned
    const [targetRole] = await this.database
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.id, data.roleId))
      .limit(1);

    if (!targetRole) {
      throw new BadRequestError('El rol especificado no existe.');
    }

    if (targetRole.name === 'super_admin' && !isSuperAdmin) {
      throw new ForbiddenError('No tienes permisos para crear usuarios con rol Super Administrador.');
    }

    // Role-based restrictions on email: only managers and super_admins can have email
    if (data.email && targetRole.name !== 'manager' && targetRole.name !== 'super_admin') {
      throw new BadRequestError('Solo los usuarios con rol Gerente pueden tener correo electrónico.');
    }

    let rawPassword = data.password;
    if (data.email && !rawPassword) {
      rawPassword = Math.random().toString(36).slice(-8) + 'A1!';
    }

    const pinHash = await bcrypt.hash(data.pin, 10);
    const passwordHash = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null;
    const normalizedDoc = data.documentNumber ? String(data.documentNumber).trim() : null;

    let companyId = data.companyId;
    let targetVenueId = data.venueId || venueId;

    if (!companyId) {
      if (!isSuperAdmin && requester?.companyId) {
        companyId = requester.companyId;
      } else if (targetVenueId && targetVenueId !== 'default') {
        const [venue] = await this.database
          .select({ companyId: schema.venues.companyId })
          .from(schema.venues)
          .where(eq(schema.venues.id, targetVenueId))
          .limit(1);
        companyId = venue?.companyId || null;
      }
    }

    if (companyId && (!targetVenueId || targetVenueId === 'default')) {
      const [v] = await this.database
        .select({ id: schema.venues.id })
        .from(schema.venues)
        .where(eq(schema.venues.companyId, companyId))
        .limit(1);
      if (v) targetVenueId = v.id;
    }

    if (!isSuperAdmin && requester?.companyId && companyId !== requester.companyId) {
      throw new ForbiddenError('No tienes permisos para registrar usuarios en otra empresa.');
    }

    if (normalizedDoc && companyId) {
      const [existingDoc] = await this.database
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(and(eq(schema.users.companyId, companyId), eq(schema.users.documentNumber, normalizedDoc)))
        .limit(1);
      if (existingDoc) {
        throw new BadRequestError('Ya existe un usuario registrado con este número de cédula en este restaurante.');
      }
    }

    if (normalizedEmail) {
      const [existing] = await this.database.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, normalizedEmail)).limit(1);
      if (existing) throw new BadRequestError('Ya existe un usuario registrado con este correo electrónico.');
    }

    const [newUser] = await this.database
      .insert(schema.users)
      .values({
        companyId: companyId || null,
        venueId: targetVenueId === 'default' ? null : (targetVenueId || null),
        name: data.name.trim(),
        documentNumber: normalizedDoc,
        email: normalizedEmail,
        passwordHash,
        pinHash,
        roleId: data.roleId,
        avatarUrl: data.avatarUrl || null,
        allVenuesAccess: targetRole.name === 'super_admin' ? true : false,
        isActive: true,
      })
      .returning();

    // Trigger welcome email for manager or admin with credentials
    if (newUser.email && rawPassword && (targetRole.name === 'manager' || targetRole.name === 'super_admin')) {
      let companyName = undefined;
      if (companyId) {
        const [comp] = await this.database
          .select({ tradeName: schema.companies.tradeName, legalName: schema.companies.legalName })
          .from(schema.companies)
          .where(eq(schema.companies.id, companyId))
          .limit(1);
        if (comp) companyName = comp.tradeName || comp.legalName;
      }

      emailService
        .sendManagerWelcomeEmail({
          to: newUser.email,
          name: newUser.name,
          rawPassword,
          companyName,
        })
        .catch((err) => console.error('[venue.repository] Error enviando correo de bienvenida a gerente:', err));
    }

    return newUser;
  }

  async updateUser(userId: string, data: any, requester?: any) {
    const isSuperAdmin = requester?.role === 'super_admin';

    const [existing] = await this.database
      .select({
        user: schema.users,
        roleName: schema.roles.name,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!existing) throw new NotFoundError('Usuario no encontrado');

    if (existing.roleName === 'super_admin' && !isSuperAdmin) {
      throw new ForbiddenError('No tienes permisos para modificar un usuario Super Administrador.');
    }

    if (!isSuperAdmin && requester?.companyId && existing.user.companyId !== requester.companyId) {
      throw new ForbiddenError('No tienes permisos para modificar usuarios de otra empresa.');
    }

    if (data.roleId && !isSuperAdmin) {
      const [targetRole] = await this.database
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.id, data.roleId))
        .limit(1);
      if (targetRole?.name === 'super_admin') {
        throw new ForbiddenError('No tienes permisos para asignar el rol Super Administrador.');
      }
    }

    const updatePayload: Partial<typeof schema.users.$inferInsert> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.roleId !== undefined) updatePayload.roleId = data.roleId;
    if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
    if (data.isActive !== undefined) {
      updatePayload.isActive = data.isActive;
      if (data.isActive === false) {
        updatePayload.tokenVersion = (existing.user.tokenVersion || 1) + 1;
        await redis.del(`user_token_version:${userId}`);
        await redis.del(`pin_lockout:${userId}`);
      }
    }
    if (data.documentNumber !== undefined) {
      const normalizedDoc = data.documentNumber ? String(data.documentNumber).trim() : null;
      if (normalizedDoc && normalizedDoc !== existing.user.documentNumber) {
        const companyId = existing.user.companyId;
        if (companyId) {
          const [conflictDoc] = await this.database
            .select({ id: schema.users.id })
            .from(schema.users)
            .where(and(eq(schema.users.companyId, companyId), eq(schema.users.documentNumber, normalizedDoc)))
            .limit(1);
          if (conflictDoc) {
            throw new BadRequestError('El número de cédula ya se encuentra en uso por otro usuario en este restaurante.');
          }
        }
      }
      updatePayload.documentNumber = normalizedDoc;
    }
    if (data.email !== undefined) {
      const normalized = data.email ? data.email.toLowerCase().trim() : null;
      if (normalized && normalized !== existing.user.email) {
        const [conflict] = await this.database.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, normalized)).limit(1);
        if (conflict) throw new BadRequestError('El correo electrónico ya se encuentra en uso por otro usuario.');
      }
      updatePayload.email = normalized;
    }
    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(data.password, 10);
      updatePayload.tokenVersion = (existing.user.tokenVersion || 1) + 1;
      await redis.del(`user_token_version:${userId}`);
    }

    const [updated] = await this.database.update(schema.users).set(updatePayload).where(eq(schema.users.id, userId)).returning();

    // Trigger password changed notification if password was modified and user has email
    if (data.password && (updated.email || existing.user.email)) {
      const recipientEmail = updated.email || existing.user.email;
      const recipientName = updated.name || existing.user.name;
      let companyName = undefined;

      if (existing.user.companyId) {
        const [comp] = await this.database
          .select({ tradeName: schema.companies.tradeName })
          .from(schema.companies)
          .where(eq(schema.companies.id, existing.user.companyId))
          .limit(1);
        if (comp) companyName = comp.tradeName;
      }

      emailService
        .sendPasswordChangedEmail({
          to: recipientEmail!,
          name: recipientName,
          newPassword: data.password,
          companyName,
        })
        .catch((err) => console.error('[venue.repository] Error enviando alerta de cambio de contraseña:', err));
    }

    return updated;
  }

  async resetPin(userId: string, newPin: string, requester?: any) {
    const isSuperAdmin = requester?.role === 'super_admin';

    const [existing] = await this.database
      .select({
        user: schema.users,
        roleName: schema.roles.name,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!existing) throw new NotFoundError('Usuario no encontrado');

    if (existing.roleName === 'super_admin' && !isSuperAdmin) {
      throw new ForbiddenError('No tienes permisos para restablecer el PIN de un Super Administrador.');
    }

    if (!isSuperAdmin && requester?.companyId && existing.user.companyId !== requester.companyId) {
      throw new ForbiddenError('No tienes permisos para modificar usuarios de otra empresa.');
    }

    const pinHash = await bcrypt.hash(newPin, 10);
    await this.database.update(schema.users).set({ pinHash, tokenVersion: sql`${schema.users.tokenVersion} + 1` }).where(eq(schema.users.id, userId));
    await redis.del(`pin_lockout:${userId}`);
    await redis.del(`pin_attempts:${userId}`);
    await redis.del(`user_token_version:${userId}`);

    return { success: true, message: 'PIN actualizado exitosamente' };
  }

  async deleteUser(userId: string, requester?: any) {
    const isSuperAdmin = requester?.role === 'super_admin';

    const [existing] = await this.database
      .select({
        user: schema.users,
        roleName: schema.roles.name,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!existing) throw new NotFoundError('Usuario no encontrado');

    if (existing.roleName === 'super_admin' && !isSuperAdmin) {
      throw new ForbiddenError('No tienes permisos para desactivar un Super Administrador.');
    }

    if (!isSuperAdmin && requester?.companyId && existing.user.companyId !== requester.companyId) {
      throw new ForbiddenError('No tienes permisos para desactivar usuarios de otra empresa.');
    }

    await this.database.update(schema.users).set({ isActive: false, tokenVersion: sql`${schema.users.tokenVersion} + 1` }).where(eq(schema.users.id, userId));
    await redis.del(`user_token_version:${userId}`);
    await redis.del(`pin_lockout:${userId}`);
    return { success: true };
  }
}

export const venueRepository = new VenueRepository();
