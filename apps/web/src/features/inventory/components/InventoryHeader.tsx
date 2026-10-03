import React from 'react';
import { Boxes, Truck, Building2, CookingPot, History, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { InventoryTab } from '../types/inventory.types';
import { Button } from '@/components/ui/button';

interface Props {
  activeTab: InventoryTab;
  onSelectTab: (tab: InventoryTab) => void;
  criticalCount?: number;
  totalItems?: number;
}

export const InventoryHeader: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  criticalCount = 0,
  totalItems = 0,
}) => {
  const tabs = [
    {
      id: 'stock' as const,
      label: 'Existencias de Stock',
      icon: Boxes,
      badge: criticalCount > 0 ? (
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 inline-flex items-center gap-1">
          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
          <span>{criticalCount}</span>
        </span>
      ) : totalItems > 0 ? (
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-muted text-muted-foreground">
          {totalItems}
        </span>
      ) : null,
    },
    { id: 'purchases' as const, label: 'Facturas de Compra', icon: Truck },
    { id: 'suppliers' as const, label: 'Proveedores', icon: Building2 },
    { id: 'recipes' as const, label: 'Escandallo & Recetas', icon: CookingPot },
    { id: 'toppings' as const, label: 'Toppings & Modificadores', icon: SlidersHorizontal },
    { id: 'movements' as const, label: 'Kardex de Movimientos', icon: History },
  ];

  return (
    <div className="w-full min-w-0 pb-2 mb-6 border-b border-border/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center space-x-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="truncate">Cadena de Suministro & Costos Gastronómicos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight truncate">
            Control de Inventarios
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gestión de insumos en bodega, escandallo de costos por receta, compras a proveedores y trazabilidad Kardex en tiempo real.
          </p>
        </div>
      </div>

      <nav className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-none w-full min-w-0">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <Button
            key={id}
            variant="ghost"
            type="button"
            onClick={() => onSelectTab(id)}
            className={`flex items-center space-x-2 px-3.5 py-2.5 h-auto rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === id
                ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs hover:bg-primary/20 hover:text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {badge}
          </Button>
        ))}
      </nav>
    </div>
  );
};
