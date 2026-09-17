import React from 'react';
import { Search, Building2, Plus } from 'lucide-react';
import { Supplier } from '../types/inventory.types';

interface Props {
  suppliers: Supplier[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewSupplier: () => void;
}

export const SuppliersTab: React.FC<Props> = ({
  suppliers,
  searchQuery,
  onSearchChange,
  onOpenNewSupplier,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar proveedor por nombre, NIT o contacto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onOpenNewSupplier}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Razón Social / Proveedor</th>
                <th className="p-4">Documento / NIT</th>
                <th className="p-4">Contacto Directo</th>
                <th className="p-4">Teléfono & Correo</th>
                <th className="p-4">Dirección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white text-sm flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{sup.name}</span>
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-200">
                    <span className="text-slate-500 text-[10px] mr-1">{sup.documentType}</span>
                    <span>{sup.documentNumber}</span>
                  </td>
                  <td className="p-4 text-slate-300">{sup.contactName || '-'}</td>
                  <td className="p-4 text-slate-300">
                    <div>{sup.phone || '-'}</div>
                    <div className="text-[11px] text-slate-500">{sup.email || ''}</div>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">{sup.address || '-'}</td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No se encontraron proveedores registrados.
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
