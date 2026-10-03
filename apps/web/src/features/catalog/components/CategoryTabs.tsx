import React from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Category, Product } from '../types/catalog.types';
import { Button } from '@/components/ui/button';

interface Props {
  categories: Category[];
  products: Product[];
  activeCategory: string;
  availabilityFilter?: 'all' | 'available' | 'sold_out';
  isManager: boolean;
  onSelectCategory: (id: string) => void;
  onSelectAvailabilityFilter?: (filter: 'all' | 'available' | 'sold_out') => void;
  onOpenCreateCategory: () => void;
  onEditCategory: (cat: Category, e: React.MouseEvent) => void;
  onDeleteCategory: (cat: Category) => void;
  onOpenModifiers?: () => void;
}

export const CategoryTabs: React.FC<Props> = ({
  categories,
  products,
  activeCategory,
  availabilityFilter = 'all',
  isManager,
  onSelectCategory,
  onSelectAvailabilityFilter,
  onOpenCreateCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const soldOutTotal = products.filter((p) => !p.isAvailable).length;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
      {/* Scrollable Categories List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar flex-1 min-w-0">
        {/* All Products Tab */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-3.5 h-9 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border select-none shrink-0 ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'bg-card hover:bg-muted/70 text-muted-foreground hover:text-foreground border-border/80'
          }`}
        >
          <span>Todos los platos</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
              activeCategory === 'all'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {products.length}
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((c) => {
          const categoryProducts = products.filter((p) => p.categoryId === c.id);
          const count = categoryProducts.length;
          const hasSoldOut = categoryProducts.some((p) => !p.isAvailable);
          const isActive = activeCategory === c.id;
          const categoryColor = c.color || 'var(--primary)';

          return (
            <div
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className={`group relative flex items-center gap-2 px-3.5 h-9 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border select-none shrink-0 ${
                isActive
                  ? 'bg-card text-foreground border-primary shadow-2xs ring-1 ring-primary/20'
                  : 'bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border/80'
              }`}
            >
              {/* Category Color Dot */}
              <span
                className="size-2.5 rounded-full shrink-0 ring-1 ring-border/50"
                style={{ backgroundColor: categoryColor }}
              />

              <span>{c.name}</span>

              {/* Count & Warning */}
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>

                {hasSoldOut && (
                  <span
                    className="size-1.5 rounded-full bg-amber-500 shrink-0"
                    title="Contiene platos agotados"
                  />
                )}
              </div>

              {/* Quick Actions for Managers */}
              {isManager && (
                <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={(e) => onEditCategory(c, e)}
                    title="Editar categoría"
                    className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-muted rounded-md"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCategory(c);
                    }}
                    title="Eliminar categoría"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* Create Category Action */}
        {isManager && (
          <Button
            variant="ghost"
            type="button"
            onClick={onOpenCreateCategory}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold text-primary hover:text-primary bg-primary/5 hover:bg-primary/15 border border-dashed border-primary/30 whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Nueva Categoría</span>
          </Button>
        )}
      </div>

      {/* Quick Availability Filter Chips */}
      {onSelectAvailabilityFilter && (
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onSelectAvailabilityFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              availabilityFilter === 'all'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onSelectAvailabilityFilter('available')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              availabilityFilter === 'available'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                : 'text-muted-foreground hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 className="size-3 text-emerald-500" />
            <span>Disponibles</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectAvailabilityFilter('sold_out')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              availabilityFilter === 'sold_out'
                ? 'bg-destructive/15 text-destructive shadow-2xs'
                : 'text-muted-foreground hover:text-destructive'
            }`}
          >
            <AlertCircle className="size-3 text-destructive" />
            <span>Agotados {soldOutTotal > 0 && `(${soldOutTotal})`}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;
