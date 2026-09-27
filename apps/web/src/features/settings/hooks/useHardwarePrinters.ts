import { useState, useEffect, useCallback } from 'react';
import { useBrandingStore } from '@/stores/branding.store';
import { settingsApi } from '../api/settings.api';
import { PrinterDevice, PrinterFormData, TestPrintResult } from '../types/settings.types';
import { toast } from '@/components/ui/sileo';

export const useHardwarePrinters = () => {
  const currentVenueId = useBrandingStore((s) => s.venueId);
  const venues = useBrandingStore((s) => s.venues);
  const loadAllVenues = useBrandingStore((s) => s.loadAllVenues);

  const [selectedBranchId, setSelectedBranchId] = useState<string>(currentVenueId || '');
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterDevice | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestPrintResult | null>(null);

  // Asegurar que las sedes estén cargadas
  useEffect(() => {
    if (!venues.length) {
      loadAllVenues();
    }
  }, [venues.length, loadAllVenues]);

  // Si no hay selectedBranchId seleccionado, asignar la sede actual o la primera disponible
  useEffect(() => {
    if (!selectedBranchId) {
      const defaultId = currentVenueId || venues[0]?.id;
      if (defaultId) setSelectedBranchId(defaultId);
    }
  }, [selectedBranchId, currentVenueId, venues]);

  const fetchPrinters = useCallback(async () => {
    if (!selectedBranchId) return;
    try {
      const data = await settingsApi.getPrinters(selectedBranchId);
      setPrinters(data || []);
    } catch {
      toast.error('Error al cargar lista de impresoras de la sede');
    }
  }, [selectedBranchId]);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  const openNewPrinter = () => {
    setEditingPrinter(null);
    setIsModalOpen(true);
  };

  const openEditPrinter = (printer: PrinterDevice) => {
    setEditingPrinter(printer);
    setIsModalOpen(true);
  };

  const [tabletCashierPrinterId, setTabletCashierPrinterId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('poscocina_tablet_cashier_printer') || null;
    } catch {
      return null;
    }
  });

  const [tabletKitchenPrinterId, setTabletKitchenPrinterId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('poscocina_tablet_kitchen_printer') || null;
    } catch {
      return null;
    }
  });

  const setTabletDefaultPrinter = (printerId: string, role: 'cashier' | 'kitchen') => {
    try {
      if (role === 'cashier') {
        const next = tabletCashierPrinterId === printerId ? null : printerId;
        setTabletCashierPrinterId(next);
        if (next) {
          localStorage.setItem('poscocina_tablet_cashier_printer', next);
          toast.success('Impresora asignada como predeterminada de facturación para esta tablet');
        } else {
          localStorage.removeItem('poscocina_tablet_cashier_printer');
          toast.info('Se desvinculó como predeterminada');
        }
      } else {
        const next = tabletKitchenPrinterId === printerId ? null : printerId;
        setTabletKitchenPrinterId(next);
        if (next) {
          localStorage.setItem('poscocina_tablet_kitchen_printer', next);
          toast.success('Impresora asignada como predeterminada de cocina para esta tablet');
        } else {
          localStorage.removeItem('poscocina_tablet_kitchen_printer');
          toast.info('Se desvinculó como predeterminada');
        }
      }
    } catch (e) {
      console.warn('Error al guardar impresora predeterminada en localStorage', e);
    }
  };

  const savePrinter = async (data: PrinterFormData & { isTabletDefault?: boolean }) => {
    if (!selectedBranchId) {
      toast.error('Selecciona una sede para registrar la impresora');
      return;
    }
    try {
      const saved = await settingsApi.savePrinter(selectedBranchId, data, editingPrinter?.id);
      if (data.isTabletDefault && saved?.id) {
        setTabletDefaultPrinter(saved.id, data.station === 'cashier' ? 'cashier' : 'kitchen');
      }
      toast.success(editingPrinter ? 'Impresora actualizada' : 'Impresora registrada');
      setIsModalOpen(false);
      fetchPrinters();
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar impresora');
    }
  };

  const deletePrinter = async (id: string) => {
    try {
      await settingsApi.deletePrinter(id);
      if (tabletCashierPrinterId === id) {
        setTabletCashierPrinterId(null);
        localStorage.removeItem('poscocina_tablet_cashier_printer');
      }
      if (tabletKitchenPrinterId === id) {
        setTabletKitchenPrinterId(null);
        localStorage.removeItem('poscocina_tablet_kitchen_printer');
      }
      toast.success('Impresora eliminada');
      fetchPrinters();
    } catch {
      toast.error('Error al eliminar impresora');
    }
  };

  const testPrint = async (printer: PrinterDevice) => {
    if (!selectedBranchId) return;
    setTestingId(printer.id);
    const res = await settingsApi.testPrint(selectedBranchId, printer.id);
    setTestResult(res);
    setTestingId(null);
    setTimeout(() => setTestResult(null), 5000);
  };

  return {
    venues,
    selectedBranchId,
    setSelectedBranchId,
    printers,
    isModalOpen,
    editingPrinter,
    testingId,
    testResult,
    tabletCashierPrinterId,
    tabletKitchenPrinterId,
    setTabletDefaultPrinter,
    openNewPrinter,
    openEditPrinter,
    closeModal: () => setIsModalOpen(false),
    savePrinter,
    deletePrinter,
    testPrint,
  };
};
