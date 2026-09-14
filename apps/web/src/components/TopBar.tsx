import React from 'react';
import {
  LayoutGrid,
  Search,
  Settings,
  UtensilsCrossed,
  Circle,
  Lock,
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
  salon: 'Salón y Mesas',
  pos: 'Punto de Venta',
  kds: 'Cocina KDS',
  catalog: 'Menú y Catálogo',
  inventory: 'Inventario y Recetas',
  shifts: 'Caja y Turnos',
  reports: 'Reportes y Métricas',
  settings: 'Ajustes y Personalización de Empresa',
};

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { currentUser, lockScreen } = useAuthStore();
  const { name: companyName, settings } = useBrandingStore();

  const isHome = currentView === 'home';

  return (
    <>
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-slate-200 select-none shadow-sm z-30 sticky top-0">
        {/* Left section: App Switcher + Company Branding + Breadcrumbs */}
        <div className="flex items-center space-x-3">
          {/* App Launcher Switcher */}
          <button
            onClick={() => onNavigate(isHome ? 'salon' : 'home')}
            title={isHome ? 'Abrir última app' : 'Menú de Aplicaciones (Inicio)'}
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

          {/* Breadcrumbs */}
          {!isHome && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 border-l border-slate-700 pl-3">
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
              placeholder="Buscar aplicación o comando (ej. KDS, Mesas, Carta)..."
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

        {/* Right section: Status indicator, Settings, User avatar */}
        <div className="flex items-center space-x-3">
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
                title="Cambiar usuario o verificar PIN"
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
                title="Bloquear pantalla"
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
