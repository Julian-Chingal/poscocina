import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Supplier } from '../types/inventory.types';

interface Props {
  supplierId: string;
  invoiceNumber: string;
  status: 'received' | 'draft';
  suppliers: Supplier[];
  onSupplierChange: (id: string) => void;
  onInvoiceNumberChange: (val: string) => void;
  onStatusChange: (status: 'received' | 'draft') => void;
}

export const PurchaseMetaFields: React.FC<Props> = ({
  supplierId,
  invoiceNumber,
  status,
  suppliers,
  onSupplierChange,
  onInvoiceNumberChange,
  onStatusChange,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor: *</label>
        <select
          required
          value={supplierId}
          onChange={(e) => onSupplierChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="">-- Seleccionar Proveedor --</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.documentNumber})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Número Factura: *</label>
        <input
          type="text"
          required
          placeholder="FAC-99214"
          value={invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onStatusChange('received')}
        className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 cursor-pointer ${
          status === 'received'
            ? 'bg-emerald-600 border-emerald-500 text-white shadow'
            : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Recibir Ahora (Actualiza CPP)</span>
      </button>
      <button
        type="button"
        onClick={() => onStatusChange('draft')}
        className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 cursor-pointer ${
          status === 'draft'
            ? 'bg-amber-600 border-amber-500 text-white shadow'
            : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Guardar Borrador (Pendiente)</span>
      </button>
    </div>
  </div>
);
