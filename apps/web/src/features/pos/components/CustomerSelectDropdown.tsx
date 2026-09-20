import React from 'react';
import { UserPlus, UserCheck, X } from 'lucide-react';
import { Customer } from '../types/pos.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  selectedCustomer: Customer | null;
  searchQuery: string;
  searchResults: Customer[];
  showDropdown: boolean;
  onSearchChange: (q: string) => void;
  onSelectCustomer: (c: Customer) => void;
  onClearCustomer: () => void;
  onOpenCreateModal: () => void;
}

export const CustomerSelectDropdown: React.FC<Props> = ({
  selectedCustomer,
  searchQuery,
  searchResults,
  showDropdown,
  onSearchChange,
  onSelectCustomer,
  onClearCustomer,
  onOpenCreateModal,
}) => {
  if (selectedCustomer) {
    return (
      <Card className="p-2.5 bg-orange-950/30 border-orange-500/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-orange-400" />
          <div className="truncate">
            <span className="text-xs font-bold text-white block truncate">{selectedCustomer.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedCustomer.documentType || 'Doc'}: {selectedCustomer.documentNumber || 'Sin doc'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onClearCustomer}
          className="h-7 w-7 p-1 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </Card>
    );
  }

  return (
    <div className="relative space-y-1">
      <div className="flex items-center space-x-1.5">
        <Input
          type="text"
          placeholder="Buscar cliente (cédula o nombre)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 h-9 rounded-xl text-xs"
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onOpenCreateModal}
          className="h-9 w-9 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-xl border border-slate-700"
          title="Registrar nuevo cliente"
        >
          <UserPlus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {searchResults.map((c) => (
            <Button
              key={c.id}
              variant="ghost"
              type="button"
              onClick={() => onSelectCustomer(c)}
              className="w-full justify-start h-auto flex-col items-start px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 rounded-none cursor-pointer"
            >
              <div className="font-bold">{c.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {c.documentType}: {c.documentNumber} {c.phone && `• ${c.phone}`}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerSelectDropdown;
