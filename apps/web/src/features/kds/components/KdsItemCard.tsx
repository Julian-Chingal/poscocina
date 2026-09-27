import React from 'react';
import { AlertCircle } from 'lucide-react';
import { KdsItem } from '../types/kds.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KdsItemCardProps {
  item: KdsItem;
  onNextStatus: (item: KdsItem) => void;
}

export const KdsItemCard: React.FC<KdsItemCardProps> = ({ item, onNextStatus }) => {
  const isReady = item.status === 'ready';
  const isCooking = item.status === 'in_preparation';
  const isDelivered = item.status === 'delivered';

  if (isDelivered) return null;

  return (
    <Card
      className={`p-3.5 rounded-xl border transition-all ${
        isReady
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
          <span className="text-foreground text-xs sm:text-sm font-bold leading-snug truncate">
            {item.product?.name || 'Producto'}
          </span>
        </div>

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
