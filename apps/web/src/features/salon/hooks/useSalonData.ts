import { useState, useEffect, useCallback, useMemo } from 'react';
import { salonApi } from '../api/salon.api';
import { TableItem, FloorPlanItem } from '../types/salon.types';
import { getAppSocket } from '@/lib/socket';

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

    const socket = getAppSocket();
    const handleUpdate = () => fetchData();
    const handleTableUpdated = (updated: TableItem) => {
      setTables((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    };
    const handleBatchUpdated = (batch: TableItem[]) => {
      const map = new Map(batch.map((b) => [b.id, b]));
      setTables((prev) => prev.map((t) => (map.has(t.id) ? { ...t, ...map.get(t.id) } : t)));
    };
    const handleTableDeleted = ({ id }: { id: string }) => {
      setTables((prev) => prev.filter((t) => t.id !== id));
    };
    const handleStatusChanged = (payload: { tableId: string; status: TableItem['status'] }) => {
      setTables((prev) =>
        prev.map((t) => (t.id === payload.tableId ? { ...t, status: payload.status } : t))
      );
    };
    const handleFloorPlanUpdated = (updated: FloorPlanItem) => {
      setFloorPlans((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    };
    const handleFloorPlanDeleted = ({ id }: { id: string }) => {
      setFloorPlans((prev) => prev.filter((p) => p.id !== id));
    };

    socket.on('table:created', handleUpdate);
    socket.on('table:updated', handleTableUpdated);
    socket.on('tables:batch_updated', handleBatchUpdated);
    socket.on('table:deleted', handleTableDeleted);
    socket.on('table:status_changed', handleStatusChanged);
    socket.on('floor_plan:updated', handleFloorPlanUpdated);
    socket.on('floor_plan:deleted', handleFloorPlanDeleted);

    return () => {
      socket.off('table:created', handleUpdate);
      socket.off('table:updated', handleTableUpdated);
      socket.off('tables:batch_updated', handleBatchUpdated);
      socket.off('table:deleted', handleTableDeleted);
      socket.off('table:status_changed', handleStatusChanged);
      socket.off('floor_plan:updated', handleFloorPlanUpdated);
      socket.off('floor_plan:deleted', handleFloorPlanDeleted);
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
