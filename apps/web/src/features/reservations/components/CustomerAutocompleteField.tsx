import React from 'react';
import { Search, UserCheck, Sparkles, X } from 'lucide-react';
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
  const { query, setQuery, results, selectCustomer } = useCustomerAutocomplete(venueId);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="block text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-primary" />
          <span>Buscar Cliente Registrado</span>
        </Label>
        <span className="text-[11px] text-muted-foreground">Opcional</span>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Escribe cédula/NIT, nombre o teléfono para autocompletar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 text-xs rounded-xl bg-card border-border/80 focus-visible:ring-primary/40 pr-8"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border/80 rounded-2xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-border/50">
            {results.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  selectCustomer(c);
                  onSelectCustomer(c);
                }}
                className="p-3 text-xs hover:bg-muted/60 cursor-pointer transition flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    {c.documentNumber && <span>Doc: {c.documentNumber}</span>}
                    {c.phone && <span>Tel: {c.phone}</span>}
                  </div>
                </div>

                {c.loyaltyPoints ? (
                  <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3" />
                    <span>{c.loyaltyPoints} pts</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAutocompleteField;
