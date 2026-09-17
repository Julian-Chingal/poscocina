import React, { useState, useEffect } from 'react';
import { Circle, Lock, Maximize2, Minimize2 } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { BrandLink } from './navigation/BrandLink';
import { VenueSelector } from './navigation/VenueSelector';
import { ShiftStatusBadge } from './navigation/ShiftStatusBadge';
import { UserNav } from './navigation/UserNav';
import { TopBarSearch } from './navigation/TopBarSearch';
import { Button } from './ui/button';

interface TopBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const VIEW_TITLES: Record<string, string> = {
  home: 'Aplicaciones',
  salon: 'Salón y Mesas (F1)',
  reservations: 'Reservas de Mesas',
  pos: 'Punto de Venta (F2)',
  kds: 'Cocina KDS (F3)',
  catalog: 'Menú y Catálogo',
  inventory: 'Inventario y Recetas',
  shifts: 'Caja y Turnos (F4)',
  reports: 'Reportes y Métricas',
  users: 'Gestión de Empleados & Roles',
  settings: 'Ajustes y Personalización de Empresa',
};

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { currentUser, lockScreen } = useAuthStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isHome = currentView === 'home';

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Error attempting to exit fullscreen:', err);
      });
    }
  };

  return (
    <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 sm:px-4 text-slate-200 select-none shadow-sm z-30 sticky top-0 gap-3">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <BrandLink isHome={isHome} onNavigate={onNavigate} />
        <VenueSelector onNavigateSettings={() => onNavigate('settings')} />

        {!isHome && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-slate-200 cursor-pointer transition-colors"
            >
              Apps
            </button>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-white truncate max-w-[180px]">
              {VIEW_TITLES[currentView] || currentView}
            </span>
          </div>
        )}
      </div>

      {/* Center section: Quick Search */}
      <TopBarSearch
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        isHome={isHome}
        onNavigateHome={() => onNavigate('home')}
      />

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <ShiftStatusBadge onNavigateShifts={() => onNavigate('shifts')} />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Salir de Pantalla Completa' : 'Modo Quiosco Pantalla Completa'}
          className="size-8 text-slate-400 hover:text-white"
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-full select-none">
          <Circle className="size-2 fill-emerald-400 text-emerald-400 animate-pulse" />
          <span>En Línea</span>
        </div>

        {currentUser && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => lockScreen()}
            title="Bloquear terminal (Ctrl+L)"
            className="size-8 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
          >
            <Lock className="size-3.5" />
          </Button>
        )}

        <UserNav onNavigateSettings={() => onNavigate('settings')} />
      </div>
    </header>
  );
};
