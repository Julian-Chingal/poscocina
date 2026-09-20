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
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
      <Input
        type="text"
        placeholder="Buscar plato o bebida..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-10 rounded-xl"
      />
    </div>

    <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
      <Button
        variant={activeCategoryId === 'all' ? 'default' : 'ghost'}
        size="sm"
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-3.5 h-8 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
          activeCategoryId === 'all'
            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        Todos
      </Button>
      {categories.map((c) => (
        <Button
          key={c.id}
          variant={activeCategoryId === c.id ? 'default' : 'ghost'}
          size="sm"
          type="button"
          onClick={() => onSelectCategory(c.id)}
          className={`px-3.5 h-8 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeCategoryId === c.id
              ? 'bg-orange-600 hover:bg-orange-500 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {c.name}
        </Button>
      ))}
    </div>
  </div>
);

export default CategoryChips;
