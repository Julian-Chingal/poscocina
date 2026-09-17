import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface TopBarSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isHome: boolean;
  onNavigateHome: () => void;
}

export const TopBarSearch: React.FC<TopBarSearchProps> = ({
  searchQuery,
  onSearchChange,
  isHome,
  onNavigateHome,
}) => {
  return (
    <div className="flex-1 max-w-md hidden md:block">
      <div className="relative">
        <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar app o comando... (F1 Mesas, F2 POS, F3 KDS, F4 Caja)"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (!isHome && e.target.value.trim().length > 0) {
              onNavigateHome();
            }
          }}
          className="pl-9 pr-3 py-1 bg-slate-800/80 border-slate-700/80 text-xs focus-visible:border-orange-500"
        />
      </div>
    </div>
  );
};
