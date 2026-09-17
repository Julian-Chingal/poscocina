import React from 'react';
import { Customer } from '../types/reservations.types';
import { useCustomerAutocomplete } from '../hooks/useCustomerAutocomplete';

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
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">
        Buscar Cliente Habitual (Cédula o Nombre)
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por cédula/NIT, nombre o tel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
        />
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto">
            {results.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  selectCustomer(c);
                  onSelectCustomer(c);
                }}
                className="px-3 py-2 text-xs hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
              >
                <div className="font-bold text-slate-100">{c.name}</div>
                <div className="text-[11px] text-slate-400">
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
