import React from 'react';
import { Calendar } from 'lucide-react';
import { Reservation } from '../types/reservations.types';
import { ReservationCard } from './ReservationCard';

interface ReservationsGridProps {
  loading: boolean;
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => void;
  onSeatReservation: (reservation: Reservation) => void;
}

export const ReservationsGrid: React.FC<ReservationsGridProps> = ({
  loading,
  reservations,
  onUpdateStatus,
  onSeatReservation,
}) => {
  if (loading && reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Cargando reservas...
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/20">
        <Calendar className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
        <p className="font-semibold text-foreground">No hay reservas para los filtros seleccionados.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Usa el botón "Nueva Reserva" para agendar una reserva anticipada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reservations.map((res) => (
        <ReservationCard
          key={res.id}
          reservation={res}
          onUpdateStatus={onUpdateStatus}
          onSeatReservation={onSeatReservation}
        />
      ))}
    </div>
  );
};
