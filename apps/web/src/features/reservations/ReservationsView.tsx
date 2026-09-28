import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { ReservationsViewProps } from './types/reservations.types';
import { useReservationsData } from './hooks/useReservationsData';
import { useReservationMutations } from './hooks/useReservationMutations';
import { ReservationsHeader } from './components/ReservationsHeader';
import { ReservationKpis } from './components/ReservationKpis';
import { ReservationsFilterBar } from './components/ReservationsFilterBar';
import { ReservationsGrid } from './components/ReservationsGrid';
import { CreateReservationModal } from './components/CreateReservationModal';

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  venueId,
  onNavigateToTable,
}) => {
  const { currentUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const {
    tables,
    loading,
    selectedDate,
    setSelectedDate,
    timeframe,
    setTimeframe,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    filteredReservations,
    kpis,
    refresh,
  } = useReservationsData(venueId);

  const {
    submitting,
    errorMessage,
    setErrorMessage,
    handleCreateReservation,
    handleUpdateStatus,
    handleSeatReservation,
  } = useReservationMutations(refresh);

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-6 sm:p-10 space-y-6">
      <ReservationsHeader
        onOpenNew={() => {
          setErrorMessage(null);
          setShowModal(true);
        }}
      />

      <ReservationKpis
        pendingCount={kpis.pendingCount}
        confirmedCount={kpis.confirmedCount}
        seatedCount={kpis.seatedCount}
        totalGuests={kpis.totalGuests}
      />

      <ReservationsFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        kpis={kpis}
        loading={loading}
        onRefresh={refresh}
      />

      <ReservationsGrid
        loading={loading}
        reservations={filteredReservations}
        onUpdateStatus={handleUpdateStatus}
        onSeatReservation={(res) =>
          handleSeatReservation(res, currentUser?.id, onNavigateToTable)
        }
      />

      <CreateReservationModal
        isOpen={showModal}
        venueId={venueId}
        tables={tables}
        defaultDate={selectedDate || new Date().toISOString().split('T')[0]}
        submitting={submitting}
        errorMessage={errorMessage}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateReservation}
      />
    </div>
  );
};

export default ReservationsView;
