import { useState, useEffect, useCallback, useMemo } from 'react';
import { reservationsApi } from '../api/reservations.api';
import {
  Reservation,
  TableItem,
  ReservationFilterStatus,
} from '../types/reservations.types';

export const useReservationsData = (venueId: string) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<ReservationFilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchReservations = useCallback(async () => {
    if (!venueId) return;
    try {
      setLoading(true);
      const data = await reservationsApi.getReservations(venueId, selectedDate);
      setReservations(data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId, selectedDate]);

  const fetchTables = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await reservationsApi.getTables(venueId);
      setTables(data || []);
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  }, [venueId]);

  const refresh = useCallback(() => {
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = r.customerName.toLowerCase().includes(term);
        const matchPhone = r.customerPhone?.includes(term);
        const matchTable = r.table?.label?.toLowerCase().includes(term);
        return matchName || matchPhone || matchTable;
      }
      return true;
    });
  }, [reservations, statusFilter, searchTerm]);

  const kpis = useMemo(() => {
    const pendingCount = reservations.filter((r) => r.status === 'pending').length;
    const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
    const seatedCount = reservations.filter((r) => r.status === 'seated').length;
    const totalGuests = reservations
      .filter((r) => r.status !== 'cancelled' && r.status !== 'no_show')
      .reduce((sum, r) => sum + r.guestCount, 0);

    return { pendingCount, confirmedCount, seatedCount, totalGuests };
  }, [reservations]);

  return {
    reservations,
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
  };
};
