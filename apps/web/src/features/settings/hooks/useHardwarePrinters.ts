import { useState, useEffect, useCallback } from 'react';
import { useBrandingStore } from '@/stores/branding.store';
import { settingsApi } from '../api/settings.api';
import { PrinterDevice, PrinterFormData, TestPrintResult } from '../types/settings.types';
import { toast } from '@/components/ui/sonner';

export const useHardwarePrinters = () => {
  const venueId = useBrandingStore((s) => s.venueId);
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterDevice | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestPrintResult | null>(null);

  const fetchPrinters = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await settingsApi.getPrinters(venueId);
      setPrinters(data || []);
    } catch {
      toast.error('Error al cargar lista de impresoras');
    }
  }, [venueId]);

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

  const savePrinter = async (data: PrinterFormData) => {
    try {
      await settingsApi.savePrinter(venueId, data, editingPrinter?.id);
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
      toast.success('Impresora eliminada');
      fetchPrinters();
    } catch {
      toast.error('Error al eliminar impresora');
    }
  };

  const testPrint = async (printer: PrinterDevice) => {
    setTestingId(printer.id);
    const res = await settingsApi.testPrint(venueId, printer.id);
    setTestResult(res);
    setTestingId(null);
    setTimeout(() => setTestResult(null), 5000);
  };

  return {
    printers,
    isModalOpen,
    editingPrinter,
    testingId,
    testResult,
    openNewPrinter,
    openEditPrinter,
    closeModal: () => setIsModalOpen(false),
    savePrinter,
    deletePrinter,
    testPrint,
  };
};
