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
      venueId: venue.id,
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      pinHash,
      roleId: roleMap[ROLES.SUPER_ADMIN],
      isActive: true,
      tokenVersion: 1,
    });
    console.log(`  ✅ Usuario Administrador creado: ${adminEmail}`);
    console.log(`     - Contraseña inicial: ${adminPassword}`);
    console.log(`     - PIN inicial: ${adminPin}`);
  } else {
    console.log(`  ℹ️ Usuario Administrador ya existente: ${adminEmail}`);
  }

  console.log('✅ Semilla completada exitosamente: Sistema listo con un Venue vacío y cuenta Administrador.');
  await queryClient.end();
}

seed().catch((err) => {
  console.error('❌ Error ejecutando la semilla:', err);
  process.exit(1);
});
