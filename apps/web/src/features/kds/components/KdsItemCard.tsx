import React from 'react';
import { AlertTriangle, Undo2, Sparkles, Flame, CheckCircle, PackageCheck } from 'lucide-react';
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
          ? 'bg-muted/40 border-border/60 opacity-60'
          : isReady
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : isCooking
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-card border-border/80'
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
              <span className="text-foreground text-sm sm:text-base font-bold leading-tight whitespace-normal break-words">
                {item.product?.name || 'Producto'}
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
                  const modName = mod.modifier?.name || mod.name || 'Extra';
                  return (
                    <span
                      key={`${mod.id || mIdx}`}
                      className="inline-flex items-center text-[11px] bg-muted/80 text-foreground/90 border border-border/70 px-2 py-0.5 rounded-md font-medium whitespace-normal break-words"
                    >
                      <span className="text-amber-600 dark:text-amber-400 font-bold mr-1">+</span>
                      {modName}
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
              onClick={() => onNextStatus(item)}
              className={`text-xs h-8 sm:h-9 px-3.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center gap-1.5 ${
                isReady
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : isCooking
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
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
            <Badge variant="outline" className="text-xs font-semibold text-muted-foreground border-border/60 py-0.5 px-2">
              Despachado
            </Badge>
          )}
        </div>
      </div>

      {/* Chef Note Callout */}
      {item.notes && (
        <div className="mt-2.5 text-xs text-amber-900 dark:text-amber-200 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25 flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span className="whitespace-normal break-words leading-tight">Nota: {item.notes}</span>
        </div>
      )}
    </Card>
  );
};

