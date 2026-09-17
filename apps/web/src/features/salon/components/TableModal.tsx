import React, { useState, useEffect } from 'react';
import { Users, X, AlertTriangle } from 'lucide-react';
import { TableItem, TableFormData, FloorPlanItem } from '../types/salon.types';
import { TableShapeCapacityFields } from './TableShapeCapacityFields';

interface Props {
  isOpen: boolean;
  editingTable: TableItem | null;
  floorPlans: FloorPlanItem[];
  defaultFloorPlanId: string;
  totalTables: number;
  submitting: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (formData: TableFormData) => Promise<void>;
}

export const TableModal: React.FC<Props> = ({
  isOpen,
  editingTable,
  floorPlans,
  defaultFloorPlanId,
  totalTables,
  submitting,
  formError,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<TableFormData>({
    label: '',
    floorPlanId: '',
    capacity: 4,
    shape: 'rect',
    status: 'free',
  });

  useEffect(() => {
    if (editingTable) {
      setForm({
        label: editingTable.label,
        floorPlanId: editingTable.floorPlanId || floorPlans[0]?.id || '',
        capacity: editingTable.capacity || 4,
        shape: editingTable.shape || 'rect',
        status: editingTable.status,
      });
    } else {
      setForm({
        label: `Mesa ${totalTables + 1}`,
        floorPlanId: defaultFloorPlanId !== 'all' ? defaultFloorPlanId : floorPlans[0]?.id || '',
        capacity: 4,
        shape: 'rect',
        status: 'free',
      });
    }
  }, [editingTable, defaultFloorPlanId, floorPlans, totalTables, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{editingTable ? 'Editar Mesa' : 'Nueva Mesa'}</span>
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Mesa *</label>
            <input
              type="text"
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ej. Mesa 5, Barra 2"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {!editingTable && floorPlans.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Zona o Salón *</label>
              <select
                required
                value={form.floorPlanId}
                onChange={(e) => setForm({ ...form, floorPlanId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {floorPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
          )}

          <TableShapeCapacityFields
            capacity={form.capacity}
            shape={form.shape}
            onCapacityChange={(cap) => setForm({ ...form, capacity: cap })}
            onShapeChange={(sh) => setForm({ ...form, shape: sh })}
          />

          {editingTable && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estado Actual</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TableItem['status'] })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="free">Libre</option>
                <option value="occupied">Ocupada</option>
                <option value="check_requested">Pidiendo Cuenta</option>
                <option value="reserved">Reservada</option>
                <option value="blocked">Bloqueada</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow cursor-pointer disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Guardar Mesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
