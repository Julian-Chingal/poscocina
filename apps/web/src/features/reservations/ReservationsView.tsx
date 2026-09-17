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
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
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
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
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
        defaultDate={selectedDate}
        submitting={submitting}
        errorMessage={errorMessage}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateReservation}
      />
    </div>
  );
};

export default ReservationsView;
