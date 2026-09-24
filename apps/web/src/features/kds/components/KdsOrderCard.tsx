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
}

export const KdsOrderCard: React.FC<KdsOrderCardProps> = ({
  order,
  currentTime,
  onNextStatus,
}) => {
  const urgency = getUrgencyStyles(order.openedAt, currentTime);

  return (
    <Card
      className={`w-full min-w-0 h-full border rounded-2xl overflow-hidden flex flex-col shadow-xl transition-all ${urgency.cardBorder}`}
    >
      {/* Order Header */}
      <CardHeader className="bg-muted/40 px-4 py-3 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-black text-foreground">
              {order.table?.label || 'Para Llevar'}
            </span>
            {order.orderNumber && (
              <span className="text-xs font-mono text-muted-foreground">
                #{order.orderNumber}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Mesero: <span className="text-foreground font-medium">{order.waiter?.name || 'Caja'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {order.paymentStatus === 'paid' ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5"
            >
              Pagado
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5"
            >
              Por Cobrar
            </Badge>
          )}

          {/* Urgency Badge */}
          <Badge
            variant="outline"
            className={`space-x-1 text-xs px-2.5 py-1 font-mono ${urgency.badge}`}
            title={urgency.label}
          >
            <Clock className="w-3.5 h-3.5" />
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
          />
        ))}
      </CardContent>
    </Card>
  );
};
