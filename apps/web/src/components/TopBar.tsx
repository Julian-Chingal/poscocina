import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Search,
  Settings,
  UtensilsCrossed,
  Circle,
  Lock,
  Building2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Wallet,
  Check,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';

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
  const { currentUser, lockScreen, venueId, setVenueId } = useAuthStore();
  const {
    name: companyName,
    settings,
    venues,
    loadAllVenues,
    switchVenue,
  } = useBrandingStore();

  const [isVenueMenuOpen, setIsVenueMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shiftStatus, setShiftStatus] = useState<{
    isOpen: boolean;
    cashierName?: string;
  }>({ isOpen: false });

  const venueMenuRef = useRef<HTMLDivElement>(null);
  const isHome = currentView === 'home';

  // Load venues on mount
  useEffect(() => {
    loadAllVenues();
  }, [loadAllVenues]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close venue dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (venueMenuRef.current && !venueMenuRef.current.contains(e.target as Node)) {
        setIsVenueMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check shift status for current venue
  useEffect(() => {
    const activeVenue = venueId || useBrandingStore.getState().venueId;
    if (!activeVenue) return;

    const checkShift = async () => {
      try {
        const res = await fetch(`/api/cash-shifts/current/${activeVenue}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.shift && data.shift.status === 'open') {
            setShiftStatus({
              isOpen: true,
              cashierName: data.shift.openedByName || 'Cajero',
            });
            return;
          }
        }
        setShiftStatus({ isOpen: false });
      } catch (err) {
        setShiftStatus({ isOpen: false });
      }
    };

    checkShift();
    const timer = setInterval(checkShift, 20000);
    return () => clearInterval(timer);
  }, [venueId]);

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

  const handleSelectVenue = async (targetVenueId: string) => {
    setIsVenueMenuOpen(false);
    if (targetVenueId === venueId) return;
    setVenueId(targetVenueId);
    await switchVenue(targetVenueId);
  };

  const currentVenueName = venues.find((v) => v.id === venueId)?.name || companyName || 'Sede Principal';

  return (
    <>
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-slate-200 select-none shadow-sm z-30 sticky top-0">
        {/* Left section: App Switcher + Company Branding + Venue Selector + Breadcrumbs */}
        <div className="flex items-center space-x-3">
          {/* App Launcher Switcher */}
          <button
            onClick={() => onNavigate(isHome ? 'salon' : 'home')}
            title={isHome ? 'Abrir última app (Esc)' : 'Menú de Aplicaciones [Esc]'}
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              isHome
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {/* Company Logo and Name */}
          <div className="flex items-center space-x-2 pl-1">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-6 h-6 rounded object-contain bg-white/10 p-0.5"
              />
            ) : (
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white shadow"
                style={{ backgroundColor: settings.primaryColor || '#f97316' }}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
              </div>
            )}

            <span className="font-semibold text-sm text-white tracking-tight hidden sm:inline">
              {settings.companyName || companyName}
            </span>
          </div>

          {/* Multi-Venue Selector Dropdown */}
          <div className="relative" ref={venueMenuRef}>
            <button
              onClick={() => setIsVenueMenuOpen((prev) => !prev)}
              title="Cambiar de Sede / Sucursal"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-medium max-w-[120px] truncate">{currentVenueName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isVenueMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>Sucursales</span>
                  <span className="text-orange-400 font-bold">{venues.length}</span>
                </div>
                {venues.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">Cargando sedes...</div>
                ) : (
                  venues.map((v) => {
                    const isSelected = v.id === venueId;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleSelectVenue(v.id)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/10 text-orange-400 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-orange-400' : 'text-slate-500'}`} />
                          <div className="truncate">
                            <div className="truncate">{v.name}</div>
                            {v.address && <div className="text-[10px] text-slate-500 truncate">{v.address}</div>}
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })
                )}
                {currentUser?.roleName === 'super_admin' && (
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsVenueMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full px-3 py-1.5 text-left text-[11px] text-orange-400 hover:bg-slate-800 flex items-center space-x-1.5 cursor-pointer font-medium"
                    >
                      <span>+ Gestionar / Añadir Sede</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Breadcrumbs */}
          {!isHome && (
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 border-l border-slate-700 pl-3">
              <span
                onClick={() => onNavigate('home')}
                className="hover:text-slate-200 cursor-pointer"
              >
                Apps
              </span>
              <span>/</span>
              <span className="font-medium text-white">{VIEW_TITLES[currentView] || currentView}</span>
            </div>
          )}
        </div>

        {/* Center section: Quick Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar app o comando... (F1 Mesas, F2 POS, F3 KDS, F4 Caja)"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (!isHome && e.target.value.trim().length > 0) {
                  onNavigate('home');
                }
              }}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Right section: Shift Badge, Kiosk Toggle, Status indicator, Settings, User avatar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live Cash Shift Indicator Badge */}
          <button
            onClick={() => onNavigate('shifts')}
            title={shiftStatus.isOpen ? `Caja Abierta por ${shiftStatus.cashierName} [F4]` : 'Caja Cerrada - Clic para abrir turno [F4]'}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
              shiftStatus.isOpen
                ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-amber-950/40 border-amber-800/40 text-amber-400 hover:bg-amber-900/40'
            }`}
          >
            <Wallet className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[100px]">
              {shiftStatus.isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
            </span>
          </button>

          {/* Fullscreen Kiosk Mode Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de Modo Pantalla Completa' : 'Modo Quiosco Pantalla Completa'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Real-time connection badge */}
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" />
            <span className="hidden lg:inline">En Línea</span>
          </div>

          {/* Settings button */}
          <button
            onClick={() => onNavigate('settings')}
            title="Ajustes de Marca y Configuración"
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${
              currentView === 'settings' ? 'text-orange-400 bg-slate-800' : ''
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User profile with Quick PIN Switch & Lock */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => lockScreen()}
                title="Cambiar usuario o verificar PIN (Ctrl+L)"
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-800 transition text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-bold uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <span className="font-medium text-slate-200 block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 block">{currentUser.roleLabel || currentUser.roleName}</span>
                </div>
              </button>

              <button
                onClick={() => lockScreen()}
                title="Bloquear pantalla (Ctrl+L)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => lockScreen()}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 cursor-pointer"
            >
              Identificarse
            </button>
          )}
        </div>
      </header>
    </>
  );
};
