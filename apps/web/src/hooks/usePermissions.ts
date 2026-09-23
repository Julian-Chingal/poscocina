import { useMemo, useCallback } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { RoleName, ROLES } from '@poscocina/shared';
import {
  MODULE_PERMISSIONS,
  ACTION_PERMISSIONS,
  PermissionAction,
} from '../constants/permissions';

export const usePermissions = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const role = (currentUser?.roleName || currentUser?.role) as RoleName | undefined;
  const hierarchy = currentUser?.hierarchy ?? 0;

  const isSuperAdmin = role === ROLES.SUPER_ADMIN || hierarchy >= 100;
  const isManager = isSuperAdmin || role === ROLES.MANAGER || hierarchy >= 80;
  const isCashier = isManager || role === ROLES.CASHIER || hierarchy >= 60;
  const isWaiter = isCashier || role === ROLES.WAITER || hierarchy >= 40;
  const isKitchen = role === ROLES.KITCHEN || isManager;
  const isKds = role === ROLES.KDS_DISPLAY || isKitchen || isManager;

  // Stable referential identity for canAccessModule to prevent spurious re-runs in hooks
  const canAccessModule = useCallback(
    (moduleId: string): boolean => {
      if (!currentUser || !role) return false;
      if (isSuperAdmin) return true;
      const allowedRoles = MODULE_PERMISSIONS[moduleId];
      if (!allowedRoles) return false;
      return allowedRoles.includes(role);
    },
    [currentUser, role, isSuperAdmin]
  );

  const can = useCallback(
    (action: PermissionAction): boolean => {
      if (!currentUser || !role) return false;
      if (isSuperAdmin) return true;
      const allowedRoles = ACTION_PERMISSIONS[action];
      if (!allowedRoles) return false;
      return allowedRoles.includes(role);
    },
    [currentUser, role, isSuperAdmin]
  );

  const hasRole = useCallback(
    (...allowedRoles: RoleName[]): boolean => {
      if (!role) return false;
      if (isSuperAdmin) return true;
      return allowedRoles.includes(role);
    },
    [role, isSuperAdmin]
  );

  return useMemo(
    () => ({
      role,
      hierarchy,
      currentUser,
      isSuperAdmin,
      isManager,
      isCashier,
      isWaiter,
      isKitchen,
      isKds,
      canAccessModule,
      can,
      hasRole,
    }),
    [
      role,
      hierarchy,
      currentUser,
      isSuperAdmin,
      isManager,
      isCashier,
      isWaiter,
      isKitchen,
      isKds,
      canAccessModule,
      can,
      hasRole,
    ]
  );
};
