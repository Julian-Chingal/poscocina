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
      className={`p-4 rounded-xl border transition-all ${
        isDelivered
          ? 'bg-muted/60 border-border/70 opacity-75'
          : isReady
          ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground'
          : isCooking
          ? 'bg-amber-500/10 border-amber-500/40 text-foreground'
          : 'bg-card border-border/80 text-foreground'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <Badge
            variant="outline"
            className="text-primary text-sm sm:text-base font-black bg-primary/20 border-primary/40 shrink-0 px-2.5 py-1 rounded-lg"
          >
            {item.quantity}x
          </Badge>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-start gap-1.5 flex-wrap">
              <span className="text-foreground text-sm sm:text-base font-black leading-snug whitespace-normal break-words">
                {item.product?.name || 'Producto'}
              </span>
              {item.wasModifiedHot && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-md shrink-0">
                  <Sparkles className="size-3 shrink-0" />
                  Actualizado
                </span>
              )}
            </div>
            {item.course && item.course > 1 && (
              <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                Tiempo/Paso {item.course}
              </span>
            )}

            {/* Toppings y Adiciones en Comanda KDS */}
            {(item as any).modifiers && (item as any).modifiers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(item as any).modifiers.map((mod: any, mIdx: number) => {
                  const modName = mod.modifier?.name || mod.name || 'Extra';
                  return (
                    <span
                      key={`${mod.id || mIdx}`}
                      className="inline-flex items-center text-xs bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-md font-bold whitespace-normal break-words"
                    >
                      +{modName}
                    </span>
                  );
                })}
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
              onClick={() => onUndoStatus?.(item)}
              className="size-9 rounded-xl border-border/80 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-transform active:scale-90"
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
              className={`text-xs sm:text-sm h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 ${
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
            <Badge variant="outline" className="text-xs font-semibold text-muted-foreground border-border/60 py-1 px-2.5">
              Despachado
            </Badge>
          )}
        </div>
      </div>

      {item.notes && (
        <div className="mt-2.5 text-xs sm:text-sm text-destructive font-bold bg-destructive/10 p-2.5 rounded-xl border border-destructive/30 flex items-start space-x-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span className="whitespace-normal break-words">Nota: {item.notes}</span>
        </div>
      )}
    </Card>
  );
};
