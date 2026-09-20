import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
        <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 pl-9 pr-8 py-1 text-xs bg-muted/40 border-border placeholder:text-muted-foreground/60 text-foreground"
          {...props}
        />
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
            title="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3" />
            <span className="sr-only">Limpiar</span>
          </Button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
