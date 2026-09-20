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
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow'
            : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
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
              ? 'bg-slate-800 border-blue-500 text-white shadow'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: c.color || '#3b82f6' }}
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
                className="h-6 w-6 p-1 text-slate-400 hover:text-blue-400"
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
                className="h-6 w-6 p-1 text-slate-400 hover:text-rose-400"
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
          className="flex items-center space-x-1.5 px-3 h-9 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Categoría</span>
        </Button>
      )}
    </div>
  );
};

export default CategoryTabs;
