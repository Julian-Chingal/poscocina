import React from 'react';
import { Calendar, Search, RefreshCw } from 'lucide-react';
import { ReservationFilterStatus } from '../types/reservations.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ReservationsFilterBarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  statusFilter: ReservationFilterStatus;
  onStatusFilterChange: (status: ReservationFilterStatus) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

const STATUS_OPTIONS: { id: ReservationFilterStatus; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'seated', label: 'Sentados' },
  { id: 'cancelled', label: 'Canceladas' },
];

export const ReservationsFilterBar: React.FC<ReservationsFilterBarProps> = ({
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
  loading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border mb-6 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-xl border border-border text-xs">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-7 border-0 bg-transparent p-0 text-foreground cursor-pointer focus-visible:ring-0"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex bg-muted/40 border border-border rounded-xl p-1 text-xs">
          {STATUS_OPTIONS.map((st) => (
            <Button
              key={st.id}
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onStatusFilterChange(st.id)}
              className={`px-3 py-1 h-7 rounded-lg capitalize font-medium transition cursor-pointer text-xs ${
                statusFilter === st.id
                  ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {st.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <Input
            type="text"
            placeholder="Buscar por cliente o mesa..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-9 pr-3 h-8 rounded-xl bg-muted/40 border-border text-xs w-52"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={onRefresh}
          title="Recargar"
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};
