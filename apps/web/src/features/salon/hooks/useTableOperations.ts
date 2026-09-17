import { useState } from 'react';
import { salonApi } from '../api/salon.api';
import { TableItem, FloorPlanItem } from '../types/salon.types';
import { toast } from '@/components/ui/sonner';

export const useTableOperations = (
  tables: TableItem[],
  floorPlans: FloorPlanItem[],
  onSuccess: () => void
) => {
  const [transferSourceTable, setTransferSourceTable] = useState<TableItem | null>(null);
  const [transferTargetZone, setTransferTargetZone] = useState<string>('all');
  const [mergeSourceTable, setMergeSourceTable] = useState<TableItem | null>(null);
  const [selectedTargetTableId, setSelectedTargetTableId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleTransferTable = async () => {
    if (!transferSourceTable || !selectedTargetTableId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const targetTable = tables.find((t) => t.id === selectedTargetTableId);
      const targetPlan = floorPlans.find((p) => p.id === targetTable?.floorPlanId);
      const zoneName = targetPlan?.name || 'otra zona';

      await salonApi.transferTable(transferSourceTable.id, selectedTargetTableId);

      toast.success(`Mesa movida con éxito a ${zoneName}`);
      setTransferSourceTable(null);
      setSelectedTargetTableId('');
      onSuccess();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al transferir mesa';
      setActionError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergeTables = async () => {
    if (!mergeSourceTable || !selectedTargetTableId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await salonApi.mergeTables(mergeSourceTable.id, selectedTargetTableId);

      toast.success('Mesas unidas exitosamente');
      setMergeSourceTable(null);
      setSelectedTargetTableId('');
      onSuccess();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al unir mesas';
      setActionError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    transferSourceTable,
    transferTargetZone,
    mergeSourceTable,
    selectedTargetTableId,
    actionLoading,
    actionError,
    setTransferSourceTable,
    setTransferTargetZone,
    setMergeSourceTable,
    setSelectedTargetTableId,
    handleTransferTable,
    handleMergeTables,
  };
};
