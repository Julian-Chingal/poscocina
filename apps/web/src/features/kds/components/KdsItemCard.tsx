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
      className={`p-3 rounded-xl border transition-all ${
        isReady
          ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground'
          : isCooking
          ? 'bg-amber-500/10 border-amber-500/40 text-foreground'
          : 'bg-card border-border text-foreground'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-bold flex items-center space-x-2 min-w-0">
          <Badge variant="outline" className="text-primary text-xs font-black bg-primary/15 border-primary/30 shrink-0">
            {item.quantity}x
          </Badge>
          <span className="text-foreground text-xs leading-snug truncate">
            {item.product?.name || 'Producto'}
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => onNextStatus(item)}
          className={`text-[11px] h-7 px-2.5 rounded-lg font-bold transition-all cursor-pointer flex-shrink-0 ${
            isReady
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              : isCooking
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          {isReady ? 'Servido ✓' : isCooking ? '¡Listo!' : 'Cocinar'}
        </Button>
      </div>

      {item.notes && (
        <div className="mt-2 text-[11px] text-destructive bg-destructive/10 p-1.5 rounded-lg border border-destructive/30 flex items-start space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Nota: {item.notes}</span>
        </div>
      )}
    </Card>
  );
};
