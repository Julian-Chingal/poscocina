import React from 'react';
import { UserPlus, UserCheck, X, UserSearch, Award } from 'lucide-react';
import { Customer } from '../types/pos.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <div className="p-2 sm:p-2.5 bg-primary/10 border border-primary/25 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <UserCheck className="size-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-foreground truncate block">
                {selectedCustomer.name}
              </span>
              {selectedCustomer.loyaltyPoints !== undefined && selectedCustomer.loyaltyPoints > 0 && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-0.5">
                  <Award className="size-2.5" />
                  <span>{selectedCustomer.loyaltyPoints} pts</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              <span>{selectedCustomer.documentType || 'Doc'}: {selectedCustomer.documentNumber || 'Sin doc'}</span>
              {selectedCustomer.phone && (
                <span className="hidden sm:inline-flex items-center gap-0.5">
                  • {selectedCustomer.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onClearCustomer}
          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 shrink-0"
          title="Quitar cliente de la orden"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 group">
          <UserSearch className="size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Asignar cliente (cédula o nombre)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8.5 h-9 rounded-xl text-xs bg-muted/30 border-border/80 focus-visible:ring-primary shadow-2xs placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground hover:text-foreground p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onOpenCreateModal}
          className="h-9 px-2.5 text-xs font-semibold rounded-xl text-primary border-primary/30 hover:bg-primary/10 gap-1 shrink-0"
          title="Crear y registrar nuevo cliente"
        >
          <UserPlus className="size-3.5" />
          <span className="hidden sm:inline">Nuevo</span>
        </Button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-popover border border-border/90 rounded-xl shadow-xl max-h-52 overflow-y-auto custom-scrollbar text-popover-foreground">
          {searchResults.length > 0 ? (
            searchResults.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCustomer(c)}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted/80 border-b border-border/60 last:border-0 cursor-pointer transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    {c.documentType}: {c.documentNumber} {c.phone && `• ${c.phone}`}
                  </div>
                </div>
                {c.loyaltyPoints !== undefined && c.loyaltyPoints > 0 && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shrink-0">
                    {c.loyaltyPoints} pts
                  </Badge>
                )}
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-muted-foreground space-y-1.5">
              <span>No encontramos clientes con esos datos.</span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={onOpenCreateModal}
                className="w-full text-xs text-primary font-bold hover:bg-primary/10 h-7"
              >
                + Crear cliente &ldquo;{searchQuery}&rdquo;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelectDropdown;
