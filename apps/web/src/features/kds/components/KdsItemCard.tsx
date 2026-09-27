import React from 'react';
import { AlertCircle, Undo2, Sparkles } from 'lucide-react';
import { KdsItem } from '../types/kds.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KdsItemCardProps {
  item: KdsItem;
  onNextStatus: (item: KdsItem) => void;
  onUndoStatus?: (item: KdsItem) => void;
  showDelivered?: boolean;
}

export const KdsItemCard: React.FC<KdsItemCardProps> = ({
  item,
  onNextStatus,
  onUndoStatus,
  showDelivered = false,
}) => {
  const isReady = item.status === 'ready';
  const isCooking = item.status === 'in_preparation';
  const isDelivered = item.status === 'delivered';
  const canUndo = (isCooking || isReady || isDelivered) && Boolean(onUndoStatus);

  if (isDelivered && !showDelivered) return null;

  return (
    <Card
      className={`p-3.5 rounded-xl border transition-all ${
        isDelivered
          ? 'bg-muted/60 border-border/70 opacity-75'
          : isReady
          ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground'
          : isCooking
          ? 'bg-amber-500/10 border-amber-500/40 text-foreground'
          : 'bg-card border-border/80 text-foreground'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-bold flex items-center space-x-2.5 min-w-0">
          <Badge
            variant="outline"
            className="text-primary text-xs sm:text-sm font-black bg-primary/15 border-primary/30 shrink-0 px-2 py-0.5"
          >
            {item.quantity}x
          </Badge>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-foreground text-xs sm:text-sm font-bold leading-snug truncate">
                {item.product?.name || 'Producto'}
              </span>
              {item.wasModifiedHot && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-md">
                  <Sparkles className="size-2.5 shrink-0" />
                  Actualizado
                </span>
              )}
            </div>
            {item.course && item.course > 1 && (
              <span className="text-[10px] font-medium text-muted-foreground">
                Tiempo/Paso {item.course}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Undo Button */}
          {canUndo && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Deshacer estado anterior"
              onClick={() => onUndoStatus?.(item)}
              className="size-8 sm:size-9 rounded-xl border-border/80 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-transform active:scale-90"
            >
              <Undo2 className="size-4" />
            </Button>
          )}

          {/* Action / Next Status Button */}
          {!isDelivered ? (
            <Button
              type="button"
              size="sm"
              onClick={() => onNextStatus(item)}
              className={`text-xs h-8 sm:h-9 px-3 rounded-xl font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 ${
                isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : isCooking
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
              }`}
            >
              {isReady ? 'Servido ✓' : isCooking ? '¡Listo!' : 'Cocinar'}
            </Button>
          ) : (
            <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground border-border/60">
              Despachado
            </Badge>
          )}
        </div>
      </div>

      {item.notes && (
        <div className="mt-2 text-xs text-destructive font-semibold bg-destructive/10 p-2 rounded-lg border border-destructive/30 flex items-start space-x-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>Nota: {item.notes}</span>
        </div>
      )}
    </Card>
  );
};
