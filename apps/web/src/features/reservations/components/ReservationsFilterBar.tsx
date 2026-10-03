import React from 'react';
import {
  Calendar,
  Search,
  RefreshCw,
  X,
  Clock,
  CheckCircle2,
  UserCheck,
  History,
  ListFilter,
  FilterX,
} from 'lucide-react';
import {
  ReservationFilterStatus,
  ReservationTimeframe,
  ReservationMetrics,
} from '../types/reservations.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReservationsFilterBarProps {
  statusFilter: ReservationFilterStatus;
  onStatusFilterChange: (status: ReservationFilterStatus) => void;
  timeframe: ReservationTimeframe;
  onTimeframeChange: (tf: ReservationTimeframe) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  kpis: ReservationMetrics;
  loading: boolean;
  onRefresh: () => void;
  onClearFilters?: () => void;
}

const TIMEFRAME_OPTIONS: { id: ReservationTimeframe; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'week', label: '7 días' },
  { id: 'upcoming', label: 'Próximas' },
  { id: 'all', label: 'Todas las fechas' },
];

export const ReservationsFilterBar: React.FC<ReservationsFilterBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  timeframe,
  onTimeframeChange,
  selectedDate,
  onDateChange,
  searchTerm,
  onSearchTermChange,
  kpis,
  loading,
  onRefresh,
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(
    statusFilter !== 'all' ||
      timeframe !== 'all' ||
      selectedDate ||
      searchTerm.trim().length > 0
  );

  return (
    <div className="rounded-2xl bg-card border border-border shadow-xs p-3 space-y-3 mb-6">
      {/* 1. Primary Status Tabs + Utility Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Status navigation tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Todas */}
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Todas</span>
            <Badge
              variant={statusFilter === 'all' ? 'secondary' : 'outline'}
              className="text-[11px] px-1.5 py-0 h-4 min-w-4 text-center font-bold"
            >
              {kpis.totalActive}
            </Badge>
          </button>

          {/* Pendientes */}
          <button
            type="button"
            onClick={() => onStatusFilterChange('pending')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendientes</span>
            <Badge
              variant="secondary"
              className={`text-[11px] px-1.5 py-0 h-4 min-w-4 text-center font-bold ${
                statusFilter === 'pending'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
              }`}
            >
              {kpis.pendingCount}
            </Badge>
          </button>

          {/* Confirmadas */}
          <button
            type="button"
            onClick={() => onStatusFilterChange('confirmed')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === 'confirmed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmadas</span>
            <Badge
              variant="secondary"
              className={`text-[11px] px-1.5 py-0 h-4 min-w-4 text-center font-bold ${
                statusFilter === 'confirmed'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
              }`}
            >
              {kpis.confirmedCount}
            </Badge>
          </button>

          {/* En Mesa */}
          <button
            type="button"
            onClick={() => onStatusFilterChange('seated')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === 'seated'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>En Mesa</span>
            <Badge
              variant="secondary"
              className={`text-[11px] px-1.5 py-0 h-4 min-w-4 text-center font-bold ${
                statusFilter === 'seated'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {kpis.seatedCount}
            </Badge>
          </button>

          {/* Histórico */}
          <button
            type="button"
            onClick={() => onStatusFilterChange('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === 'history'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico</span>
            <Badge
              variant="outline"
              className={`text-[11px] px-1.5 py-0 h-4 min-w-4 text-center font-bold ${
                statusFilter === 'history'
                  ? 'bg-white/20 text-white border-transparent'
                  : 'text-muted-foreground'
              }`}
            >
              {kpis.cancelledCount + kpis.noShowCount}
            </Badge>
          </button>
        </div>

        {/* Global Toolbar Actions: Clear filters & Refresh */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClearFilters}
              className="h-8 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onRefresh}
            title="Recargar datos de reservas"
            className="h-8 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground border-border/80 transition cursor-pointer gap-1.5 shadow-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* 2. Secondary Filter Row: Timeframe, Exact Date, and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick timeframe selector */}
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/70">
            {TIMEFRAME_OPTIONS.map((tf) => {
              const isActive = !selectedDate && timeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => {
                    onDateChange('');
                    onTimeframeChange(tf.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-xl border border-border/70 text-xs focus-within:ring-1 focus-within:ring-primary/40">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-6 w-32 border-0 bg-transparent p-0 text-foreground cursor-pointer focus-visible:ring-0 text-xs font-medium shadow-none"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => onDateChange('')}
                title="Limpiar fecha seleccionada"
                className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search input with clear button */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar comensal, teléfono o nota..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-8.5 pr-8 h-8 rounded-xl bg-muted/40 border-border/70 text-xs w-full focus-visible:ring-primary/40 shadow-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchTermChange('')}
              title="Borrar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsFilterBar;
