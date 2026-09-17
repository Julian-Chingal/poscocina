import React from 'react';
import { Receipt, CheckCircle, Clock, Eye, Plus } from 'lucide-react';
import { Purchase } from '../types/inventory.types';

interface Props {
  purchases: Purchase[];
  onOpenNewPurchase: () => void;
  onSelectPurchaseDetail: (purchase: Purchase) => void;
  onReceivePurchase: (purchaseId: string) => void;
}

export const PurchasesTab: React.FC<Props> = ({
  purchases,
  onOpenNewPurchase,
  onSelectPurchaseDetail,
  onReceivePurchase,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onOpenNewPurchase}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Factura de Compra</span>
        </button>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Factura / Remisión</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total Factura</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {purchases.map((purchase) => {
                const total = parseFloat(purchase.totalAmount || '0');
                return (
                  <tr key={purchase.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{purchase.invoiceNumber}</span>
                    </td>
                    <td className="p-4 text-slate-200">
                      <div className="font-medium">{purchase.supplier?.name || 'Proveedor no disponible'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {purchase.supplier?.documentType}: {purchase.supplier?.documentNumber}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      {purchase.status === 'received' ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>Recibida (Stock Actualizado)</span>
                        </span>
                      ) : purchase.status === 'draft' ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>Borrador (Pendiente)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2.5 py-0.5 rounded-full">
                          <span>Cancelada</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectPurchaseDetail(purchase)}
                        className="bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Líneas</span>
                      </button>

                      {purchase.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => onReceivePurchase(purchase.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Recibir Stock</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No se han registrado facturas de compra aún. Haz clic en "Nueva Factura de Compra".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
