import React, { useState, useEffect, useRef } from 'react';
import { Store, ChevronDown, Check, Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useBrandingStore, VenueItem } from '../../stores/branding.store';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from '../ui/sonner';
import { cn } from '../../lib/utils';

interface VenueSelectorProps {
  onNavigateSettings?: () => void;
  className?: string;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  onNavigateSettings,
  className,
}) => {
  const { currentUser, venueId, setVenueId } = useAuthStore();
  const { venues, loadAllVenues, switchVenue, name: fallbackCompanyName } =
    useBrandingStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load venues on mount
  useEffect(() => {
    loadAllVenues();
  }, [loadAllVenues]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentVenue =
    venues.find((v) => v.id === venueId) ||
    venues[0] ||
    ({
      id: venueId,
      name: fallbackCompanyName || 'Sede Principal',
      isActive: true,
    } as VenueItem);

  const handleSelectVenue = async (targetVenue: VenueItem) => {
    setIsOpen(false);
    if (targetVenue.id === venueId) return;

    setVenueId(targetVenue.id);
    await switchVenue(targetVenue.id);

    toast.info(`Sede activa: ${targetVenue.name}`, {
      description:
        'Los catálogos, mesas y pedidos se han sincronizado con esta sede.',
    });
  };

  const getVenueInitial = (venueName: string) => {
    return venueName ? venueName.trim().charAt(0).toUpperCase() : 'S';
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Cambiar de Sede / Sucursal"
        className={cn(
          'flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer select-none',
          'bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500',
          isOpen && 'bg-slate-800 border-orange-500/50 text-white'
        )}
      >
        {/* Active Venue Logo / Avatar */}
        <Avatar size="sm" className="size-5 border border-slate-700">
          {currentVenue.settings?.logoUrl && (
            <AvatarImage
              src={currentVenue.settings.logoUrl}
              alt={currentVenue.name}
            />
          )}
          <AvatarFallback className="bg-orange-600/30 text-orange-400 font-bold text-[10px]">
            {getVenueInitial(currentVenue.name)}
          </AvatarFallback>
        </Avatar>

        {/* Venue Name */}
        <span className="font-medium max-w-[130px] truncate text-left">
          {currentVenue.name}
        </span>

        <ChevronDown
          className={cn(
            'size-3.5 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-orange-400'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Store className="size-3 text-orange-400" />
              <span>Sucursales Activas</span>
            </span>
            <span className="text-orange-400 font-bold text-xs bg-orange-950/60 px-1.5 py-0.2 rounded border border-orange-800/40">
              {venues.length}
            </span>
          </div>

          {venues.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500">
              Cargando sedes...
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40">
              {venues.map((v) => {
                const isSelected = v.id === currentVenue.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVenue(v)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition cursor-pointer select-none',
                      isSelected
                        ? 'bg-orange-500/10 text-orange-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Venue Avatar / Logo */}
                      <Avatar
                        size="sm"
                        className={cn(
                          'size-6 shrink-0 border',
                          isSelected
                            ? 'border-orange-500/50'
                            : 'border-slate-700'
                        )}
                      >
                        {v.settings?.logoUrl && (
                          <AvatarImage
                            src={v.settings.logoUrl}
                            alt={v.name}
                          />
                        )}
                        <AvatarFallback
                          className={cn(
                            'text-[10px] font-bold',
                            isSelected
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          )}
                        >
                          {getVenueInitial(v.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Venue Info */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{v.name}</div>
                        {v.address && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {v.address}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="size-4 text-orange-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Super Admin Shortcut to manage venues */}
          {currentUser?.roleName === 'super_admin' && onNavigateSettings && (
            <div className="border-t border-slate-800 mt-1 pt-1 px-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateSettings();
                }}
                className="w-full px-2.5 py-1.5 text-left text-[11px] text-orange-400 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
              >
                <Plus className="size-3.5" />
                <span>Gestionar / Configurar Sedes</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
