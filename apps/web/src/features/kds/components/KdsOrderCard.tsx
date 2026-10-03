import React from 'react';
import { Clock, ShoppingBag, Utensils, User, CheckCheck, PackageCheck } from 'lucide-react';
import { KdsOrder, KdsItem } from '../types/kds.types';
import { getUrgencyStyles } from '../utils/urgency.utils';
import { KdsItemCard } from './KdsItemCard';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface KdsOrderCardProps {
  order: KdsOrder;
  currentTime: number;
  onNextStatus: (item: KdsItem) => void;
  onUndoStatus?: (item: KdsItem) => void;
  onCompleteOrder?: (order: KdsOrder) => void;
  showDelivered?: boolean;
}

export const KdsOrderCard: React.FC<KdsOrderCardProps> = ({
  order,
  currentTime,
  onNextStatus,
  onUndoStatus,
  onCompleteOrder,
  showDelivered = false,
}) => {
  // Use earliest sentAt if available, fallback to openedAt for FIFO accuracy
  const itemTimes = order.items
    .map((it) => (it.sentAt ? new Date(it.sentAt).getTime() : null))
    .filter(Boolean) as number[];

  const earliestKitchenTimestamp =
    itemTimes.length > 0 ? Math.min(...itemTimes) : new Date(order.openedAt).getTime();
  const urgency = getUrgencyStyles(new Date(earliestKitchenTimestamp).toISOString(), currentTime);

  const totalItems = order.items.length;
  const completedItems = order.items.filter(
    (i) => i.status === 'ready' || i.status === 'delivered'
  ).length;
  const isAllReady = totalItems > 0 && completedItems === totalItems;
  const isTakeout =
    !order.table?.label ||
    order.table.label.toLowerCase().includes('llevar') ||
    Boolean(order.guestName);

  return (
    <Card
      className={`w-full min-w-0 h-full rounded-2xl overflow-hidden flex flex-col transition-all bg-card ${urgency.cardBorder}`}
    >
      {/* Order Header */}
      <CardHeader className="bg-muted/30 px-4 py-3 border-b border-border/70 flex flex-col gap-2 space-y-0">
        <div className="flex items-start justify-between gap-2">
          {/* Table / Takeout Label */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isTakeout ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-sm">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{order.guestName ? `Para Llevar (${order.guestName})` : 'Para Llevar'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-foreground font-black text-lg tracking-tight">
                  <Utensils className="w-4 h-4 text-muted-foreground" />
                  <span>{order.table?.label}</span>
                </div>
              )}

              {order.orderNumber && (
                <span className="text-xs font-mono font-bold bg-muted/80 border border-border/80 text-foreground px-2 py-0.5 rounded-md shadow-2xs">
                  #{order.orderNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
              <User className="w-3 h-3 text-muted-foreground/80" />
              <span>
                Mesero: <strong className="text-foreground font-semibold">{order.waiter?.name || 'Caja'}</strong>
              </span>
            </div>
          </div>

          {/* Badges: Payment + Urgency Timer */}
          <div className="flex items-center gap-1.5 shrink-0">
            {order.paymentStatus === 'paid' ? (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
                Pagado
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
                Por Cobrar
              </span>
            )}

            {/* Timer Badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-mono font-bold border ${urgency.badge}`}
              title={urgency.label}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{urgency.elapsedMinutes}m</span>
            </span>
          </div>
        </div>

        {/* Progress Bar for multi-item orders */}
        {totalItems > 1 && (
          <div className="pt-1 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>Progreso de comanda:</span>
              <span className="font-semibold text-foreground">
                {completedItems} de {totalItems} listos
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.round((completedItems / totalItems) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {/* Items List */}
      <CardContent className="p-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-[38rem]">
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

      {/* Card Footer with Quick Batch Action */}
      {onCompleteOrder && !showDelivered && (
        <CardFooter className="p-3 pt-0 border-t border-border/50 mt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => onCompleteOrder(order)}
            className={`w-full h-9 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isAllReady
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                : 'bg-muted/80 hover:bg-muted text-foreground border border-border/80'
            }`}
          >
            {isAllReady ? (
              <>
                <PackageCheck className="w-4 h-4" />
                <span>Despachar Comanda Completa ✓</span>
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Marcar Todos Listos</span>
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

