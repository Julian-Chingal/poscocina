import React from 'react';
import { Search, Plus, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';

interface Props {
  items: InventoryItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewItemModal: () => void;
  onOpenMovementModal: (item: InventoryItem) => void;
}

export const StockTable: React.FC<Props> = ({
  items,
  searchQuery,
  onSearchChange,
  onOpenNewItemModal,
  onOpenMovementModal,
}) => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        <input
          type="text"
          placeholder="Buscar insumo por nombre..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <button
        type="button"
        onClick={onOpenNewItemModal}
        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-600/20"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Insumo</span>
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Insumo</th>
            <th className="py-3 px-4">Unidad</th>
            <th className="py-3 px-4">Stock Actual</th>
            <th className="py-3 px-4">Costo / Unidad</th>
            <th className="py-3 px-4">Estado</th>
            <th className="py-3 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {items.map((item) => {
            const current = parseFloat(item.currentStock || '0');
            const threshold = parseFloat(item.alertThreshold || '0');
            const isLow = current <= threshold;

            return (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{item.unit}</td>
                <td className="py-3 px-4 font-mono font-bold text-white">{current}</td>
                <td className="py-3 px-4 font-mono text-slate-300">
                  ${parseFloat(item.costPerUnit || '0').toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  {isLow ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/40">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Stock Crítico</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      <span>Disponible</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenMovementModal(item)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition cursor-pointer border border-slate-700"
                  >
                    <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                    <span>Ajustar</span>
                  </button>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                No hay insumos registrados en el inventario.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
