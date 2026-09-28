import React from 'react';
import { Clock } from 'lucide-react';
import { KdsOrder, KdsItem } from '../types/kds.types';
import { getUrgencyStyles } from '../utils/urgency.utils';
import { KdsItemCard } from './KdsItemCard';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
interface KdsOrderCardProps {
  order: KdsOrder;
  currentTime: number;
  onNextStatus: (item: KdsItem) => void;
  onUndoStatus?: (item: KdsItem) => void;
  showDelivered?: boolean;
}

export const KdsOrderCard: React.FC<KdsOrderCardProps> = ({
  order,
  currentTime,
  onNextStatus,
  onUndoStatus,
  showDelivered = false,
}) => {
  // Use earliest sentAt if available, fallback to openedAt for FIFO accuracy
  const itemTimes = order.items
    .map((it) => (it.sentAt ? new Date(it.sentAt).getTime() : null))
    .filter(Boolean) as number[];

  const earliestKitchenTimestamp = itemTimes.length > 0 ? Math.min(...itemTimes) : new Date(order.openedAt).getTime();
  const urgency = getUrgencyStyles(new Date(earliestKitchenTimestamp).toISOString(), currentTime);

  return (
    <Card
      className={`w-full min-w-0 h-full border rounded-2xl overflow-hidden flex flex-col shadow-xl transition-all ${urgency.cardBorder}`}
    >
      {/* Order Header */}
      <CardHeader className="bg-muted/50 px-4 py-3 border-b border-border/80 flex flex-row items-center justify-between space-y-0 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-foreground tracking-tight truncate">
              {order.table?.label || (order.guestName ? `Para Llevar (${order.guestName})` : 'Para Llevar')}
            </span>
            {order.orderNumber && (
              <span className="text-xs font-mono font-bold bg-background/80 border border-border/80 text-foreground px-2 py-0.5 rounded-lg shadow-2xs">
                #{order.orderNumber}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
            Mesero: <span className="text-foreground font-semibold">{order.waiter?.name || 'Caja'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {order.paymentStatus === 'paid' ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 shadow-2xs"
            >
              Pagado
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 shadow-2xs"
            >
              Por Cobrar
            </Badge>
          )}

          {/* Urgency Badge with tabular timer */}
          <Badge
            variant="outline"
            className={`gap-1.5 text-xs px-2.5 py-1 font-mono tabular-nums shadow-2xs ${urgency.badge}`}
            title={urgency.label}
          >
            <Clock className="size-3.5 shrink-0" strokeWidth={2.2} />
            <span>{urgency.elapsedMinutes}m</span>
          </Badge>
        </div>
      </CardHeader>

      {/* Items List */}
      <CardContent className="p-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-96">
        {order.items.map((item) => (
          <KdsItemCard
            key={item.id}
            item={item}
            onNextStatus={onNextStatus}
            onUndoStatus={onUndoStatus}
            showDelivered={showDelivered}
          />
        ))}
      </CardContent>
    </Card>
  );
};
