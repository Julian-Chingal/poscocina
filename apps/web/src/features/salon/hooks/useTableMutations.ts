import { useState } from 'react';
import { salonApi } from '../api/salon.api';
import { TableItem, TableFormData } from '../types/salon.types';
import { toast } from '@/components/ui/sonner';

export const useTableMutations = (
  venueId: string,
  onSuccess: () => void
) => {
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TableItem | null>(null);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateTable = () => {
    setEditingTable(null);
    setFormError(null);
    setShowTableModal(true);
  };

  const openEditTable = (table: TableItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTable(table);
    setFormError(null);
    setShowTableModal(true);
  };

  const saveTable = async (formData: TableFormData) => {
    if (!formData.label.trim()) {
      setFormError('La etiqueta o número de mesa es obligatoria.');
      return;
    }
    if (!editingTable && !formData.floorPlanId) {
      setFormError('Debes seleccionar o tener al menos una zona/plano de salón.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = editingTable
        ? {
            floorPlanId: formData.floorPlanId || undefined,
            label: formData.label.trim(),
            capacity: Number(formData.capacity),
            shape: formData.shape,
            status: formData.status,
          }
        : {
            floorPlanId: formData.floorPlanId,
            label: formData.label.trim(),
            capacity: Number(formData.capacity),
            shape: formData.shape,
          };

      if (editingTable) {
        await salonApi.updateTable(editingTable.id, payload);
        toast.success('Mesa actualizada correctamente');
      } else {
        await salonApi.createTable(payload);
        toast.success('Mesa creada correctamente');
      }

      setShowTableModal(false);
      onSuccess();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al guardar mesa';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTable = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await salonApi.deleteTable(deleteTarget.id);
      toast.success('Mesa eliminada correctamente');
      setDeleteTarget(null);
      onSuccess();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'No se pudo eliminar mesa';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const createFloorPlan = async (name: string) => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      const created = await salonApi.createFloorPlan(venueId, name.trim());
      setShowFloorPlanModal(false);
      toast.success('Zona creada exitosamente');
      onSuccess();
      return created;
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al crear zona';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    showTableModal,
    editingTable,
    deleteTarget,
    showFloorPlanModal,
    submitting,
    formError,
    setShowTableModal,
    setDeleteTarget,
    setShowFloorPlanModal,
    openCreateTable,
    openEditTable,
    saveTable,
    confirmDeleteTable,
    createFloorPlan,
  };
};
