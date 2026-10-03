import React from 'react';
import { Plus, SlidersHorizontal, LayoutGrid, List, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  search: string;
  isManager: boolean;
  stats?: {
    total: number;
    available: number;
    soldOut: number;
    totalCategories: number;
  };
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
  onSearchChange: (val: string) => void;
  onOpenCreateProduct: () => void;
  onOpenModifiersManager?: () => void;
}

export const CatalogHeader: React.FC<Props> = ({
  search,
  isManager,
  stats,
  viewMode = 'grid',
  onViewModeChange,
  onSearchChange,
  onOpenCreateProduct,
  onOpenModifiersManager,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-border/70 gap-4">
      {/* Title & Live Status */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
            <UtensilsCrossed className="size-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Menú y Catálogo
          </h1>

          {stats && (
            <div className="flex items-center gap-1.5 ml-1">
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-muted text-foreground border-border/80">
                {stats.total} {stats.total === 1 ? 'producto' : 'productos'}
              </Badge>
              {stats.soldOut > 0 ? (
                <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 rounded-lg border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  <span>{stats.soldOut} agotados (86)</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 rounded-lg border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% disponible</span>
                </Badge>
              )}
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Gestiona precios, recetas, estaciones de comanda y disponibilidad de tu carta.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full lg:w-auto">
        {/* Search */}
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar por plato, ingrediente..."
            className="w-full"
          />
        </div>

        {/* View Switcher (Grid vs Table) */}
        {onViewModeChange && (
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/80 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`h-7 w-7 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vista en tarjetas"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`h-7 w-7 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vista en tabla"
            >
              <List className="size-3.5" />
            </Button>
          </div>
        )}

        {/* Toppings / Modifiers Button */}
        {onOpenModifiersManager && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenModifiersManager}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground hover:text-primary transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Toppings & Modificadores</span>
            <span className="sm:hidden">Toppings</span>
          </Button>
        )}

        {/* Create Product Button */}
        {isManager && (
          <Button
            type="button"
            onClick={onOpenCreateProduct}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 h-9 rounded-xl shadow-xs hover:shadow-primary/25 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Nuevo Producto</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CatalogHeader;
