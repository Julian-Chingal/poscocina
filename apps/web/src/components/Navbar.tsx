import React from 'react';
import { UtensilsCrossed, LayoutGrid, MonitorPlay, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

interface NavbarProps {
  currentView: 'salon' | 'pos' | 'kds';
  onSelectView: (view: 'salon' | 'pos' | 'kds') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onSelectView }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-orange-600 p-2 rounded-lg text-white shadow">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">poscocina</h1>
          <p className="text-xs text-slate-400">POS & KDS Gastronómico</p>
        </div>
      </div>

      <nav className="flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/60">
        <button
          onClick={() => onSelectView('salon')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentView === 'salon'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Salón / Mesas</span>
        </button>

        <button
          onClick={() => onSelectView('pos')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentView === 'pos'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Comandero / Caja</span>
        </button>

        <button
          onClick={() => onSelectView('kds')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentView === 'kds'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <MonitorPlay className="w-4 h-4" />
          <span>KDS Cocina</span>
        </button>
      </nav>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <div className="font-semibold text-slate-200">{user.name}</div>
              <div className="text-slate-400 uppercase tracking-wider text-[10px]">{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="text-xs text-rose-400 hover:text-rose-300 ml-2 font-medium"
            >
              Salir
            </button>
          </div>
        ) : (
          <div className="text-xs text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded border border-amber-800/50">
            Modo Demostración / Sin sesión
          </div>
        )}
      </div>
    </header>
  );
};
