import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Category, Product } from '../types/catalog.types';
import { Button } from '@/components/ui/button';

interface Props {
  categories: Category[];
  products: Product[];
  activeCategory: string;
  isManager: boolean;
  onSelectCategory: (id: string) => void;
  onOpenCreateCategory: () => void;
  onEditCategory: (cat: Category, e: React.MouseEvent) => void;
  onDeleteCategory: (cat: Category) => void;
}

export const CategoryTabs: React.FC<Props> = ({
  categories,
  products,
  activeCategory,
  isManager,
  onSelectCategory,
  onOpenCreateCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6">
      <Button
        variant={activeCategory === 'all' ? 'default' : 'ghost'}
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-4 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
          activeCategory === 'all'
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow'
            : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        Todas ({products.length})
      </Button>

      {categories.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelectCategory(c.id)}
          className={`group relative flex items-center space-x-2 px-3.5 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
            activeCategory === c.id
              ? 'bg-card border-primary text-foreground shadow'
              : 'bg-card/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: c.color || 'var(--primary)' }}
          />
          <span>
            {c.name} ({products.filter((p) => p.categoryId === c.id).length})
          </span>

          {isManager && (
            <div className="flex items-center space-x-1 pl-1 opacity-0 group-hover:opacity-100 transition">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={(e) => onEditCategory(c, e)}
                title="Editar categoría"
                className="h-6 w-6 p-1 text-muted-foreground hover:text-primary"
              >
                <Edit2 className="w-3 h-3" />
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
                className="h-6 w-6 p-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {isManager && (
        <Button
          variant="ghost"
          type="button"
          onClick={onOpenCreateCategory}
          className="flex items-center space-x-1.5 px-3 h-9 rounded-xl text-xs font-semibold text-primary hover:text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Categoría</span>
        </Button>
      )}
    </div>
  );
};

export default CategoryTabs;
