import React from 'react';
import { Search, X, Sparkles, Layers } from 'lucide-react';
import { Category, Product } from '../types/pos.types';
import { Input } from '@/components/ui/input';

interface Props {
  categories: Category[];
  activeCategoryId: string;
  searchQuery: string;
  products?: Product[];
  onSelectCategory: (id: string) => void;
  onSearchChange: (q: string) => void;
}

export const CategoryChips: React.FC<Props> = ({
  categories,
  activeCategoryId,
  searchQuery,
  products = [],
  onSelectCategory,
  onSearchChange,
}) => {
  const totalCount = products.length;

  const getCategoryCount = (categoryId: string) => {
    if (!products.length) return undefined;
    return products.filter((p) => p.categoryId === categoryId).length;
  };

  return (
    <div className="space-y-2.5">
      {/* Search Input Bar */}
      <div className="relative group">
        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar producto, plato o código rápido..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onSearchChange('');
            }
          }}
          className="pl-10 pr-20 h-10 rounded-xl bg-card border-border/80 focus-visible:ring-primary shadow-2xs text-xs sm:text-sm placeholder:text-muted-foreground/70"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
              title="Borrar búsqueda (Esc)"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/80 rounded select-none">
              Esc
            </kbd>
          )}
        </div>
      </div>

      {/* Horizontal Category Navigation Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none custom-scrollbar select-none -mx-1 px-1">
        {/* 'Todos' Chip */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 border ${
            activeCategoryId === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/20 scale-[1.02]'
              : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/70 hover:border-border'
          }`}
        >
          <Layers className="size-3.5" />
          <span>Todos</span>
          {totalCount > 0 && (
            <span
              className={`ml-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-semibold ${
                activeCategoryId === 'all'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {totalCount}
            </span>
          )}
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((c) => {
          const isActive = activeCategoryId === c.id;
          const count = getCategoryCount(c.id);

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCategory(c.id)}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/20 scale-[1.02]'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/70 hover:border-border'
              }`}
            >
              {c.color ? (
                <span
                  className="size-2.5 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/20 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />
              ) : (
                <Sparkles className="size-3 opacity-60" />
              )}
              <span className="whitespace-nowrap">{c.name}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-semibold ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
