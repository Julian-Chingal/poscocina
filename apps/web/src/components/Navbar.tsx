import React from 'react';
import {
  UtensilsCrossed,
  LayoutGrid,
  MonitorPlay,
  ShoppingBag,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentView: 'salon' | 'pos' | 'kds';
  onSelectView: (view: 'salon' | 'pos' | 'kds') => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  className,
}) => {
  const { currentUser, logout, lockScreen } = useAuthStore();

  const navItems = [
    { id: 'salon' as const, label: 'Salón / Mesas', icon: LayoutGrid },
    { id: 'pos' as const, label: 'Comandero / Caja', icon: ShoppingBag },
    { id: 'kds' as const, label: 'KDS Cocina', icon: MonitorPlay },
  ];

  return (
    <header
      className={cn(
        'bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-md select-none gap-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="bg-orange-600 p-2 rounded-xl text-white shadow">
          <UtensilsCrossed className="size-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight">
            poscocina
          </h1>
          <p className="text-[11px] text-slate-400">POS & KDS Gastronómico</p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSelectView(item.id)}
              className={cn(
                'gap-2 px-3',
                !isActive && 'text-slate-400 hover:text-white'
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex items-center gap-3 bg-slate-800/60 pl-2 pr-3 py-1 rounded-xl border border-slate-700/60">
            <Avatar size="sm" className="size-6 border border-emerald-500/40">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <div className="font-semibold text-slate-200 leading-tight">
                {currentUser.name}
              </div>
              <Badge
                variant="outline"
                className="text-[9px] py-0 px-1 border-slate-700 text-emerald-400"
              >
                <ShieldCheck className="size-2.5" />
                <span>{currentUser.roleLabel || currentUser.roleName}</span>
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Cerrar sesión"
              className="size-7 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => lockScreen()}
            className="text-amber-400 border-amber-800/50 bg-amber-950/20"
          >
            Modo Demostración / Sin sesión
          </Button>
        )}
      </div>
    </header>
  );
};
