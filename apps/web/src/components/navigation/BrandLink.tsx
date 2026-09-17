import React from 'react';
import { UtensilsCrossed, LayoutGrid } from 'lucide-react';
import { useBrandingStore } from '../../stores/branding.store';
import { cn } from '../../lib/utils';

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
    <button
      onClick={() => onNavigate('home')}
      title="Ir al Menú Principal de Aplicaciones [Esc]"
      className={cn(
        'group flex items-center gap-2.5 px-2 py-1 rounded-xl transition-all cursor-pointer select-none text-left',
        'border border-transparent hover:border-slate-700/80 hover:bg-slate-800/80',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500',
        isHome && 'bg-slate-800/50 border-slate-700/60',
        className
      )}
    >
      {/* Brand Icon or Logo */}
      <div className="relative shrink-0 flex items-center justify-center">
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt="Logo"
            className="size-7 rounded-lg object-contain bg-white/10 p-0.5 shadow-sm transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="size-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: settings.primaryColor || '#ea580c' }}
          >
            <UtensilsCrossed className="size-4" />
          </div>
        )}

        {/* Indicator dot when home is active */}
        {isHome && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-orange-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
        )}
      </div>

      {/* Brand Name & Action caption */}
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-xs sm:text-sm text-white tracking-tight truncate leading-tight group-hover:text-orange-400 transition-colors">
          {settings.companyName || companyName || 'poscocina'}
        </span>
        <span className="text-[10px] text-slate-400 font-medium leading-none flex items-center gap-1 mt-0.5">
          <LayoutGrid className="size-2.5 text-slate-500 group-hover:text-orange-400 transition-colors" />
          <span className="truncate">Inicio / Apps</span>
        </span>
      </div>
    </button>
  );
};
