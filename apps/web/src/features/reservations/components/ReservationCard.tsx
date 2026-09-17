import React from 'react';
import {
  Clock,
  Users,
  Utensils,
  Phone,
  CheckCircle2,
  UserCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../types/reservations.types';

interface ReservationCardProps {
  reservation: Reservation;
  onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => void;
  onSeatReservation: (reservation: Reservation) => void;
}

const renderStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3" /> Pendiente
        </span>
      );
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <CheckCircle2 className="w-3 h-3" /> Confirmada
        </span>
      );
    case 'seated':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <UserCheck className="w-3 h-3" /> Sentados
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <XCircle className="w-3 h-3" /> Cancelada
        </span>
      );
    case 'no_show':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
          <AlertCircle className="w-3 h-3" /> No Asistió
        </span>
      );
  }
};

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onUpdateStatus,
  onSeatReservation,
}) => {
  const timeStr = new Date(reservation.reservationTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="font-bold text-white text-base leading-tight">
              {reservation.customerName}
            </h4>
            {reservation.customer?.loyaltyPoints ? (
              <span className="text-[10px] text-pink-400 font-semibold">
                💎 {reservation.customer.loyaltyPoints} pts de fidelidad
              </span>
            ) : null}
          </div>
          {renderStatusBadge(reservation.status)}
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-pink-300">{timeStr} hrs</span>
            <span className="text-slate-500">•</span>
            <Users className="w-4 h-4 text-slate-400" />
            <span>{reservation.guestCount} personas</span>
          </div>

          {reservation.table && (
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-slate-400" />
              <span className="text-slate-200 font-semibold">{reservation.table.label}</span>
            </div>
          )}

          {reservation.customerPhone && (
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5" />
              <span>{reservation.customerPhone}</span>
            </div>
          )}

          {reservation.notes && (
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 italic mt-2">
              "{reservation.notes}"
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {reservation.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(reservation.id, 'confirmed')}
            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
          </button>
        )}

        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
          <button
            onClick={() => onSeatReservation(reservation)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" /> Sentar Mesa
          </button>
        )}

        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
          <button
            onClick={() => onUpdateStatus(reservation.id, 'cancelled')}
            title="Cancelar reserva"
            className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs transition cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
