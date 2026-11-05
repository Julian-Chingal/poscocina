import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, queryClient } from './index.js';
import * as schema from './schema.js';
import { ROLES, ROLE_HIERARCHY } from '@poscocina/shared';

async function seed() {
  console.log('🌱 Inicializando semilla base del sistema...');

  // 1. Roles del Sistema (RBAC)
  console.log('  -> Configurando roles de usuario...');
  const rolesToInsert = [
    { name: ROLES.SUPER_ADMIN, label: 'Super Administrador', hierarchy: ROLE_HIERARCHY.super_admin },
    { name: ROLES.MANAGER, label: 'Gerente de Local', hierarchy: ROLE_HIERARCHY.manager },
    { name: ROLES.CASHIER, label: 'Cajero', hierarchy: ROLE_HIERARCHY.cashier },
    { name: ROLES.WAITER, label: 'Mesero', hierarchy: ROLE_HIERARCHY.waiter },
    { name: ROLES.KITCHEN, label: 'Cocina / Bar', hierarchy: ROLE_HIERARCHY.kitchen },
    { name: ROLES.KDS_DISPLAY, label: 'Pantalla KDS', hierarchy: ROLE_HIERARCHY.kds_display },
  ];

  for (const role of rolesToInsert) {
    await db
      .insert(schema.roles)
      .values(role)
      .onConflictDoUpdate({
        target: schema.roles.name,
        set: { label: role.label, hierarchy: role.hierarchy },
      });
  }

  const allRoles = await db.select().from(schema.roles);
  const roleMap = Object.fromEntries(allRoles.map((r) => [r.name, r.id]));

  // 2. Entidad Corporativa y Configuración Fiscal Base
  console.log('  -> Verificando entidad corporativa...');
  let [company] = await db.select().from(schema.companies).limit(1);
  if (!company) {
    const [newCompany] = await db
      .insert(schema.companies)
      .values({
        legalName: 'poscocina S.A.S.',
        tradeName: 'poscocina',
        taxId: '900.123.456-7',
        slug: 'poscocina',
        primaryColor: '#ea580c',
        email: 'contacto@poscocina.com',
        phone: '+57 300 123 4567',
        address: 'Sede Principal',
      })
      .returning();
    company = newCompany;

    await db
      .insert(schema.companyFiscalSettings)
      .values({
        companyId: company.id,
        regime: 'SIMPLIFICADO',
        taxType: 'INC_8',
        taxRate: 0.08,
        defaultTipPct: 10,
        currency: 'COP',
        isInvoiceResolutionEnabled: false,
        receiptHeader: 'Sabor tradicional & Alta cocina',
        receiptFooter: '¡Gracias por su visita!',
      })
      .onConflictDoNothing();
  } else if (!company.slug) {
    await db.update(schema.companies).set({ slug: 'poscocina' }).where(eq(schema.companies.id, company.id));
  }

  // 3. Venue Único Inicial (Completamente vacío, sin mesas ni zonas)
  console.log('  -> Verificando local/venue principal...');
  let [venue] = await db.select().from(schema.venues).limit(1);
  if (!venue) {
    const [newVenue] = await db
      .insert(schema.venues)
      .values({
        companyId: company?.id ?? null,
        name: 'Sede Principal',
        slug: 'sede-principal',
        address: 'Calle Principal # 1-01',
        timezone: 'America/Bogota',
        isPrimary: true,
        isActive: true,
        settings: {
          currency: 'COP',
          tax_rate: 0.08,
          defaultTaxType: 'INC',
          defaultTaxRate: 0.08,
          defaultTipPct: 10,
          cashier_max_discount_pct: 10,
        },
      })
      .returning();
    venue = newVenue;
  } else if (!venue.slug) {
    await db.update(schema.venues).set({ slug: 'sede-principal' }).where(eq(schema.venues.id, venue.id));
  }

  // 4. Usuario Único Administrador (Super Admin)
  console.log('  -> Configurando usuario administrador...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@poscocina.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminPin = process.env.ADMIN_PIN || '1234';

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const pinHash = await bcrypt.hash(adminPin, 10);

  const [existingAdmin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    await db.insert(schema.users).values({
      companyId: company.id,
      venueId: venue.id,
      name: 'Administrador',
      documentNumber: '10000001',
      email: adminEmail,
      passwordHash,
      pinHash,
      roleId: roleMap[ROLES.SUPER_ADMIN],
      allVenuesAccess: true,
      isActive: true,
      tokenVersion: 1,
    });
    console.log(`  ✅ Usuario Administrador creado: ${adminEmail}`);
    console.log(`     - Cédula inicial: 10000001`);
    console.log(`     - Contraseña inicial: ${adminPassword}`);
    console.log(`     - PIN inicial: ${adminPin}`);
  } else {
    await db
      .update(schema.users)
      .set({
        companyId: company.id,
        documentNumber: '10000001',
        allVenuesAccess: true,
      })
      .where(eq(schema.users.id, existingAdmin.id));
    console.log(`  ℹ️ Usuario Administrador ya existente: ${adminEmail} (Actualizado con companyId y cédula)`);
  }

  // 4.1 Usuario Operativo de Demostración (Mesero para probar login con cédula)
  const waiterDoc = '10203040';
  const [existingWaiter] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.documentNumber, waiterDoc))
    .limit(1);

  if (!existingWaiter && roleMap[ROLES.WAITER]) {
    const waiterPinHash = await bcrypt.hash('1234', 10);
    await db.insert(schema.users).values({
      companyId: company.id,
      venueId: venue.id,
      name: 'Carlos Mesero',
      documentNumber: waiterDoc,
      email: 'carlos.mesero@poscocina.com',
      pinHash: waiterPinHash,
      roleId: roleMap[ROLES.WAITER],
      allVenuesAccess: false,
      isActive: true,
      tokenVersion: 1,
    });
    console.log(`  ✅ Usuario Mesero de prueba creado: Cédula ${waiterDoc} / PIN 1234`);
  }

  // 5. Estación de Trabajo por Defecto (Cocina Principal)
  console.log('  -> Configurando estación de trabajo por defecto (Cocina Principal)...');
  const allVenues = await db.select().from(schema.venues);
  for (const v of allVenues) {
    let [kitchenStation] = await db
      .select()
      .from(schema.workstations)
      .where(eq(schema.workstations.venueId, v.id))
      .limit(1);

    if (!kitchenStation) {
      const [newStation] = await db
        .insert(schema.workstations)
        .values({
          venueId: v.id,
          name: 'Cocina Principal',
          code: 'kitchen',
          description: 'Estación principal de preparación en cocina',
          color: '#ea580c',
          icon: 'ChefHat',
          isActive: true,
          sortOrder: 0,
        })
        .onConflictDoNothing()
        .returning();
      kitchenStation = newStation;
    }

    if (kitchenStation) {
      const venueProducts = await db
        .select({ product: schema.products })
        .from(schema.products)
        .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
        .where(eq(schema.categories.venueId, v.id));

      for (const row of venueProducts) {
        await db
          .insert(schema.productStations)
          .values({
            productId: row.product.id,
            stationId: kitchenStation.id,
            isPrimary: true,
            sortOrder: 0,
          })
          .onConflictDoNothing();
      }
    }
  }

    // 9. Planes y Cupones SaaS
  console.log('  -> Configurando planes SaaS y cupones base...');
  const basePlans = [
    {
      name: 'Plan Emprendedor',
      slug: 'starter',
      description: 'Ideal para cafeterías, food trucks y restaurantes individuales.',
      price: '69000.00',
      currency: 'COP',
      billingInterval: 'month' as const,
      trialDays: 14,
      features: { kds: false, inventory: true, delivery: true, reservations: false, advancedReports: false, multiStation: false, customBranding: false, apiAccess: false },
      limits: { maxVenues: 1, maxTables: 15, maxUsers: 3, maxProducts: 100, maxOrdersPerMonth: 500 },
      isActive: true,
      isPublic: true,
      sortOrder: 1,
    },
    {
      name: 'Plan Crecimiento Pro',
      slug: 'pro',
      description: 'Para restaurantes consolidados con alto volumen y cocina KDS.',
      price: '149000.00',
      currency: 'COP',
      billingInterval: 'month' as const,
      trialDays: 14,
      features: { kds: true, inventory: true, delivery: true, reservations: true, advancedReports: true, multiStation: true, customBranding: false, apiAccess: false },
      limits: { maxVenues: 3, maxTables: 50, maxUsers: 10, maxProducts: -1, maxOrdersPerMonth: -1 },
      isActive: true,
      isPublic: true,
      sortOrder: 2,
    },
    {
      name: 'Plan Franquicia Enterprise',
      slug: 'enterprise',
      description: 'Múltiples sedes, control total de inventario y máxima potencia.',
      price: '299000.00',
      currency: 'COP',
      billingInterval: 'month' as const,
      trialDays: 30,
      features: { kds: true, inventory: true, delivery: true, reservations: true, advancedReports: true, multiStation: true, customBranding: true, apiAccess: true },
      limits: { maxVenues: -1, maxTables: -1, maxUsers: -1, maxProducts: -1, maxOrdersPerMonth: -1 },
      isActive: true,
      isPublic: true,
      sortOrder: 3,
    },
    {
      name: 'Plan Cortesía Total (VIP)',
      slug: 'complimentary-vip',
      description: 'Acceso total bonificado al 100% sin cobro recurrente para aliados.',
      price: '0.00',
      currency: 'COP',
      billingInterval: 'month' as const,
      trialDays: 0,
      features: { kds: true, inventory: true, delivery: true, reservations: true, advancedReports: true, multiStation: true, customBranding: true, apiAccess: true },
      limits: { maxVenues: -1, maxTables: -1, maxUsers: -1, maxProducts: -1, maxOrdersPerMonth: -1 },
      isActive: true,
      isPublic: false,
      sortOrder: 99,
    },
  ];

  for (const plan of basePlans) {
    const existing = await db.select().from(schema.saasPlans).where(eq(schema.saasPlans.slug, plan.slug)).limit(1);
    if (!existing.length) {
      await db.insert(schema.saasPlans).values(plan);
    }
  }

  const baseCoupons = [
    {
      code: 'ZOGUI50',
      name: '50% Descuento Primeros 3 Meses',
      discountType: 'percentage' as const,
      discountValue: '50.00',
      currency: 'COP',
      duration: 'repeating' as const,
      durationInMonths: 3,
      maxRedemptions: 100,
      isActive: true,
    },
    {
      code: 'BIENVENIDA100',
      name: 'Primer Mes 100% Gratis',
      discountType: 'percentage' as const,
      discountValue: '100.00',
      currency: 'COP',
      duration: 'once' as const,
      durationInMonths: 1,
      maxRedemptions: 50,
      isActive: true,
    },
    {
      code: 'LIFETIME100',
      name: 'Cortesía Vitalicia 100%',
      discountType: 'percentage' as const,
      discountValue: '100.00',
      currency: 'COP',
      duration: 'forever' as const,
      maxRedemptions: 10,
      isActive: true,
    },
  ];

  for (const coupon of baseCoupons) {
    const existing = await db.select().from(schema.saasCoupons).where(eq(schema.saasCoupons.code, coupon.code)).limit(1);
    if (!existing.length) {
      await db.insert(schema.saasCoupons).values(coupon);
    }
  }

  console.log('✅ Semilla completada exitosamente: Sistema listo con un Venue vacío y cuentas base.');
  await queryClient.end();
}

seed().catch((err) => {
  console.error('❌ Error ejecutando la semilla:', err);
  process.exit(1);
});
