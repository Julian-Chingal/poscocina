import React, { useState } from 'react';
import { Receipt, Plus } from 'lucide-react';
import { Supplier, InventoryItem } from '../types/inventory.types';
import { PurchaseLineRow } from './PurchaseLineRow';
import { PurchaseMetaFields } from './PurchaseMetaFields';

interface Props {
  isOpen: boolean;
  suppliers: Supplier[];
  items: InventoryItem[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    supplierId: string;
    invoiceNumber: string;
    status: 'received' | 'draft';
    notes?: string;
    items: Array<{ inventoryItemId: string; quantity: string; unitCost: string }>;
  }) => Promise<void>;
}

export const NewPurchaseModal: React.FC<Props> = ({
  isOpen,
  suppliers,
  items,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState<'received' | 'draft'>('received');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([
    { inventoryItemId: '', quantity: '1', unitCost: '0' },
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ supplierId, invoiceNumber, status, notes, items: lines });
    setSupplierId('');
    setInvoiceNumber('');
    setNotes('');
    setLines([{ inventoryItemId: '', quantity: '1', unitCost: '0' }]);
  };

  const updateLine = (idx: number, field: string, value: string) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    setLines(updated);
  };

  const total = lines.reduce(
    (sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitCost) || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Registrar Factura de Compra de Insumos</span>
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PurchaseMetaFields
            supplierId={supplierId}
            invoiceNumber={invoiceNumber}
            status={status}
            suppliers={suppliers}
            onSupplierChange={setSupplierId}
            onInvoiceNumberChange={setInvoiceNumber}
            onStatusChange={setStatus}
          />

          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Insumos Comprados</h4>
              <button
                type="button"
                onClick={() => setLines([...lines, { inventoryItemId: items[0]?.id || '', quantity: '1', unitCost: '0' }])}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Fila</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {lines.map((line, idx) => (
                <PurchaseLineRow
                  key={idx}
                  index={idx}
                  line={line}
                  items={items}
                  canRemove={lines.length > 1}
                  onUpdate={updateLine}
                  onRemove={(i) => setLines(lines.filter((_, index) => index !== i))}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Total Factura:</span>
              <span className="text-lg font-mono font-black text-emerald-400">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Observaciones / Notas de Entrega (Ej. Camión placas XYZ-123)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
