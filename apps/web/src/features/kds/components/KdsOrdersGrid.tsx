import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { KdsOrder, KdsItem, StationFilter } from '../types/kds.types';
import { STATIONS } from '../constants/kds.constants';
import { KdsOrderCard } from './KdsOrderCard';

interface KdsOrdersGridProps {
  orders: KdsOrder[];
  activeStation: StationFilter;
  currentTime: number;
  onNextStatus: (item: KdsItem) => void;
}

export const KdsOrdersGrid: React.FC<KdsOrdersGridProps> = ({
  orders,
  activeStation,
  currentTime,
  onNextStatus,
}) => {
  if (orders.length === 0) {
    const stationLabel = STATIONS.find((s) => s.id === activeStation)?.label.toLowerCase() || '';
    return (
      <div className="bg-muted/40 border border-border rounded-3xl p-16 text-center text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/80" />
        <p className="text-lg font-bold text-foreground">¡Estación al día!</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          No hay comandas pendientes en {stationLabel}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {orders.map((order) => (
        <KdsOrderCard
          key={order.id}
          order={order}
          currentTime={currentTime}
          onNextStatus={onNextStatus}
        />
      ))}
    </div>
  );
};
