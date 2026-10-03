import React, { useMemo } from 'react';
import { Sunrise, Sun, Sunset, Moon, Clock, Users } from 'lucide-react';
import { Reservation, ReservationStatus, TableItem } from '../types/reservations.types';
import { ReservationCard } from './ReservationCard';
import { getServiceShift, ServiceShift } from '../utils/reservation-formatters';

interface ReservationsTimelineProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onSeatReservation: (reservation: Reservation) => void;
  onNavigateToTable?: (table: TableItem) => void;
}

interface ShiftGroup {
  shift: ServiceShift;
  reservations: Reservation[];
  totalGuests: number;
}

export const ReservationsTimeline: React.FC<ReservationsTimelineProps> = ({
  reservations,
  onUpdateStatus,
  onSeatReservation,
  onNavigateToTable,
}) => {
  // Sort reservations chronologically
  const sortedReservations = useMemo(() => {
    return [...reservations].sort(
      (a, b) => new Date(a.reservationTime).getTime() - new Date(b.reservationTime).getTime()
    );
  }, [reservations]);

  // Group by service shift
  const shiftGroups = useMemo(() => {
    const map = new Map<string, ShiftGroup>();

    sortedReservations.forEach((res) => {
      const shift = getServiceShift(res.reservationTime);
      if (!map.has(shift.id)) {
        map.set(shift.id, {
          shift,
          reservations: [],
          totalGuests: 0,
        });
      }
      const entry = map.get(shift.id)!;
      entry.reservations.push(res);
      entry.totalGuests += res.guestCount;
    });

    return Array.from(map.values());
  }, [sortedReservations]);

  const renderShiftIcon = (iconName: ServiceShift['iconName']) => {
    switch (iconName) {
      case 'sunrise':
        return <Sunrise className="w-4 h-4" />;
      case 'sun':
        return <Sun className="w-4 h-4" />;
      case 'sunset':
        return <Sunset className="w-4 h-4" />;
      case 'moon':
        return <Moon className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-8">
      {shiftGroups.map(({ shift, reservations: shiftRes, totalGuests }) => (
        <section key={shift.id} className="space-y-4">
          {/* Shift Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border flex items-center justify-center ${shift.colorClass}`}>
                {renderShiftIcon(shift.iconName)}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {shift.label}
                </h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Clock className="w-3 h-3" />
                  {shift.range}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/60">
                {shiftRes.length} {shiftRes.length === 1 ? 'reserva' : 'reservas'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{totalGuests} comensales</span>
              </span>
            </div>
          </div>

          {/* Shift Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shiftRes.map((res) => (
              <ReservationCard
                key={res.id}
                reservation={res}
                onUpdateStatus={onUpdateStatus}
                onSeatReservation={onSeatReservation}
                onNavigateToTable={onNavigateToTable}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ReservationsTimeline;
