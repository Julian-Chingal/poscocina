import React, { useMemo } from 'react';
import { KdsViewProps, StationFilter } from './types/kds.types';
import { useKdsData } from './hooks/useKdsData';
import { KdsHeader } from './components/KdsHeader';
import { KdsStationTabs } from './components/KdsStationTabs';
import { KdsOrdersGrid } from './components/KdsOrdersGrid';

export const KdsView: React.FC<KdsViewProps> = ({ venueId }) => {
  const {
    orders,
    loading,
    isSyncing,
    isConnected,
    activeStation,
    setActiveStation,
    currentTime,
    handleNextStatus,
    handleUndoStatus,
    handleCompleteOrder,
    refreshOrders,
  } = useKdsData(venueId);

  const cookingCount = useMemo(() => {
    return orders.reduce(
      (acc, ord) => acc + ord.items.filter((i) => i.status === 'in_preparation').length,
      0
    );
  }, [orders]);

  const delayedCount = useMemo(() => {
    return orders.filter((ord) => {
      const elapsed = Math.floor((currentTime - new Date(ord.openedAt).getTime()) / 60000);
      return elapsed >= 20;
    }).length;
  }, [orders, currentTime]);

  const stationCounts = useMemo<Record<StationFilter, number>>(() => {
    return {
      all: orders.length,
      kitchen: orders.filter((o) =>
        o.items.some((i) => !i.product?.station || i.product.station === 'kitchen')
      ).length,
      bar: orders.filter((o) => o.items.some((i) => i.product?.station === 'bar')).length,
      dessert: orders.filter((o) => o.items.some((i) => i.product?.station === 'dessert')).length,
      history: 0,
    };
  }, [orders]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Cargando comandas en cocina...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-[1800px] mx-auto p-4 sm:p-6 space-y-5">
      <KdsHeader
        activeCount={orders.length}
        cookingCount={cookingCount}
        delayedCount={delayedCount}
        isConnected={isConnected}
        isSyncing={isSyncing}
        onRefresh={refreshOrders}
      />

      <KdsStationTabs
        activeStation={activeStation}
        onSelectStation={setActiveStation}
        stationCounts={stationCounts}
      />

      <KdsOrdersGrid
        orders={orders}
        activeStation={activeStation}
        currentTime={currentTime}
        onNextStatus={handleNextStatus}
        onUndoStatus={handleUndoStatus}
        onCompleteOrder={handleCompleteOrder}
      />
    </div>
  );
};

export default KdsView;
