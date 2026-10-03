import React from 'react';
import {
  CalendarDays,
  SearchX,
  Plus,
  FilterX,
  Sparkles,
  UtensilsCrossed,
  Info,
} from 'lucide-react';
import {
  Reservation,
  ReservationStatus,
  ReservationFilterStatus,
  TableItem,
} from '../types/reservations.types';
import { ReservationCard } from './ReservationCard';
import { ReservationsTimeline } from './ReservationsTimeline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ReservationsGridProps {
  loading: boolean;
  reservations: Reservation[];
  viewMode?: 'grid' | 'timeline';
  statusFilter?: ReservationFilterStatus;
  selectedDate?: string;
  searchTerm?: string;
  onClearFilters?: () => void;
  onOpenNewReservation?: () => void;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onSeatReservation: (reservation: Reservation) => void;
  onNavigateToTable?: (table: TableItem) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'pendientes',
  confirmed: 'confirmadas',
  seated: 'en mesa',
  history: 'en el histórico',
};

export const ReservationsGrid: React.FC<ReservationsGridProps> = ({
  loading,
  reservations,
  viewMode = 'grid',
  statusFilter = 'all',
  selectedDate,
  searchTerm = '',
  onClearFilters,
  onOpenNewReservation,
  onUpdateStatus,
  onSeatReservation,
  onNavigateToTable,
}) => {
  // Loading skeleton placeholder
  if (loading && reservations.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-card border border-border/80 space-y-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
            </div>
            <Skeleton className="h-10 rounded-xl" />
            <div className="pt-3 border-t border-border flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-xl" />
              <Skeleton className="h-8 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Enhanced Empty State
  if (reservations.length === 0) {
    const isSearching = Boolean(searchTerm.trim());
    const isStatusFiltered = statusFilter !== 'all';
    const isDateFiltered = Boolean(selectedDate);

    return (
      <div className="w-full min-w-0 py-12 px-6 sm:px-12 rounded-3xl bg-card/60 border border-dashed border-border/80 flex flex-col items-center justify-center text-center space-y-5">
        {/* Visual Icon Badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            {isSearching ? (
              <SearchX className="w-8 h-8" />
            ) : isStatusFiltered ? (
              <CalendarDays className="w-8 h-8" />
            ) : (
              <UtensilsCrossed className="w-8 h-8" />
            )}
          </div>
          <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-background border border-border shadow-xs text-primary">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Messaging */}
        <div className="max-w-md space-y-1.5">
          <h3 className="text-lg font-bold text-foreground">
            {isSearching
              ? `Sin resultados para "${searchTerm}"`
              : isStatusFiltered
              ? `No hay reservas ${STATUS_LABELS[statusFilter] || statusFilter}`
              : isDateFiltered
              ? `Sin reservas para la fecha seleccionada`
              : 'Agenda de reservas despejada'}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isSearching
              ? 'Verifica que el nombre o teléfono estén bien escritos, o limpia el término para ver todas.'
              : isStatusFiltered
              ? 'No encontramos reservas activas con este estado en el rango seleccionado.'
              : isDateFiltered
              ? 'No hay comensales agendados para este día. Puedes registrar una llamada o cita anticipada.'
              : 'No hay reservas registradas. Utiliza el botón para agendar la primera reserva del día.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          {onOpenNewReservation && (
            <Button
              type="button"
              onClick={onOpenNewReservation}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 h-9 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Reserva</span>
            </Button>
          )}

          {(isSearching || isStatusFiltered || isDateFiltered) && onClearFilters && (
            <Button
              variant="outline"
              type="button"
              onClick={onClearFilters}
              className="text-xs font-semibold px-4 py-2 h-9 rounded-xl border-border/80 hover:bg-muted transition cursor-pointer flex items-center gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Restablecer Filtros</span>
            </Button>
          )}
        </div>

        {/* Helpful hospitality host tip */}
        <div className="max-w-lg mt-4 p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-2.5 text-left text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-snug">
            <span className="font-semibold text-foreground">Consejo de anfitrión:</span> Asigna mesas desde la creación de la reserva para reservar aforo real en sala y coordinar con el plano del salón.
          </p>
        </div>
      </div>
    );
  }

  // Timeline View Mode
  if (viewMode === 'timeline') {
    return (
      <ReservationsTimeline
        reservations={reservations}
        onUpdateStatus={onUpdateStatus}
        onSeatReservation={onSeatReservation}
        onNavigateToTable={onNavigateToTable}
      />
    );
  }

  // Grid View Mode
  return (
    <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
      {reservations.map((res) => (
        <ReservationCard
          key={res.id}
          reservation={res}
          onUpdateStatus={onUpdateStatus}
          onSeatReservation={onSeatReservation}
          onNavigateToTable={onNavigateToTable}
        />
      ))}
    </div>
  );
};

export default ReservationsGrid;
