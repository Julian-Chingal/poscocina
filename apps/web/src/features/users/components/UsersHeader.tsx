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
    <div className="w-full min-w-0 space-y-4">
      {/* Top Header */}
      <div className="w-full min-w-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">Gestión de Empleados y Personal</h1>
              <p className="text-xs text-muted-foreground truncate">
                Administración de accesos, roles operativos (meseros, cajeros, cocina) y credenciales PIN
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onOpenCreate}
          className="py-3 px-5 h-auto rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Empleado</span>
        </Button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="w-full min-w-0 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex justify-between items-center animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{actionSuccess}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismissSuccess} className="h-6 w-6 text-emerald-600 dark:text-emerald-400 hover:text-foreground shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="w-full min-w-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-muted/40 border border-border p-1 rounded-2xl w-full sm:w-auto shrink-0 overflow-x-auto">
          <Button
            variant="ghost"
            onClick={() => onFilterChange('active')}
            className={`px-4 py-2 h-auto rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              filterStatus === 'active'
                ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Activos ({activeCount})
          </Button>
          <Button
            variant="ghost"
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 h-auto rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos ({totalCount})
          </Button>
          <Button
            variant="ghost"
            onClick={() => onFilterChange('inactive')}
            className={`px-4 py-2 h-auto rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              filterStatus === 'inactive'
                ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inactivos ({inactiveCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
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
