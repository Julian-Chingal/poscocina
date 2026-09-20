import React from 'react';
import { Building2, Receipt, Printer, Store } from 'lucide-react';
import { SettingsTab } from '../types/settings.types';
import { Button } from '@/components/ui/button';

interface Props {
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
  venuesCount: number;
}

export const SettingsTabsNav: React.FC<Props> = ({ activeTab, onSelectTab, venuesCount }) => {
  const tabs = [
    { id: 'identity' as const, label: '1. Identidad & Marca', icon: Building2 },
    { id: 'tax' as const, label: '2. Facturación & Impuestos', icon: Receipt },
    { id: 'printer' as const, label: '3. Impresión Térmica ESC/POS', icon: Printer },
    { id: 'venues' as const, label: '4. Gestión de Sedes', icon: Store, count: venuesCount },
  ];

  return (
    <nav className="flex space-x-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto">
      {tabs.map(({ id, label, icon: Icon, count }) => {
        const isActive = activeTab === id;
        return (
          <Button
            key={id}
            variant="ghost"
            type="button"
            onClick={() => onSelectTab(id)}
            className={`flex items-center space-x-2 px-4 py-2.5 h-auto rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              isActive
                ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30 hover:text-orange-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {count !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </nav>
  );
};
