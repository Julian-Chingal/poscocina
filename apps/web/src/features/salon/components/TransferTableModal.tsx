import React from 'react';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TableItem, FloorPlanItem } from '../types/salon.types';

interface Props {
  sourceTable: TableItem | null;
  tables: TableItem[];
  floorPlans: FloorPlanItem[];
  targetZone: string;
  selectedTargetTableId: string;
  actionLoading: boolean;
  actionError: string | null;
  onClose: () => void;
  onZoneChange: (zone: string) => void;
  onTargetTableChange: (id: string) => void;
  onConfirm: () => Promise<void>;
}

export const TransferTableModal: React.FC<Props> = ({
  sourceTable,
  tables,
  floorPlans,
  targetZone,
  selectedTargetTableId,
  actionLoading,
  actionError,
  onClose,
  onZoneChange,
  onTargetTableChange,
  onConfirm,
}) => {
  if (!sourceTable) return null;

  const freeTables = tables.filter(
    (t) =>
      t.id !== sourceTable.id &&
      t.status === 'free' &&
      (targetZone === 'all' || t.floorPlanId === targetZone)
  );

  return (
    <Dialog open={Boolean(sourceTable)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase mb-1">
          <ArrowRightLeft className="w-4 h-4" />
          <span>Operación de Sala</span>
        </div>
        <DialogTitle>Cambiar de Mesa</DialogTitle>
        <DialogDescription className="mb-5">
          Trasladar la orden activa de <strong className="text-white">{sourceTable.label}</strong> hacia una mesa disponible.
        </DialogDescription>

        {actionError && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl mb-4">
            {actionError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Filtrar por Zona o Salón:</label>
            <select
              value={targetZone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 mb-3"
            >
              <option value="all">Todas las Zonas ({floorPlans.length})</option>
              {floorPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>

          {freeTables.length === 0 ? (
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center text-slate-400 text-xs">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1.5 text-amber-400" />
              <span>No hay mesas libres disponibles en la zona seleccionada.</span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selecciona la Mesa Destino (Libre):</label>
              <select
                value={selectedTargetTableId}
                onChange={(e) => onTargetTableChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Elige una mesa libre --</option>
                {freeTables.map((t) => {
                  const plan = floorPlans.find((p) => p.id === t.floorPlanId);
                  return (
                    <option key={t.id} value={t.id}>
                      [{plan ? plan.name : 'Zona'}] {t.label} (Cap: {t.capacity} personas)
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer">
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedTargetTableId || actionLoading}
              onClick={onConfirm}
              className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow cursor-pointer disabled:bg-slate-800 disabled:text-slate-600 flex items-center space-x-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Trasladando...' : 'Confirmar Traslado'}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
