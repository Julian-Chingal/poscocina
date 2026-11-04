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
  onUndoStatus?: (item: KdsItem) => void;
  onNextStationStatus?: (item: KdsItem, stationId: string, status?: any) => void;
  onUndoStationStatus?: (item: KdsItem, stationId: string) => void;
  onCompleteOrder?: (order: KdsOrder) => void;
}

export const KdsOrdersGrid: React.FC<KdsOrdersGridProps> = ({
  orders,
  activeStation,
  currentTime,
  onNextStatus,
  onUndoStatus,
  onNextStationStatus,
  onUndoStationStatus,
  onCompleteOrder,
}) => {
  const isHistory = activeStation === 'history';

  if (orders.length === 0) {
    const stationLabel = STATIONS.find((s) => s.id === activeStation)?.label.toLowerCase() || '';
    return (
      <div className="bg-muted/40 border border-border rounded-3xl p-16 text-center text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/80" />
        <p className="text-lg font-bold text-foreground">
          {isHistory ? 'Sin comandas en historial reciente' : '¡Estación al día!'}
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          {isHistory
            ? 'No hay comandas despachadas en los últimos 10 minutos.'
            : `No hay comandas pendientes en ${stationLabel}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
      {orders.map((order) => (
        <KdsOrderCard
          key={order.id}
          order={order}
          currentTime={currentTime}
          activeStation={activeStation}
          onNextStatus={onNextStatus}
          onUndoStatus={onUndoStatus}
          onNextStationStatus={onNextStationStatus}
          onUndoStationStatus={onUndoStationStatus}
          onCompleteOrder={onCompleteOrder}
          showDelivered={isHistory}
        />
      ))}
    </div>
  );
};
export default KdsOrdersGrid;
