import React from 'react';
import { Search } from 'lucide-react';
import { Category } from '../types/pos.types';

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
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
      <input
        type="text"
        placeholder="Buscar plato o bebida..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
      />
    </div>

    <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
          activeCategoryId === 'all'
            ? 'bg-orange-600 text-white shadow'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        Todos
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelectCategory(c.id)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
            activeCategoryId === c.id
              ? 'bg-orange-600 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  </div>
);
