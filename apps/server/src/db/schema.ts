import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  smallint,
  numeric,
  timestamp,
  jsonb,
  serial,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'open',
  'sent_to_kitchen',
  'partially_ready',
  'ready',
  'check_requested',
  'paid',
  'cancelled',
  'voided',
]);

export const itemStatusEnum = pgEnum('item_status', [
  'pending',
  'sent',
  'in_preparation',
  'ready',
  'delivered',
  'cancelled',
]);

export const tableStatusEnum = pgEnum('table_status', [
  'free',
  'occupied',
  'check_requested',
  'reserved',
  'blocked',
]);

// 1. Venues
export const venues = pgTable('venues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address'),
  timezone: varchar('timezone', { length: 50 }).notNull().default('America/Bogota'),
  settings: jsonb('settings').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 2. Roles & Permissions (RBAC)
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 30 }).notNull().unique(),
  label: varchar('label', { length: 60 }).notNull(),
  hierarchy: smallint('hierarchy').notNull(),
  isSystem: boolean('is_system').notNull().default(true),
});

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  module: varchar('module', { length: 40 }).notNull(),
  action: varchar('action', { length: 40 }).notNull(),
  resource: varchar('resource', { length: 40 }).notNull().default('all'),
  description: text('description'),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
);

// 3. Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  pinHash: varchar('pin_hash', { length: 72 }),
  email: varchar('email', { length: 150 }).unique(),
  passwordHash: varchar('password_hash', { length: 72 }),
  roleId: uuid('role_id').notNull().references(() => roles.id),
  avatarUrl: text('avatar_url'),
  tokenVersion: smallint('token_version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 4. Floor Plans & Tables
export const floorPlans = pgTable('floor_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  layout: jsonb('layout').notNull().default({}),
  isActive: boolean('is_active').notNull().default(true),
});

export const tables = pgTable('tables', {
  id: uuid('id').primaryKey().defaultRandom(),
  floorPlanId: uuid('floor_plan_id').notNull().references(() => floorPlans.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 20 }).notNull(),
  capacity: smallint('capacity').notNull().default(4),
  positionX: numeric('position_x', { precision: 6, scale: 2 }).default('0'),
  positionY: numeric('position_y', { precision: 6, scale: 2 }).default('0'),
  shape: varchar('shape', { length: 20 }).default('rect'),
  status: tableStatusEnum('status').notNull().default('free'),
  currentOrderId: uuid('current_order_id'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 5. Product Catalog
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 80 }).notNull(),
  color: varchar('color', { length: 7 }),
  icon: varchar('icon', { length: 50 }),
  sortOrder: smallint('sort_order').notNull().default(0),
  printerStation: varchar('printer_station', { length: 30 }),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  sku: varchar('sku', { length: 50 }),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.08'),
  imageUrl: text('image_url'),
  isAvailable: boolean('is_available').notNull().default(true),
  trackInventory: boolean('track_inventory').notNull().default(false),
  prepTimeMin: smallint('prep_time_min'),
  printerStation: varchar('printer_station', { length: 30 }),
  sortOrder: smallint('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 6. Modifiers
export const modifierGroups = pgTable('modifier_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  selectionType: varchar('selection_type', { length: 20 }).notNull().default('single'),
  isRequired: boolean('is_required').notNull().default(false),
  minSelections: smallint('min_selections').notNull().default(0),
  maxSelections: smallint('max_selections'),
  sortOrder: smallint('sort_order').notNull().default(0),
});

export const modifiers = pgTable('modifiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => modifierGroups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  priceDelta: numeric('price_delta', { precision: 10, scale: 2 }).notNull().default('0.00'),
  isDefault: boolean('is_default').notNull().default(false),
  isAvailable: boolean('is_available').notNull().default(true),
  sortOrder: smallint('sort_order').notNull().default(0),
});

export const productModifierGroups = pgTable(
  'product_modifier_groups',
  {
    productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    groupId: uuid('group_id').notNull().references(() => modifierGroups.id, { onDelete: 'cascade' }),
    isRequired: boolean('is_required'),
    sortOrder: smallint('sort_order').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.groupId] })]
);

// 7. Orders & Items
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  orderType: varchar('order_type', { length: 20 }).notNull().default('dine_in'),
  status: orderStatusEnum('status').notNull().default('open'),
  waiterId: uuid('waiter_id').references(() => users.id, { onDelete: 'set null' }),
  guestCount: smallint('guest_count').default(1),
  notes: text('notes'),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0.00'),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).notNull().default('0.00'),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).notNull().default('0.00'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0.00'),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: smallint('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  status: itemStatusEnum('status').notNull().default('pending'),
  seatNumber: smallint('seat_number'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  course: smallint('course').default(1),
});

export const orderItemModifiers = pgTable('order_item_modifiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderItemId: uuid('order_item_id').notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  modifierId: uuid('modifier_id').notNull().references(() => modifiers.id),
  priceDelta: numeric('price_delta', { precision: 10, scale: 2 }).notNull().default('0.00'),
});

// 8. Cash Shifts & Receipts
export const cashShifts = pgTable('cash_shifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  cashierId: uuid('cashier_id').notNull().references(() => users.id),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  openingAmount: numeric('opening_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  closingAmount: numeric('closing_amount', { precision: 12, scale: 2 }),
  expectedAmount: numeric('expected_amount', { precision: 12, scale: 2 }),
  notes: text('notes'),
  status: varchar('status', { length: 20 }).notNull().default('open'),
});

export const receipts = pgTable('receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  cashShiftId: uuid('cash_shift_id').notNull().references(() => cashShifts.id),
  receiptNumber: serial('receipt_number'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).notNull(),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).notNull().default('0.00'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  fiscalNumber: varchar('fiscal_number', { length: 50 }),
  isSplit: boolean('is_split').notNull().default(false),
});

export const receiptPayments = pgTable('receipt_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  receiptId: uuid('receipt_id').notNull().references(() => receipts.id, { onDelete: 'cascade' }),
  method: varchar('method', { length: 30 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  reference: varchar('reference', { length: 100 }),
  tipAmount: numeric('tip_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
});

// 9. Inventory & Recipes
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull().default('g'), // 'g', 'ml', 'unit', 'kg'
  currentStock: numeric('current_stock', { precision: 12, scale: 4 }).notNull().default('0.0000'),
  alertThreshold: numeric('alert_threshold', { precision: 12, scale: 4 }).notNull().default('10.0000'),
  costPerUnit: numeric('cost_per_unit', { precision: 10, scale: 4 }).default('0.0000'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productRecipes = pgTable('product_recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  inventoryItemId: uuid('inventory_item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  quantity: numeric('quantity', { precision: 12, scale: 4 }).notNull(), // consumo por unidad vendida
  isWaste: boolean('is_waste').notNull().default(false),
});

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  inventoryItemId: uuid('inventory_item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  movementType: varchar('movement_type', { length: 30 }).notNull(), // 'sale', 'purchase', 'adjustment', 'waste'
  quantity: numeric('quantity', { precision: 12, scale: 4 }).notNull(),
  referenceId: uuid('reference_id'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 10. Relations
export const venuesRelations = relations(venues, ({ many }) => ({
  users: many(users),
  floorPlans: many(floorPlans),
  categories: many(categories),
  orders: many(orders),
  cashShifts: many(cashShifts),
}));

export const floorPlansRelations = relations(floorPlans, ({ one, many }) => ({
  venue: one(venues, { fields: [floorPlans.venueId], references: [venues.id] }),
  tables: many(tables),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  floorPlan: one(floorPlans, { fields: [tables.floorPlanId], references: [floorPlans.id] }),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  venue: one(venues, { fields: [categories.venueId], references: [venues.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  modifierGroups: many(productModifierGroups),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  venue: one(venues, { fields: [orders.venueId], references: [venues.id] }),
  table: one(tables, { fields: [orders.tableId], references: [tables.id] }),
  waiter: one(users, { fields: [orders.waiterId], references: [users.id] }),
  items: many(orderItems),
  receipts: many(receipts),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  modifiers: many(orderItemModifiers),
}));

export const orderItemModifiersRelations = relations(orderItemModifiers, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [orderItemModifiers.orderItemId],
    references: [orderItems.id],
  }),
  modifier: one(modifiers, {
    fields: [orderItemModifiers.modifierId],
    references: [modifiers.id],
  }),
}));

// 11. Security & Audit Trail
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venue_id').references(() => venues.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: varchar('entity_id', { length: 100 }),
  payload: jsonb('payload').default({}),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

