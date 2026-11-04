import React, { useMemo } from 'react';
import { GastronomicLoader } from '@/components/common/GastronomicLoader';
import { KdsViewProps } from './types/kds.types';
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
    handleNextStationStatus,
    handleUndoStationStatus,
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

  const stationCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      history: 0,
    };
    for (const ord of orders) {
      const seenStationsInOrder = new Set<string>();
      for (const item of ord.items) {
        if (item.stations && item.stations.length > 0) {
          for (const st of item.stations) {
            seenStationsInOrder.add(st.stationId);
            if (st.station?.code) seenStationsInOrder.add(st.station.code);
          }
        } else if (item.product?.printerStation) {
          seenStationsInOrder.add(item.product.printerStation);
        } else {
          seenStationsInOrder.add('kitchen');
        }
      }
      for (const stId of seenStationsInOrder) {
        counts[stId] = (counts[stId] || 0) + 1;
      }
    }
    return counts;
  }, [orders]);

  if (loading && orders.length === 0) {
    return (
      <GastronomicLoader
        variant="card"
        iconType="flame"
        message="Cargando comandas en cocina..."
        submessage="Conectando con pantallas KDS y estaciones de preparación"
        className="my-10 max-w-xl mx-auto"
      />
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
        onNextStationStatus={handleNextStationStatus}
        onUndoStationStatus={handleUndoStationStatus}
        onCompleteOrder={handleCompleteOrder}
      />
    </div>
  );
};

export default KdsView;
