import React from 'react';
import { Sparkles, Save, Check } from 'lucide-react';
import { SettingsTab } from '../types/settings.types';
import { Button } from '@/components/ui/button';

interface Props {
  activeTab: SettingsTab;
  saving: boolean;
  savedSuccess: boolean;
  onSave: () => void;
}

export const SettingsHeader: React.FC<Props> = ({ activeTab, saving, savedSuccess, onSave }) => (
  <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
    <div>
      <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Personalización & Marca Blanca</span>
      </div>
      <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Ajustes del Sistema</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        Configuración fiscal, marca corporativa, tickets ESC/POS y multi-sucursal.
      </p>
    </div>

    {activeTab !== 'venues' && (
      <Button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={`flex items-center space-x-2 px-6 py-2.5 h-auto rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
          savedSuccess
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
        }`}
      >
        {savedSuccess ? (
          <>
            <Check className="w-4 h-4" />
            <span>¡Guardado con éxito!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </>
        )}
      </Button>
    )}
  </header>
);
