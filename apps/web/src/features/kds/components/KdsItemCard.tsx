import React from "react";
import {
  AlertTriangle,
  Undo2,
  Sparkles,
  Flame,
  CheckCircle,
  PackageCheck,
} from "lucide-react";
import { KdsItem, StationFilter } from "../types/kds.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KdsItemCardProps {
  item: KdsItem;
  activeStation?: StationFilter;
  onNextStatus: (item: KdsItem) => void;
  onUndoStatus?: (item: KdsItem) => void;
  onNextStationStatus?: (
    item: KdsItem,
    stationId: string,
    status?: any,
  ) => void;
  onUndoStationStatus?: (item: KdsItem, stationId: string) => void;
  showDelivered?: boolean;
}

export const KdsItemCard: React.FC<KdsItemCardProps> = ({
  item,
  activeStation,
  onNextStatus,
  onUndoStatus,
  onNextStationStatus,
  onUndoStationStatus,
  showDelivered = false,
}) => {
  const isPerStationView =
    activeStation && activeStation !== "all" && activeStation !== "history";

  const currentStationEntry = isPerStationView
    ? (item.stations || []).find(
        (s) =>
          s.stationId === activeStation || s.station?.code === activeStation,
      )
    : null;

  const effectiveStatus = currentStationEntry
    ? currentStationEntry.status
    : item.status;
  const isReady = effectiveStatus === "ready";
  const isCooking = effectiveStatus === "in_preparation";
  const isDelivered = effectiveStatus === "delivered";
  const canUndo =
    (isCooking || isReady || isDelivered) &&
    Boolean(currentStationEntry ? onUndoStationStatus : onUndoStatus);

  if (isDelivered && !showDelivered) return null;

  const handleActionClick = () => {
    if (currentStationEntry && onNextStationStatus) {
      onNextStationStatus(item, currentStationEntry.stationId);
    } else {
      onNextStatus(item);
    }
  };

  const handleUndoClick = () => {
    if (currentStationEntry && onUndoStationStatus) {
      onUndoStationStatus(item, currentStationEntry.stationId);
    } else {
      onUndoStatus?.(item);
    }
  };

  const otherStations = isPerStationView
    ? (item.stations || []).filter(
        (s) => s.stationId !== currentStationEntry?.stationId,
      )
    : [];

  return (
    <Card
      className={`p-3.5 rounded-xl border transition-all ${
        isDelivered
          ? "bg-muted/40 border-border/60 opacity-60"
          : isReady
            ? "bg-emerald-500/10 border-emerald-500/30"
            : isCooking
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-card border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          {/* Quantity Badge */}
          <div className="w-8 h-8 rounded-lg bg-muted border border-border/80 font-black text-sm text-foreground flex items-center justify-center shrink-0 shadow-2xs">
            {item.quantity}x
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-start gap-1.5 flex-wrap">
              <span className="text-foreground text-sm sm:text-base font-bold leading-tight whitespace-normal wrap-break-word">
                {item.product?.name || "Producto"}
              </span>
              {item.wasModifiedHot && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-md shrink-0">
                  <Sparkles className="size-3 shrink-0" />
                  Actualizado
                </span>
              )}
            </div>

            {item.course && item.course > 1 && (
              <span className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                Tiempo / Paso {item.course}
              </span>
            )}

            {/* Modifiers & Toppings chips */}
            {(item as any).modifiers && (item as any).modifiers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(item as any).modifiers.map((mod: any, mIdx: number) => {
                  const modName = mod.modifier?.name || mod.name || "Extra";
                  return (
                    <span
                      key={`${mod.id || mIdx}`}
                      className="inline-flex items-center text-[11px] bg-muted/80 text-foreground/90 border border-border/70 px-2 py-0.5 rounded-md font-medium whitespace-normal wrap-break-word"
                    >
                      <span className="text-amber-600 dark:text-amber-400 font-bold mr-1">
                        +
                      </span>
                      {modName}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Sibling stations in single station view */}
            {otherStations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {otherStations.map((sibling) => (
                  <span
                    key={sibling.id || sibling.stationId}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-medium bg-muted/40 text-muted-foreground border-border/60"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: sibling.station?.color || "#ea580c",
                      }}
                    />
                    <span>{sibling.station?.name}:</span>
                    <strong className="text-foreground">
                      {sibling.status === "ready"
                        ? "Listo ✓"
                        : sibling.status === "in_preparation"
                          ? "Preparando"
                          : sibling.status === "delivered"
                            ? "Despachado"
                            : "Pendiente"}
                    </strong>
                  </span>
                ))}
              </div>
            )}

            {/* Multi-Station breakdown chips in 'All' view */}
            {!isPerStationView && item.stations && item.stations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {item.stations.map((st) => (
                  <button
                    key={st.id || st.stationId}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNextStationStatus?.(item, st.stationId);
                    }}
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-lg border font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      st.status === "ready"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : st.status === "in_preparation"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          : st.status === "delivered"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"
                            : "bg-muted/80 text-muted-foreground border-border"
                    }`}
                    title="Clic para avanzar esta estación"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: st.station?.color || "#ea580c",
                      }}
                    />
                    <span>{st.station?.name || "Estación"}:</span>
                    <span className="font-bold">
                      {st.status === "ready"
                        ? "Listo ✓"
                        : st.status === "in_preparation"
                          ? "Cocinando 🔥"
                          : st.status === "delivered"
                            ? "Despachado"
                            : "Pendiente"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          {/* Undo Button */}
          {canUndo && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Deshacer estado anterior"
              onClick={handleUndoClick}
              className="size-8 rounded-lg border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-transform active:scale-90"
            >
              <Undo2 className="size-3.5" />
            </Button>
          )}

          {/* Action Button */}
          {!isDelivered ? (
            <Button
              type="button"
              size="sm"
              onClick={handleActionClick}
              className={`text-xs h-8 sm:h-9 px-3.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center gap-1.5 ${
                isReady
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : isCooking
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isReady ? (
                <>
                  <PackageCheck className="size-3.5" />
                  <span>Servir ✓</span>
                </>
              ) : isCooking ? (
                <>
                  <CheckCircle className="size-3.5" />
                  <span>¡Listo!</span>
                </>
              ) : (
                <>
                  <Flame className="size-3.5" />
                  <span>Cocinar</span>
                </>
              )}
            </Button>
          ) : (
            <Badge
              variant="outline"
              className="text-xs font-semibold text-muted-foreground border-border/60 py-0.5 px-2"
            >
              Despachado
            </Badge>
          )}
        </div>
      </div>

      {/* Chef Note Callout */}
      {item.notes && (
        <div className="mt-2.5 text-xs text-amber-900 dark:text-amber-200 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25 flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span className="whitespace-normal wrap-break-word leading-tight">
            Nota: {item.notes}
          </span>
        </div>
      )}
    </Card>
  );
};
export default KdsItemCard;
