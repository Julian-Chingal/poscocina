import React, { useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useBrandingStore } from '../../stores/branding.store';
import { useShiftStore } from '../../stores/shift.store';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ShiftStatusBadgeProps {
  onNavigateShifts: () => void;
  className?: string;
}

export const ShiftStatusBadge: React.FC<ShiftStatusBadgeProps> = ({
  onNavigateShifts,
  className,
}) => {
  const { venueId } = useAuthStore();
  const isOpen = useShiftStore((s) => s.isOpen);
  const cashierName = useShiftStore((s) => s.cashierName);
  const fetchCurrentShift = useShiftStore((s) => s.fetchCurrentShift);
  const initSocket = useShiftStore((s) => s.initSocket);

  useEffect(() => {
    const activeVenue = venueId || useBrandingStore.getState().venueId;
    if (!activeVenue) return;

    fetchCurrentShift(activeVenue);
    const cleanupSocket = initSocket(activeVenue);
    const timer = setInterval(() => fetchCurrentShift(activeVenue), 15000);

    return () => {
      cleanupSocket();
      clearInterval(timer);
    };
  }, [venueId, fetchCurrentShift, initSocket]);

  return (
    <Button
      variant="ghost"
      onClick={onNavigateShifts}
      title={
        isOpen
          ? `Caja Abierta por ${cashierName || 'Cajero'} [F4]`
          : 'Caja Cerrada - Clic para abrir turno [F4]'
      }
      className={cn(
        'h-auto p-0 hover:bg-transparent hidden sm:inline-flex items-center transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full',
        className
      )}
    >
      <Badge
        variant={isOpen ? 'success' : 'warning'}
        className="gap-1.5 px-2.5 py-1 text-xs hover:brightness-110"
      >
        <Wallet className="size-3 shrink-0" />
        <span className="truncate max-w-[110px]">
          {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
        </span>
      </Badge>
    </Button>
  );
};
