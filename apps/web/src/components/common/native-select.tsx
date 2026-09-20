import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-8 w-full appearance-none rounded-lg border border-border bg-card px-3 py-1 pr-8 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
      </div>
    );
  }
);
NativeSelect.displayName = 'NativeSelect';

export const Select = NativeSelect;
