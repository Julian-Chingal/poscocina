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
      <Card className="p-2.5 bg-primary/10 border-primary/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-primary" />
          <div className="truncate">
            <span className="text-xs font-bold text-foreground block truncate">{selectedCustomer.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {selectedCustomer.documentType || 'Doc'}: {selectedCustomer.documentNumber || 'Sin doc'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onClearCustomer}
          className="h-7 w-7 p-1 text-muted-foreground hover:text-foreground"
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
          variant="outline"
          size="icon"
          type="button"
          onClick={onOpenCreateModal}
          className="h-9 w-9 text-primary rounded-xl"
          title="Registrar nuevo cliente"
        >
          <UserPlus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-popover border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto text-popover-foreground">
          {searchResults.map((c) => (
            <Button
              key={c.id}
              variant="ghost"
              type="button"
              onClick={() => onSelectCustomer(c)}
              className="w-full justify-start h-auto flex-col items-start px-3 py-2 text-xs text-foreground hover:bg-muted border-b border-border last:border-0 rounded-none cursor-pointer"
            >
              <div className="font-bold">{c.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono">
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
