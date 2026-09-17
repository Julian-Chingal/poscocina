import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useBrandingStore } from '../../stores/branding.store';
import { Badge } from '../ui/badge';
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
  const [shiftStatus, setShiftStatus] = useState<{
    isOpen: boolean;
    cashierName?: string;
  }>({ isOpen: false });

  useEffect(() => {
    const activeVenue = venueId || useBrandingStore.getState().venueId;
    if (!activeVenue) return;

    const checkShift = async () => {
      try {
        const res = await fetch(`/api/cash-shifts/current/${activeVenue}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.shift && data.shift.status === 'open') {
            setShiftStatus({
              isOpen: true,
              cashierName: data.shift.openedByName || 'Cajero',
            });
            return;
          }
        }
        setShiftStatus({ isOpen: false });
      } catch {
        setShiftStatus({ isOpen: false });
      }
    };

    checkShift();
    const timer = setInterval(checkShift, 20000);
    return () => clearInterval(timer);
  }, [venueId]);

  return (
    <button
      onClick={onNavigateShifts}
      title={
        shiftStatus.isOpen
          ? `Caja Abierta por ${shiftStatus.cashierName} [F4]`
          : 'Caja Cerrada - Clic para abrir turno [F4]'
      }
      className={cn(
        'hidden sm:inline-flex items-center transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-full',
        className
      )}
    >
      <Badge
        variant={shiftStatus.isOpen ? 'success' : 'warning'}
        className="gap-1.5 px-2.5 py-1 text-xs hover:brightness-110"
      >
        <Wallet className="size-3 shrink-0" />
        <span className="truncate max-w-[110px]">
          {shiftStatus.isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
        </span>
      </Badge>
    </button>
  );
};
