import React from 'react';
import { UserPlus, UserCheck, X } from 'lucide-react';
import { Customer } from '../types/pos.types';

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
      <div className="p-2.5 bg-orange-950/30 border border-orange-500/40 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-orange-400" />
          <div className="truncate">
            <span className="text-xs font-bold text-white block truncate">{selectedCustomer.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedCustomer.documentType || 'Doc'}: {selectedCustomer.documentNumber || 'Sin doc'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClearCustomer}
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      <div className="flex items-center space-x-1.5">
        <input
          type="text"
          placeholder="Buscar cliente (cédula o nombre)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
        />
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-xl border border-slate-700 transition cursor-pointer"
          title="Registrar nuevo cliente"
        >
          <UserPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {searchResults.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCustomer(c)}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 cursor-pointer"
            >
              <div className="font-bold">{c.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {c.documentType}: {c.documentNumber} {c.phone && `• ${c.phone}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
