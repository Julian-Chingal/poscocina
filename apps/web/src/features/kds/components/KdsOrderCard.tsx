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
      className={`bg-slate-800/90 border rounded-2xl overflow-hidden flex flex-col shadow-xl transition-all ${urgency.cardBorder}`}
    >
      {/* Order Header */}
      <CardHeader className="bg-slate-900 px-4 py-3 border-b border-slate-700/80 flex flex-row items-center justify-between space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-black text-white">
              {order.table?.label || 'Para Llevar'}
            </span>
            {order.orderNumber && (
              <span className="text-xs font-mono text-slate-400">
                #{order.orderNumber}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Mesero: <span className="text-slate-300 font-medium">{order.waiter?.name || 'Caja'}</span>
          </div>
        </div>

        {/* Urgency Badge */}
        <Badge
          variant="outline"
          className={`space-x-1 text-xs px-2.5 py-1 font-mono ${urgency.badge}`}
          title={urgency.label}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{urgency.elapsedMinutes}m</span>
        </Badge>
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
