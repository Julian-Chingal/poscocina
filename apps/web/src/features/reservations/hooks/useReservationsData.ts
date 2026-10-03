import { useState, useEffect, useCallback, useMemo } from 'react';
import { reservationsApi } from '../api/reservations.api';
import {
  Reservation,
  TableItem,
  FloorPlanItem,
  ReservationFilterStatus,
  ReservationTimeframe,
  ReservationMetrics,
} from '../types/reservations.types';

export const useReservationsData = (venueId: string) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation & Filters: Status is primary, timeframe/date is secondary
  const [statusFilter, setStatusFilter] = useState<ReservationFilterStatus>('all');
  const [timeframe, setTimeframe] = useState<ReservationTimeframe>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [metrics, setMetrics] = useState<ReservationMetrics>({
    pendingCount: 0,
    confirmedCount: 0,
    seatedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    totalActive: 0,
    totalGuests: 0,
  });

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    try {
      setLoading(true);
      const [resData, metricsData, tablesData, floorPlansData] = await Promise.all([
        reservationsApi.getReservations(venueId, {
          status: statusFilter,
          date: selectedDate || undefined,
          timeframe: selectedDate ? undefined : timeframe,
          search: searchTerm || undefined,
        }),
        reservationsApi.getMetrics(
          venueId,
          selectedDate ? undefined : timeframe,
          selectedDate || undefined
        ),
        reservationsApi.getTables(venueId),
        reservationsApi.getFloorPlans(venueId).catch(() => [] as FloorPlanItem[]),
      ]);

      setReservations(resData || []);
      if (metricsData) {
        setMetrics(metricsData);
      }
      setTables(tablesData || []);
      setFloorPlans(floorPlansData || []);
    } catch (err) {
      console.error('Error fetching reservations data:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId, statusFilter, selectedDate, timeframe, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = useMemo(() => {
    return {
      pendingCount: metrics.pendingCount,
      confirmedCount: metrics.confirmedCount,
      seatedCount: metrics.seatedCount,
      cancelledCount: metrics.cancelledCount,
      noShowCount: metrics.noShowCount,
      totalActive: metrics.totalActive,
      totalGuests: metrics.totalGuests,
    };
  }, [metrics]);

  return {
    reservations,
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
    filteredReservations: reservations,
    kpis,
    refresh: fetchData,
  };
};
