export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
  KDS_DISPLAY: 'kds_display',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<RoleName, number> = {
  super_admin: 1,
  manager: 2,
  cashier: 3,
  waiter: 4,
  kitchen: 5,
  kds_display: 6,
};
