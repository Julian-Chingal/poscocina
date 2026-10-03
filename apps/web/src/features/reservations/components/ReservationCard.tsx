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
  MessageCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Reservation, ReservationStatus, TableItem } from '../types/reservations.types';
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
import {
  formatReservationTime,
  buildWhatsAppUrl,
} from '../utils/reservation-formatters';

interface ReservationCardProps {
  reservation: Reservation;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onSeatReservation: (reservation: Reservation) => void;
  onNavigateToTable?: (table: TableItem) => void;
}

const renderStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
        >
          <Clock className="w-3 h-3" />
          <span>Pendiente</span>
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Confirmada</span>
        </Badge>
      );
    case 'seated':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
        >
          <UserCheck className="w-3 h-3" />
          <span>En Mesa</span>
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-destructive/15 text-destructive border-destructive/30"
        >
          <XCircle className="w-3 h-3" />
          <span>Cancelada</span>
        </Badge>
      );
    case 'no_show':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-muted text-muted-foreground border-border"
        >
          <AlertCircle className="w-3 h-3" />
          <span>No Asistió</span>
        </Badge>
      );
  }
};

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onUpdateStatus,
  onSeatReservation,
  onNavigateToTable,
}) => {
  const [showCancelAlert, setShowCancelAlert] = React.useState(false);
  const [showNoShowAlert, setShowNoShowAlert] = React.useState(false);

  const { timeStr, relative } = formatReservationTime(reservation.reservationTime);
  const waUrl = buildWhatsAppUrl(reservation.customerPhone, reservation.customerName, timeStr);

  const handleConfirmCancel = () => {
    onUpdateStatus(reservation.id, 'cancelled');
    setShowCancelAlert(false);
  };

  return (
    <Card className="w-full min-w-0 h-full p-4 sm:p-5 rounded-2xl bg-card border-border/80 hover:border-border hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Body */}
      <div className="w-full min-w-0 space-y-3">
        {/* Customer Name & Status Header */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-foreground text-base leading-snug truncate">
              {reservation.customerName}
            </h4>

            {reservation.customer?.loyaltyPoints ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-0.5">
                <Sparkles className="w-3 h-3" />
                <span>Cliente VIP ({reservation.customer.loyaltyPoints} pts)</span>
              </span>
            ) : null}
          </div>

          <div className="shrink-0">{renderStatusBadge(reservation.status)}</div>
        </div>

        {/* Schedule & Seating Meta Chips */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Time & Relative Timing */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/60">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <div className="min-w-0 truncate">
              <span className="font-bold text-foreground">{timeStr} hrs</span>
              {relative && (
                <span className="text-[11px] text-muted-foreground ml-1 font-medium">
                  ({relative})
                </span>
              )}
            </div>
          </div>

          {/* Guest Count */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/60">
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="font-semibold text-foreground truncate">
              {reservation.guestCount} {reservation.guestCount === 1 ? 'persona' : 'personas'}
            </span>
          </div>
        </div>

        {/* Table Assignment & Phone Contact */}
        <div className="space-y-2 pt-1 text-xs">
          {/* Table */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/20 border border-border/50">
            <div className="flex items-center gap-2 min-w-0">
              <Utensils className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {reservation.table ? (
                <span className="font-semibold text-foreground truncate">
                  {reservation.table.label}{' '}
                  <span className="text-[11px] text-muted-foreground font-normal">
                    (Cap: {reservation.table.capacity}p)
                  </span>
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-medium text-[11px]">
                  Sin mesa asignada
                </span>
              )}
            </div>

            {reservation.status === 'seated' && reservation.table && onNavigateToTable && (
              <button
                type="button"
                onClick={() => onNavigateToTable(reservation.table!)}
                title="Ver mesa en el plano de salón"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <span>Ver plano</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Customer Contact (Phone / WhatsApp) */}
          {reservation.customerPhone && (
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-muted-foreground truncate">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono text-xs">{reservation.customerPhone}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* 1-click WhatsApp */}
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Enviar mensaje de WhatsApp al comensal"
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* 1-click Call */}
                <a
                  href={`tel:${reservation.customerPhone}`}
                  title="Llamar al comensal"
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  <Phone className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Notes / Special Occasion banner */}
          {reservation.notes && (
            <div className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-semibold block text-[11px] text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">
                Nota / Ocasión:
              </span>
              <p className="italic text-[11px] leading-relaxed">
                "{reservation.notes}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <CardFooter className="p-0 pt-4 mt-4 border-t border-border/80 flex items-center justify-between gap-2 flex-wrap">
        {/* Status: Pending */}
        {reservation.status === 'pending' && (
          <div className="flex items-center gap-2 w-full">
            <Button
              size="sm"
              type="button"
              onClick={() => onUpdateStatus(reservation.id, 'confirmed')}
              className="flex-1 py-1.5 px-3 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmar</span>
            </Button>

            <Button
              size="sm"
              type="button"
              onClick={() => onSeatReservation(reservation)}
              className="flex-1 py-1.5 px-3 h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sentar Mesa</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => setShowCancelAlert(true)}
              title="Cancelar reserva"
              className="h-8 w-8 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0 p-0"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Status: Confirmed */}
        {reservation.status === 'confirmed' && (
          <div className="flex items-center gap-2 w-full">
            <Button
              size="sm"
              type="button"
              onClick={() => onSeatReservation(reservation)}
              className="flex-1 py-1.5 px-3 h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sentar en Mesa</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowNoShowAlert(true)}
              title="Marcar como No Asistió"
              className="h-8 px-2.5 rounded-xl text-muted-foreground hover:text-foreground text-xs transition cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline ml-1">No Asistió</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => setShowCancelAlert(true)}
              title="Cancelar reserva"
              className="h-8 w-8 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0 p-0"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Status: Seated */}
        {reservation.status === 'seated' && (
          <div className="w-full flex items-center justify-between gap-2 py-1 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Comensales en mesa (Servicio activo)</span>
            </div>
            {reservation.table && onNavigateToTable && (
              <button
                type="button"
                onClick={() => onNavigateToTable(reservation.table!)}
                className="text-[11px] text-emerald-800 dark:text-emerald-300 underline font-bold cursor-pointer"
              >
                Mesa {reservation.table.label}
              </button>
            )}
          </div>
        )}

        {/* Status: Cancelled or No Show */}
        {(reservation.status === 'cancelled' || reservation.status === 'no_show') && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onUpdateStatus(reservation.id, 'confirmed')}
            className="w-full h-8 rounded-xl text-xs font-semibold text-primary hover:text-primary transition cursor-pointer flex items-center justify-center gap-1.5 border-primary/30 hover:bg-primary/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reactivar Reserva</span>
          </Button>
        )}
      </CardFooter>

      {/* Cancel Alert Dialog */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent className="max-w-sm text-center sm:text-center rounded-2xl">
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-base font-bold text-foreground">
              ¿Cancelar Reserva?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              ¿Confirmas cancelar la reserva para{' '}
              <span className="text-foreground font-semibold">"{reservation.customerName}"</span>{' '}
              ({reservation.guestCount} comensales)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-4 gap-2">
            <AlertDialogCancel onClick={() => setShowCancelAlert(false)} className="rounded-xl text-xs">
              No, volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmCancel();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl text-xs"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Show Alert Dialog */}
      <AlertDialog open={showNoShowAlert} onOpenChange={setShowNoShowAlert}>
        <AlertDialogContent className="max-w-sm text-center sm:text-center rounded-2xl">
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-base font-bold text-foreground">
              ¿Marcar como "No Asistió"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Se registrará que{' '}
              <span className="text-foreground font-semibold">"{reservation.customerName}"</span>{' '}
              no se presentó a la hora programada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-4 gap-2">
            <AlertDialogCancel onClick={() => setShowNoShowAlert(false)} className="rounded-xl text-xs">
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onUpdateStatus(reservation.id, 'no_show');
                setShowNoShowAlert(false);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs"
            >
              Confirmar No Asistió
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ReservationCard;
