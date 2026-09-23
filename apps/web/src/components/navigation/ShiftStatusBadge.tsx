import React, { useEffect } from "react";
import { Wallet } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useBrandingStore } from "../../stores/branding.store";
import { useShiftStore } from "../../stores/shift.store";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface ShiftStatusBadgeProps {
  onNavigateShifts: () => void;
  className?: string;
}

export const ShiftStatusBadge: React.FC<ShiftStatusBadgeProps> = ({
  onNavigateShifts,
  className,
}) => {
  // Atomic Zustand selectors to prevent unnecessary re-renders
  const venueId = useAuthStore((s) => s.venueId);
  const brandingVenueId = useBrandingStore((s) => s.venueId);
  const isOpen = useShiftStore((s) => s.isOpen);
  const cashierName = useShiftStore((s) => s.cashierName);
  const fetchCurrentShift = useShiftStore((s) => s.fetchCurrentShift);
  const initSocket = useShiftStore((s) => s.initSocket);

  useEffect(() => {
    const activeVenue = venueId || brandingVenueId;
    if (!activeVenue) return;

    fetchCurrentShift(activeVenue);
    // Real-time synchronization handled via WebSocket events
    const cleanupSocket = initSocket(activeVenue);

    return () => {
      cleanupSocket();
    };
  }, [venueId, brandingVenueId, fetchCurrentShift, initSocket]);

  const tooltipTitle = isOpen
    ? `Caja Abierta por ${cashierName || "Cajero"} [F4]`
    : "Caja Cerrada - Clic para abrir turno [F4]";

  return (
    <button
      type="button"
      onClick={onNavigateShifts}
      title={tooltipTitle}
      aria-label={tooltipTitle}
      className={cn(
        "hidden sm:inline-flex items-center rounded-full transition-transform duration-150 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
    >
      <Badge
        variant={isOpen ? "success" : "warning"}
        className="gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer shadow-2xs hover:brightness-105 transition-all"
      >
        <Wallet className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="truncate max-w-[110px]">
          {isOpen ? "Caja Abierta" : "Caja Cerrada"}
        </span>
      </Badge>
    </button>
  );
};
