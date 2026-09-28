import React from 'react';
import { Calendar, Search, RefreshCw, X, Clock, CheckCircle2, UserCheck, History, ListFilter } from 'lucide-react';
import { ReservationFilterStatus, ReservationTimeframe, ReservationMetrics } from '../types/reservations.types';
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
}

const TIMEFRAME_OPTIONS: { id: ReservationTimeframe; label: string }[] = [
  { id: 'all', label: 'Todas las fechas' },
  { id: 'upcoming', label: 'Próximas' },
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'week', label: '7 días' },
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
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* 1. Status Navigation Tabs (Primary Axis) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {/* Todas */}
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'confirmed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'seated'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'history'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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

        {/* Global Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onRefresh}
          title="Recargar datos"
          className="h-8 px-2.5 rounded-xl text-muted-foreground hover:text-foreground transition cursor-pointer gap-1.5 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* 2. Secondary Filtering Row: Timeframe, Exact Date, and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card/60 border border-border text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/60">
            {TIMEFRAME_OPTIONS.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => {
                  onDateChange(''); // Clear exact date to activate timeframe
                  onTimeframeChange(tf.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  !selectedDate && timeframe === tf.id
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Date Picker Input (Secondary / Explicit) */}
          <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-xl border border-border/60 text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-6 w-32 border-0 bg-transparent p-0 text-foreground cursor-pointer focus-visible:ring-0 text-xs font-medium"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => onDateChange('')}
                title="Limpiar fecha exacta"
                className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <Input
            type="text"
            placeholder="Buscar comensal o teléfono..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-8 pr-3 h-8 rounded-xl bg-muted/40 border-border/60 text-xs w-full"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchTermChange('')}
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
