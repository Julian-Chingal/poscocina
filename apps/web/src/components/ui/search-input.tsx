import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      placeholder = 'Buscar...',
      value,
      onChange,
      onClear,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative w-full', className)}>
        <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex h-8 w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-9 pr-8 py-1 text-xs text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
            title="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer select-none"
          >
            <X className="size-3" />
            <span className="sr-only">Limpiar</span>
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
