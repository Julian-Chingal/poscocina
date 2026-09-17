import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, queryClient } from './index.js';
import * as schema from './schema.js';
import { ROLES, ROLE_HIERARCHY } from '@poscocina/shared';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Roles
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

  // 2. Default Venue
  let [venue] = await db.select().from(schema.venues).limit(1);
  if (!venue) {
    const [newVenue] = await db
      .insert(schema.venues)
      .values({
        name: 'Restaurante Demo Poscocina',
        address: 'Calle 100 # 15-20, Bogotá',
        timezone: 'America/Bogota',
        settings: {
          currency: 'COP',
          tax_rate: 0.08,
          defaultTaxType: 'INC',
          defaultTaxRate: 0.08,
          defaultTipPct: 0,
          cashier_max_discount_pct: 10,
        },
      })
      .returning();
    venue = newVenue;
  }

  // 3. Demo Users
  const pin1234 = await bcrypt.hash('1234', 10);
  const pin1111 = await bcrypt.hash('1111', 10);
  const pin2222 = await bcrypt.hash('2222', 10);
  const pwdAdmin = await bcrypt.hash('admin123', 10);

  const demoUsers = [
    {
      venueId: venue.id,
      name: 'Administrador Demo',
      email: 'admin@poscocina.com',
      passwordHash: pwdAdmin,
      pinHash: pin1234,
      roleId: roleMap[ROLES.SUPER_ADMIN],
    },
    {
      venueId: venue.id,
      name: 'Carlos Gerente',
      email: 'gerente@poscocina.com',
      passwordHash: pwdAdmin,
      pinHash: pin1234,
      roleId: roleMap[ROLES.MANAGER],
    },
    {
      venueId: venue.id,
      name: 'Ana Cajera',
      email: 'caja@poscocina.com',
      pinHash: pin1111,
      roleId: roleMap[ROLES.CASHIER],
    },
    {
      venueId: venue.id,
      name: 'Juan Mesero',
      email: 'mesero1@poscocina.com',
      pinHash: pin2222,
      roleId: roleMap[ROLES.WAITER],
    },
    {
      venueId: venue.id,
      name: 'KDS Estación Principal',
      roleId: roleMap[ROLES.KDS_DISPLAY],
    },
  ];

  for (const u of demoUsers) {
    await db.insert(schema.users).values(u).onConflictDoNothing();
  }

  // 4. Floor Plan & Tables
  let [floorPlan] = await db
    .select()
    .from(schema.floorPlans)
    .where(eq(schema.floorPlans.venueId, venue.id))
    .limit(1);

  if (!floorPlan) {
    const [newPlan] = await db
      .insert(schema.floorPlans)
      .values({
        venueId: venue.id,
        name: 'Salón Principal',
      })
      .returning();
    floorPlan = newPlan;

    const demoTables = [
      { floorPlanId: floorPlan.id, label: 'Mesa 1', capacity: 4, positionX: '100', positionY: '100' },
      { floorPlanId: floorPlan.id, label: 'Mesa 2', capacity: 4, positionX: '250', positionY: '100' },
      { floorPlanId: floorPlan.id, label: 'Mesa 3', capacity: 2, positionX: '100', positionY: '250' },
      { floorPlanId: floorPlan.id, label: 'Mesa 4', capacity: 6, positionX: '250', positionY: '250' },
      { floorPlanId: floorPlan.id, label: 'Barra 1', capacity: 1, positionX: '400', positionY: '100' },
    ];

    for (const t of demoTables) {
      await db.insert(schema.tables).values(t);
    }
  }

  // 5. Categories & Products
  const [catBebidas] = await db
    .insert(schema.categories)
    .values({ venueId: venue.id, name: 'Bebidas', color: '#3b82f6', printerStation: 'bar' })
    .onConflictDoNothing()
    .returning();

  const [catFuertes] = await db
    .insert(schema.categories)
    .values({ venueId: venue.id, name: 'Platos Fuertes', color: '#ef4444', printerStation: 'kitchen' })
    .onConflictDoNothing()
    .returning();

  let burger: any = null;
  if (catFuertes) {
    const [createdBurger] = await db
      .insert(schema.products)
      .values({
        categoryId: catFuertes.id,
        name: 'Hamburguesa Clásica',
        description: 'Carne de res 180g, queso cheddar, lechuga y tomate en pan brioche',
        price: '28000.00',
        printerStation: 'kitchen',
      })
      .returning();
    burger = createdBurger;

    // Modifier Group: Punto de cocción
    const [modGroupCoccion] = await db
      .insert(schema.modifierGroups)
      .values({
        venueId: venue.id,
        name: 'Término de cocción',
        selectionType: 'single',
        isRequired: true,
      })
      .returning();

    await db.insert(schema.modifiers).values([
      { groupId: modGroupCoccion.id, name: 'Término Medio (3/4)', priceDelta: '0.00', isDefault: true },
      { groupId: modGroupCoccion.id, name: 'Bien Cocido', priceDelta: '0.00' },
    ]);

    await db.insert(schema.productModifierGroups).values({
      productId: burger.id,
      groupId: modGroupCoccion.id,
      isRequired: true,
    });
  }

    // 6. Demo Inventory Items & Recipes
    const [insumoCarne] = await db
      .insert(schema.inventoryItems)
      .values({
        venueId: venue.id,
        name: 'Carne Molida de Res 80/20',
        unit: 'g',
        currentStock: '15000.0000', // 15 kg
        alertThreshold: '2000.0000', // Alerta en 2 kg
        costPerUnit: '0.0350', // $35 por gramo
      })
      .returning();

    const [insumoPan] = await db
      .insert(schema.inventoryItems)
      .values({
        venueId: venue.id,
        name: 'Pan Brioche Artesanal',
        unit: 'unit',
        currentStock: '80.0000', // 80 panes
        alertThreshold: '15.0000',
        costPerUnit: '1200.0000',
      })
      .returning();

    const [insumoQueso] = await db
      .insert(schema.inventoryItems)
      .values({
        venueId: venue.id,
        name: 'Queso Cheddar Tajado',
        unit: 'g',
        currentStock: '4000.0000', // 4 kg
        alertThreshold: '500.0000',
        costPerUnit: '0.0400',
      })
      .returning();

    // Hamburguesa Clásica Recipe
    if (burger && insumoCarne && insumoPan && insumoQueso) {
      await db.insert(schema.productRecipes).values([
        { productId: burger.id, inventoryItemId: insumoCarne.id, quantity: '180.0000' }, // 180g carne
        { productId: burger.id, inventoryItemId: insumoPan.id, quantity: '1.0000' },      // 1 pan
        { productId: burger.id, inventoryItemId: insumoQueso.id, quantity: '30.0000' },   // 30g queso
      ]);
    }

    console.log('✅ Seed completed successfully!');
  await queryClient.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
