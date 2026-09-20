import React, { useState, useEffect } from 'react';
import { Circle, Lock, Maximize2, Minimize2 } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { BrandLink } from './navigation/BrandLink';
import { VenueSelector } from './navigation/VenueSelector';
import { ShiftStatusBadge } from './navigation/ShiftStatusBadge';
import { UserNav } from './navigation/UserNav';
import { TopBarSearch } from './navigation/TopBarSearch';
import { ThemeToggle } from './navigation/ThemeToggle';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
    <header className="h-12 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-3 sm:px-4 text-foreground select-none shadow-xs z-30 sticky top-0 gap-3 transition-colors">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <BrandLink isHome={isHome} onNavigate={onNavigate} />
        <VenueSelector onNavigateSettings={() => onNavigate('settings')} />

        {!isHome && (
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border-l border-border pl-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer transition-colors"
            >
              Apps
            </Button>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-semibold text-foreground truncate max-w-[180px]">
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
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <ShiftStatusBadge onNavigateShifts={() => onNavigate('shifts')} />

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Salir de Pantalla Completa' : 'Modo Quiosco Pantalla Completa'}
          className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>

        <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 border-emerald-500/20 px-2 py-1 select-none">
          <Circle className="size-2 fill-emerald-500 text-emerald-500 animate-pulse" />
          <span>En Línea</span>
        </Badge>

        {currentUser && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => lockScreen()}
            title="Bloquear terminal (Ctrl+L)"
            className="size-8 text-muted-foreground hover:text-amber-500 hover:bg-muted cursor-pointer"
          >
            <Lock className="size-3.5" />
          </Button>
        )}

        <UserNav onNavigateSettings={() => onNavigate('settings')} />
      </div>
    </header>
  );
};

