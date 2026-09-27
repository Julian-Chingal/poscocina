import React from 'react';
import { Search } from 'lucide-react';
import { Category } from '../types/pos.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  categories: Category[];
  activeCategoryId: string;
  searchQuery: string;
  onSelectCategory: (id: string) => void;
  onSearchChange: (q: string) => void;
}

export const CategoryChips: React.FC<Props> = ({
  categories,
  activeCategoryId,
  searchQuery,
  onSelectCategory,
  onSearchChange,
}) => (
  <div className="space-y-3 mb-4">
    <div className="relative">
      <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
      <Input
        type="text"
        placeholder="Buscar plato, bebida o ingrediente..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-10 rounded-xl bg-card border-border/80 focus-visible:ring-primary shadow-2xs text-sm"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>

    <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-none custom-scrollbar">
      <Button
        variant={activeCategoryId === 'all' ? 'default' : 'secondary'}
        size="sm"
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-4 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
          activeCategoryId === 'all'
            ? 'shadow-xs shadow-primary/25'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        Todos
      </Button>
      {categories.map((c) => (
        <Button
          key={c.id}
          variant={activeCategoryId === c.id ? 'default' : 'secondary'}
          size="sm"
          type="button"
          onClick={() => onSelectCategory(c.id)}
          className={`px-4 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 gap-2 cursor-pointer ${
            activeCategoryId === c.id
              ? 'shadow-xs shadow-primary/25'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {c.color && (
            <span
              className="size-2 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/20"
              style={{ backgroundColor: c.color }}
              aria-hidden="true"
            />
          )}
          <span>{c.name}</span>
        </Button>
      ))}
    </div>
  </div>
);

export default CategoryChips;
