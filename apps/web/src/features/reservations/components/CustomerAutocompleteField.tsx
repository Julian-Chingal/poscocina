import React from 'react';
import { Customer } from '../types/reservations.types';
import { useCustomerAutocomplete } from '../hooks/useCustomerAutocomplete';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CustomerAutocompleteFieldProps {
  venueId: string;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerAutocompleteField: React.FC<CustomerAutocompleteFieldProps> = ({
  venueId,
  onSelectCustomer,
}) => {
  const {
    query,
    setQuery,
    results,
    selectCustomer,
  } = useCustomerAutocomplete(venueId);

  return (
    <div className="space-y-1.5">
      <Label className="block text-xs font-medium text-muted-foreground">
        Buscar Cliente Habitual (Cédula o Nombre)
      </Label>
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar por cédula/NIT, nombre o tel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 text-xs"
        />
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto">
            {results.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  selectCustomer(c);
                  onSelectCustomer(c);
                }}
                className="px-3 py-2 text-xs hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0"
              >
                <div className="font-bold text-foreground">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  Doc: {c.documentNumber || 'S/N'} • Tel: {c.phone || 'S/N'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
