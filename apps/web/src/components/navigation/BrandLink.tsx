import React from 'react';
import { UtensilsCrossed, LayoutGrid } from 'lucide-react';
import { useBrandingStore } from '../../stores/branding.store';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface BrandLinkProps {
  isHome: boolean;
  onNavigate: (view: string) => void;
  className?: string;
}

export const BrandLink: React.FC<BrandLinkProps> = ({
  isHome,
  onNavigate,
  className,
}) => {
  const { name: companyName, settings } = useBrandingStore();

  return (
    <Button
      variant="ghost"
      onClick={() => onNavigate('home')}
      title="Ir al Menú Principal de Aplicaciones [Esc]"
      className={cn(
        'h-auto group flex items-center gap-2.5 px-2 py-1 rounded-xl transition-all cursor-pointer select-none text-left',
        'border border-transparent hover:border-border hover:bg-muted/70',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
        isHome && 'bg-muted/80 border-border shadow-2xs',
        className
      )}
    >
      {/* Brand Icon or Logo */}
      <div className="relative shrink-0 flex items-center justify-center">
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt="Logo"
            className="size-7 rounded-lg object-contain bg-background/50 border border-border p-0.5 shadow-xs transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="size-7 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shadow-xs transition-transform group-hover:scale-105 bg-primary"
          >
            <UtensilsCrossed className="size-4" />
          </div>
        )}

        {/* Indicator dot when home is active */}
        {isHome && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-primary rounded-full ring-2 ring-background animate-pulse" />
        )}
      </div>

      {/* Brand Name & Action caption */}
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-xs sm:text-sm text-foreground tracking-tight truncate leading-tight group-hover:text-primary transition-colors">
          {settings.companyName || companyName || 'poscocina'}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium leading-none flex items-center gap-1 mt-0.5">
          <LayoutGrid className="size-2.5 text-muted-foreground/80 group-hover:text-primary transition-colors" />
          <span className="truncate">Inicio / Apps</span>
        </span>
      </div>
    </Button>
  );
};
