import React, { useState, useCallback } from 'react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const {
    tables,
    floorPlans,
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

  const handleClearFilters = useCallback(() => {
    setStatusFilter('all');
    setTimeframe('all');
    setSelectedDate('');
    setSearchTerm('');
  }, [setStatusFilter, setTimeframe, setSelectedDate, setSearchTerm]);

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-4 sm:p-8 space-y-5">
      <ReservationsHeader
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        totalActive={kpis.totalActive}
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
        activeStatus={statusFilter}
        onSelectStatus={setStatusFilter}
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
        onClearFilters={handleClearFilters}
      />

      <ReservationsGrid
        loading={loading}
        reservations={filteredReservations}
        viewMode={viewMode}
        statusFilter={statusFilter}
        selectedDate={selectedDate}
        searchTerm={searchTerm}
        onClearFilters={handleClearFilters}
        onOpenNewReservation={() => {
          setErrorMessage(null);
          setShowModal(true);
        }}
        onUpdateStatus={handleUpdateStatus}
        onSeatReservation={(res) =>
          handleSeatReservation(res, currentUser?.id, onNavigateToTable)
        }
        onNavigateToTable={onNavigateToTable}
      />

      <CreateReservationModal
        isOpen={showModal}
        venueId={venueId}
        tables={tables}
        floorPlans={floorPlans}
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
