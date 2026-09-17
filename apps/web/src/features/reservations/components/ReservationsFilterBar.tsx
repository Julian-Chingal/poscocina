import React from 'react';
import { Calendar, Search, RefreshCw } from 'lucide-react';
import { ReservationFilterStatus } from '../types/reservations.types';

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
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st.id}
              onClick={() => onStatusFilterChange(st.id)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-pink-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente o mesa..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 w-52"
          />
        </div>
        <button
          onClick={onRefresh}
          title="Recargar"
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
