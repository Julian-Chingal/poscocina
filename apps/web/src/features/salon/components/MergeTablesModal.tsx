import React from 'react';
import { GitMerge, X, AlertTriangle } from 'lucide-react';
import { TableItem } from '../types/salon.types';

interface Props {
  sourceTable: TableItem | null;
  tables: TableItem[];
  selectedTargetTableId: string;
  actionLoading: boolean;
  actionError: string | null;
  onClose: () => void;
  onTargetTableChange: (id: string) => void;
  onConfirm: () => Promise<void>;
}

export const MergeTablesModal: React.FC<Props> = ({
  sourceTable,
  tables,
  selectedTargetTableId,
  actionLoading,
  actionError,
  onClose,
  onTargetTableChange,
  onConfirm,
}) => {
  if (!sourceTable) return null;

  const occupiedTables = tables.filter(
    (t) =>
      t.id !== sourceTable.id &&
      (t.status === 'occupied' || t.status === 'check_requested')
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase mb-1">
          <GitMerge className="w-4 h-4" />
          <span>Operación de Sala</span>
        </div>
        <h3 className="text-xl font-black text-white">Unir Mesas (Fusión)</h3>
        <p className="text-xs text-slate-400 mb-5">
          Todos los ítems de <strong className="text-white">{sourceTable.label}</strong> se transferirán a la mesa seleccionada, liberando luego la mesa origen.
        </p>

        {actionError && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl mb-4">
            {actionError}
          </div>
        )}

        {occupiedTables.length === 0 ? (
          <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center text-slate-400 text-xs">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <span>No hay otras mesas ocupadas para fusionar.</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Selecciona la Mesa Destino Principal:
              </label>
              <select
                value={selectedTargetTableId}
                onChange={(e) => onTargetTableChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Elige la mesa receptora --</option>
                {occupiedTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} (Orden activa)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedTargetTableId || actionLoading}
                onClick={onConfirm}
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow cursor-pointer disabled:bg-slate-800 disabled:text-slate-600 flex items-center space-x-1.5"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>{actionLoading ? 'Uniendo...' : 'Confirmar Fusión'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
