import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';
import { useShiftStore } from '@/stores/shift.store';
import { cashShiftsApi } from '../api/cash-shifts.api';
import { ActiveShiftInfo, CloseShiftReportData } from '../types/cash-shifts.types';
import { toast } from '@/components/ui/sonner';

export const useCashShift = (venueId: string) => {
  const user = useAuthStore((s) => s.currentUser);
  const [shiftData, setShiftData] = useState<ActiveShiftInfo>({ open: false });
  const [loading, setLoading] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReport, setCloseReport] = useState<CloseShiftReportData | null>(null);

  const fetchShift = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await cashShiftsApi.getCurrentShift(venueId);
      setShiftData(data || { open: false });
      useShiftStore.getState().setShiftStatus({
        isOpen: Boolean(data?.open),
        shiftId: data?.shift?.id || null,
        cashierName: (data?.shift as any)?.openedByName || user?.name,
      });
    } catch (err) {
      console.error('Error fetching cash shift:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId, user?.name]);

  useEffect(() => {
    fetchShift();
    const socket = io();
    const handleRefresh = () => fetchShift();

    socket.on('order:created', handleRefresh);
    socket.on('order:items_appended', handleRefresh);
    socket.on('order:status_updated', handleRefresh);
    socket.on('table:status_changed', handleRefresh);

    return () => {
      socket.off('order:created', handleRefresh);
      socket.off('order:items_appended', handleRefresh);
      socket.off('order:status_updated', handleRefresh);
      socket.off('table:status_changed', handleRefresh);
      socket.disconnect();
    };
  }, [venueId, fetchShift]);

  const openShift = async (openingAmount: number, notes?: string) => {
    try {
      const res = await cashShiftsApi.openShift({
        venueId,
        cashierId: user?.id,
        openingAmount,
        notes,
      });
      useShiftStore.getState().setShiftStatus({
        isOpen: true,
        shiftId: res?.id || null,
        cashierName: user?.name,
      });
      toast.success('Turno de caja abierto exitosamente');
      fetchShift();
    } catch (err: any) {
      toast.error(err.message || 'Error al abrir turno de caja');
    }
  };

  const closeShift = async (closingAmount: number, notes?: string) => {
    if (!shiftData.shift?.id) return;
    try {
      const report = await cashShiftsApi.closeShift(shiftData.shift.id, {
        closingAmount,
        notes,
      });
      useShiftStore.getState().setShiftStatus({
        isOpen: false,
        shiftId: null,
      });
      toast.success('Turno de caja cerrado exitosamente');
      setCloseReport(report);
      setShowCloseModal(false);
      fetchShift();
    } catch (err: any) {
      toast.error(err.message || 'Error al cerrar turno de caja');
    }
  };

  const printSummary = async () => {
    if (!shiftData.shift?.id) return;
    try {
      await cashShiftsApi.printShiftSummary(shiftData.shift.id);
      toast.success('Resumen térmico de turno enviado a la impresora');
    } catch (err: any) {
      toast.error(err.message || 'Error al imprimir resumen');
    }
  };

  return {
    shiftData,
    loading,
    showCloseModal,
    closeReport,
    openCloseModal: () => setShowCloseModal(true),
    closeCloseModal: () => setShowCloseModal(false),
    clearCloseReport: () => setCloseReport(null),
    openShift,
    closeShift,
    printSummary,
    refreshShift: fetchShift,
  };
};
