import React from 'react';
import { Award } from 'lucide-react';
import { TopProduct } from '../types/reports.types';
import { formatCurrency } from '../utils/formatCurrency';

interface TopProductsTableProps {
  topProducts: TopProduct[];
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ topProducts }) => {
  return (
    <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Top 10 Productos Más Vendidos</h3>
            <p className="text-[11px] text-slate-400">Platos y bebidas con mayor volumen e ingresos brutos</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Producto</th>
              <th className="py-2.5 px-3">Categoría</th>
              <th className="py-2.5 px-3 text-right">Precio Unit.</th>
              <th className="py-2.5 px-3 text-center">Cant. Vendida</th>
              <th className="py-2.5 px-3 text-right">Total Ingresos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Sin movimientos de venta registrados en este periodo
                </td>
              </tr>
            ) : (
              topProducts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-bold text-amber-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(p.price)}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-amber-300">{p.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                    {formatCurrency(p.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
