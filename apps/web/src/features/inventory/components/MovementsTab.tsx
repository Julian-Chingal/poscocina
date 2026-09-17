import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { InventoryMovement } from '../types/inventory.types';

interface Props {
  movements: InventoryMovement[];
}

export const MovementsTab: React.FC<Props> = ({ movements }) => {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-4">Fecha y Hora</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Insumo</th>
              <th className="p-4">Cantidad</th>
              <th className="p-4">Detalle / Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {movements.map((m) => {
              const movType = m.movementType || m.type;
              const isSale = movType === 'sale' || movType === 'order_consumed';
              const isPurchase = movType === 'purchase';

              return (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {isSale ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Venta (Automático)</span>
                      </span>
                    ) : isPurchase ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        <ArrowDownRight className="w-3 h-3" />
                        <span>Compra / Recepción</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                        <span>Ajuste / Merma</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-white">
                    {m.inventoryItem?.name || m.inventoryItemId}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-200 whitespace-nowrap">
                    {isSale ? '-' : '+'}
                    {parseFloat(m.quantity).toLocaleString()} {m.inventoryItem?.unit || ''}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    {m.notes || '-'}
                  </td>
                </tr>
              );
            })}
            {movements.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No se han registrado movimientos de inventario todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
