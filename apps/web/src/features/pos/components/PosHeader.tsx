import React from 'react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TableItem } from '../types/pos.types';

interface Props {
  currentTable: TableItem | null;
  allTables: TableItem[];
  isCashShiftOpen: boolean | null;
  waiterName?: string;
  onSelectTable: (table: TableItem) => void;
}

export const PosHeader: React.FC<Props> = ({
  currentTable,
  allTables,
  isCashShiftOpen,
  waiterName,
  onSelectTable,
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-orange-400" />
        <span className="text-xs text-slate-400">Mesa:</span>
        <select
          value={currentTable?.id || ''}
          onChange={(e) => {
            const found = allTables.find((t) => t.id === e.target.value);
            if (found) onSelectTable(found);
          }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none"
        >
          <option value="">Para Llevar / Sin Mesa</option>
          {allTables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} ({t.status === 'occupied' ? 'Ocupada' : 'Libre'})
            </option>
          ))}
        </select>
      </div>

      {waiterName && (
        <span className="text-xs text-slate-400 hidden sm:inline">
          Mesero: <strong className="text-white">{waiterName}</strong>
        </span>
      )}
    </div>

    <div>
      {isCashShiftOpen === false ? (
        <div className="flex items-center space-x-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Caja Cerrada (Turno sin abrir)</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Caja Operativa</span>
        </div>
      )}
    </div>
  </div>
);
