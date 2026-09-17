import React from 'react';
import { Receipt } from 'lucide-react';
import { Purchase } from '../types/inventory.types';

interface Props {
  purchase: Purchase | null;
  onClose: () => void;
}

export const PurchaseDetailModal: React.FC<Props> = ({ purchase, onClose }) => {
  if (!purchase) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Factura #{purchase.invoiceNumber}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proveedor: {purchase.supplier?.name} (NIT: {purchase.supplier?.documentNumber})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Insumo</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Costo Unitario</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {purchase.items?.map((it) => (
                <tr key={it.id}>
                  <td className="p-3 font-semibold text-white">
                    {it.inventoryItem?.name || 'Insumo'}
                  </td>
                  <td className="p-3 font-mono">
                    {parseFloat(it.quantity).toLocaleString()} {it.inventoryItem?.unit}
                  </td>
                  <td className="p-3 font-mono">
                    ${parseFloat(it.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400 text-right">
                    ${parseFloat(it.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Estado: </span>
            <span className="font-bold text-white uppercase">{purchase.status}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 mr-2">Total Compra:</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              ${parseFloat(purchase.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
