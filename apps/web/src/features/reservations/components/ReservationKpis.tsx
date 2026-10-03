import React from 'react';
import { Users, Clock, CheckCircle2, UserCheck } from 'lucide-react';
import { ReservationFilterStatus } from '../types/reservations.types';

interface ReservationKpisProps {
  pendingCount: number;
  confirmedCount: number;
  seatedCount: number;
  totalGuests: number;
  activeStatus?: ReservationFilterStatus;
  onSelectStatus?: (status: ReservationFilterStatus) => void;
}

export const ReservationKpis: React.FC<ReservationKpisProps> = ({
  pendingCount,
  confirmedCount,
  seatedCount,
  totalGuests,
  activeStatus,
  onSelectStatus,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* 1. Total Comensales */}
      <button
        type="button"
        onClick={() => onSelectStatus?.('all')}
        className={`group p-4 rounded-2xl bg-card border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
          activeStatus === 'all'
            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
            : 'border-border/80 hover:border-border'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            Comensales
          </span>
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black text-foreground tracking-tight">
            {totalGuests}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Aforo total esperado
          </p>
        </div>
      </button>

      {/* 2. Pendientes */}
      <button
        type="button"
        onClick={() => onSelectStatus?.('pending')}
        className={`group p-4 rounded-2xl bg-card border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
          activeStatus === 'pending'
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
            : 'border-border/80 hover:border-amber-500/40'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Pendientes
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight flex items-center gap-2">
            <span>{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                Por revisar
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {pendingCount === 1 ? '1 reserva por contactar' : `${pendingCount} reservas por contactar`}
          </p>
        </div>
      </button>

      {/* 3. Confirmadas */}
      <button
        type="button"
        onClick={() => onSelectStatus?.('confirmed')}
        className={`group p-4 rounded-2xl bg-card border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
          activeStatus === 'confirmed'
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5'
            : 'border-border/80 hover:border-blue-500/40'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            Confirmadas
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            {confirmedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Listas para sentar en mesa
          </p>
        </div>
      </button>

      {/* 4. En Mesa (Sentados) */}
      <button
        type="button"
        onClick={() => onSelectStatus?.('seated')}
        className={`group p-4 rounded-2xl bg-card border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
          activeStatus === 'seated'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
            : 'border-border/80 hover:border-emerald-500/40'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            En Mesa (Sentados)
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {seatedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Comensales activos en salón
          </p>
        </div>
      </button>
    </div>
  );
};

export default ReservationKpis;
