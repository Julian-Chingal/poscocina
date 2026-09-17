import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionAction } from '../constants/permissions';
import { RoleName } from '@poscocina/shared';

interface CanProps {
  do?: PermissionAction;
  module?: string;
  roles?: RoleName[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  do: action,
  module: moduleId,
  roles,
  fallback = null,
  children,
}) => {
  const { can, canAccessModule, hasRole } = usePermissions();

  let isAllowed = true;

  if (action && !can(action)) {
    isAllowed = false;
  }

  if (moduleId && !canAccessModule(moduleId)) {
    isAllowed = false;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
