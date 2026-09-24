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
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReservationCardProps {
  reservation: Reservation;
  onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled' | 'no_show') => void;
  onSeatReservation: (reservation: Reservation) => void;
}

const renderStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="gap-1 text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
          <Clock className="w-3 h-3" /> Pendiente
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge variant="outline" className="gap-1 text-[11px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">
          <CheckCircle2 className="w-3 h-3" /> Confirmada
        </Badge>
      );
    case 'seated':
      return (
        <Badge variant="outline" className="gap-1 text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          <UserCheck className="w-3 h-3" /> Sentados
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="destructive" className="gap-1 text-[11px] font-semibold bg-destructive/15 text-destructive border-destructive/30">
          <XCircle className="w-3 h-3" /> Cancelada
        </Badge>
      );
    case 'no_show':
      return (
        <Badge variant="outline" className="gap-1 text-[11px] font-semibold bg-muted text-muted-foreground border-border">
          <AlertCircle className="w-3 h-3" /> No Asistió
        </Badge>
      );
  }
};

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onUpdateStatus,
  onSeatReservation,
}) => {
  const [showCancelAlert, setShowCancelAlert] = React.useState(false);

  const timeStr = new Date(reservation.reservationTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleConfirmCancel = () => {
    onUpdateStatus(reservation.id, 'cancelled');
    setShowCancelAlert(false);
  };

  return (
    <Card className="w-full min-w-0 h-full p-5 hover:border-border/80 transition flex flex-col justify-between shadow-sm">
      <div className="w-full min-w-0">
        <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-foreground text-base leading-tight truncate">
              {reservation.customerName}
            </h4>
            {reservation.customer?.loyaltyPoints ? (
              <span className="text-[10px] text-primary font-semibold">
                💎 {reservation.customer.loyaltyPoints} pts de fidelidad
              </span>
            ) : null}
          </div>
          {renderStatusBadge(reservation.status)}
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-primary">{timeStr} hrs</span>
            <span>•</span>
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{reservation.guestCount} personas</span>
          </div>

          {reservation.table && (
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-semibold">{reservation.table.label}</span>
            </div>
          )}

          {reservation.customerPhone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>{reservation.customerPhone}</span>
            </div>
          )}

          {reservation.notes && (
            <div className="p-2 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground italic mt-2">
              "{reservation.notes}"
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <CardFooter className="p-0 pt-3 border-t border-border flex items-center justify-between gap-2 mt-0">
        {reservation.status === 'pending' && (
          <Button
            size="sm"
            type="button"
            onClick={() => onUpdateStatus(reservation.id, 'confirmed')}
            className="flex-1 py-1.5 px-3 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
          </Button>
        )}

        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
          <Button
            size="sm"
            type="button"
            onClick={() => onSeatReservation(reservation)}
            className="flex-1 py-1.5 px-3 h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" /> Sentar Mesa
          </Button>
        )}

        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setShowCancelAlert(true)}
            title="Cancelar reserva"
            className="h-8 w-8 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive text-xs transition cursor-pointer p-0"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent className="max-w-sm text-center sm:text-center">
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-base font-bold">
              ¿Cancelar Reserva?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Estás seguro de cancelar la reserva a nombre de <span className="text-foreground font-semibold">"{reservation.customerName}"</span> ({reservation.guestCount} personas)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-4 gap-2">
            <AlertDialogCancel onClick={() => setShowCancelAlert(false)}>
              No, volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmCancel();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
