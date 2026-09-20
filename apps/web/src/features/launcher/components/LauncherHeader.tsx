import React from 'react';
import { Utensils } from 'lucide-react';
import { useBrandingStore } from '@/stores/branding.store';

export const LauncherHeader: React.FC = () => {
  const { name: companyName, settings } = useBrandingStore();

  return (
    <div className="text-center mb-10 z-10 max-w-xl">
      <div className="flex items-center justify-center space-x-3 mb-3">
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt="Logo"
            className="w-12 h-12 object-contain rounded-xl p-1 bg-card border border-border shadow-xs"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground shadow-md bg-primary"
          >
            <Utensils className="w-6 h-6" />
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {settings.companyName || companyName}
        </h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Plataforma modular de gestión gastronómica. Selecciona un módulo para comenzar.
      </p>
    </div>
  );
};
