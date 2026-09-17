import { ROLES, RoleName } from '@poscocina/shared';

export type PermissionAction =
  | 'manage_catalog'
  | 'manage_inventory'
  | 'manage_shifts'
  | 'manage_users'
  | 'manage_settings'
  | 'checkout_orders'
  | 'apply_discounts'
  | 'open_cash_drawer'
  | 'transfer_tables'
  | 'create_orders'
  | 'toggle_stock_86'
  | 'view_reports';

export const MODULE_PERMISSIONS: Record<string, RoleName[]> = {
  home: [
    ROLES.SUPER_ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
    ROLES.KDS_DISPLAY,
  ],
  salon: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  pos: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  reservations: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  kds: [
    ROLES.SUPER_ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
    ROLES.KDS_DISPLAY,
  ],
  catalog: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  inventory: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  shifts: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  reports: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  users: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  settings: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
};

export const ACTION_PERMISSIONS: Record<PermissionAction, RoleName[]> = {
  manage_catalog: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  manage_inventory: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  manage_shifts: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  manage_users: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  manage_settings: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  checkout_orders: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  apply_discounts: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
  open_cash_drawer: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  transfer_tables: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  create_orders: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  toggle_stock_86: [
    ROLES.SUPER_ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.KITCHEN,
  ],
  view_reports: [ROLES.SUPER_ADMIN, ROLES.MANAGER],
};
