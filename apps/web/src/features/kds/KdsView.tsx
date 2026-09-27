import React from 'react';
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
    refreshOrders,
  } = useKdsData(venueId);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground animate-spin text-3xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-6 space-y-6">
      <KdsHeader
        activeCount={orders.length}
        isConnected={isConnected}
        isSyncing={isSyncing}
        onRefresh={refreshOrders}
      />

      <KdsStationTabs
        activeStation={activeStation}
        onSelectStation={setActiveStation}
      />

      <KdsOrdersGrid
        orders={orders}
        activeStation={activeStation}
        currentTime={currentTime}
        onNextStatus={handleNextStatus}
        onUndoStatus={handleUndoStatus}
      />
    </div>
  );
};

export default KdsView;
