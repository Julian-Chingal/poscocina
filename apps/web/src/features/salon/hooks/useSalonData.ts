import { useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { salonApi } from '../api/salon.api';
import { TableItem, FloorPlanItem } from '../types/salon.types';

export const useSalonData = (venueId: string) => {
  const [floorPlans, setFloorPlans] = useState<FloorPlanItem[]>([]);
  const [activeFloorPlanId, setActiveFloorPlanId] = useState<string>('all');
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    try {
      setLoading(true);
      const [tablesData, plansData] = await Promise.all([
        salonApi.getTables(venueId),
        salonApi.getFloorPlans(venueId),
      ]);
      setTables(tablesData || []);
      setFloorPlans(plansData || []);
    } catch (err) {
      console.error('Error fetching salon data:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchData();

    const socket = io();
    const handleUpdate = () => fetchData();

    socket.on('table:created', handleUpdate);
    socket.on('table:updated', (updated: TableItem) => {
      setTables((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    });
    socket.on('table:deleted', ({ id }: { id: string }) => {
      setTables((prev) => prev.filter((t) => t.id !== id));
    });
    socket.on('table:status_changed', (payload: { tableId: string; status: TableItem['status'] }) => {
      setTables((prev) =>
        prev.map((t) => (t.id === payload.tableId ? { ...t, status: payload.status } : t))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId, fetchData]);

  const filteredTables = useMemo(() => {
    if (activeFloorPlanId === 'all') return tables;
    return tables.filter((t) => t.floorPlanId === activeFloorPlanId);
  }, [tables, activeFloorPlanId]);

  return {
    tables,
    floorPlans,
    activeFloorPlanId,
    filteredTables,
    loading,
    setActiveFloorPlanId,
    setFloorPlans,
    refreshData: fetchData,
  };
};
