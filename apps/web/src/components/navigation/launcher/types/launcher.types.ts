import React from 'react';

export interface AppItem {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  category: 'operacion' | 'gestion' | 'config';
}

export interface AppLauncherViewProps {
  onSelectApp: (appId: string) => void;
  searchQuery: string;
}
