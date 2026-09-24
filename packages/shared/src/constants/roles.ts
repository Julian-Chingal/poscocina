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
  super_admin: 100,
  manager: 80,
  cashier: 60,
  waiter: 40,
  kitchen: 20,
  kds_display: 10,
};

export const PIN_RESTRICTED_HIERARCHY = 80;
export const PIN_ALLOWED_ROLES: RoleName[] = [
  ROLES.CASHIER,
  ROLES.WAITER,
  ROLES.KITCHEN,
  ROLES.KDS_DISPLAY,
];

