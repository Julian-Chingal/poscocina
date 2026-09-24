import React from 'react';

export interface SubNavItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
  disabled?: boolean;
}

export interface SubNavGroup {
  id?: string;
  heading?: string;
  items: SubNavItem[];
}
