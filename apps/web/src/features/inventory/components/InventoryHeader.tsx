import React from 'react';
import { Boxes, Truck, Building2, CookingPot, History } from 'lucide-react';
import { InventoryTab } from '../types/inventory.types';
import { Button } from '@/components/ui/button';

interface Props {
  activeTab: InventoryTab;
  onSelectTab: (tab: InventoryTab) => void;
}

export const InventoryHeader: React.FC<Props> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'stock' as const, label: 'Existencias de Stock', icon: Boxes },
    { id: 'purchases' as const, label: 'Facturas de Compra', icon: Truck },
    { id: 'suppliers' as const, label: 'Proveedores', icon: Building2 },
    { id: 'recipes' as const, label: 'Escandallo & Recetas', icon: CookingPot },
    { id: 'movements' as const, label: 'Kardex de Movimientos', icon: History },
  ];

  return (
    <div className="pb-4 mb-6 border-b border-slate-800 space-y-4">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          <Boxes className="w-3.5 h-3.5" />
          <span>Cadena de Suministro & Costos</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Control de Inventarios</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Gestión de insumos, escandallos por plato, compras a proveedores y trazabilidad Kardex.
        </p>
      </div>

      <nav className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            type="button"
            onClick={() => onSelectTab(id)}
            className={`flex items-center space-x-2 px-4 py-2.5 h-auto rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === id
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 hover:text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
};
