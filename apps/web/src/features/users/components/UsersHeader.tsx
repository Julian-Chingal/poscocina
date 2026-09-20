import React from 'react';
import { Users, UserPlus, Search, CheckCircle, X } from 'lucide-react';
import { UserFilterStatus } from '../types/users.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UsersHeaderProps {
  onOpenCreate: () => void;
  actionSuccess: string | null;
  onDismissSuccess: () => void;
  filterStatus: UserFilterStatus;
  onFilterChange: (status: UserFilterStatus) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCount: number;
  totalCount: number;
  inactiveCount: number;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  onOpenCreate,
  actionSuccess,
  onDismissSuccess,
  filterStatus,
  onFilterChange,
  searchQuery,
  onSearchChange,
  activeCount,
  totalCount,
  inactiveCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Gestión de Empleados y Personal</h1>
              <p className="text-xs text-slate-400">
                Administración de accesos, roles operativos (meseros, cajeros, cocina) y credenciales PIN
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onOpenCreate}
          className="py-3 px-5 h-auto rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Empleado</span>
        </Button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex justify-between items-center animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismissSuccess} className="h-6 w-6 text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-2xl w-full sm:w-auto">
          <Button
            variant="ghost"
            onClick={() => onFilterChange('active')}
            className={`px-4 py-2 h-auto rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-amber-500 text-slate-950 shadow hover:bg-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activos ({activeCount})
          </Button>
          <Button
            variant="ghost"
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 h-auto rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-amber-500 text-slate-950 shadow hover:bg-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({totalCount})
          </Button>
          <Button
            variant="ghost"
            onClick={() => onFilterChange('inactive')}
            className={`px-4 py-2 h-auto rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'inactive'
                ? 'bg-amber-500 text-slate-950 shadow hover:bg-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inactivos ({inactiveCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
          <Input
            type="text"
            placeholder="Buscar por nombre, rol o email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-2xl text-xs"
          />
        </div>
      </div>
    </div>
  );
};
