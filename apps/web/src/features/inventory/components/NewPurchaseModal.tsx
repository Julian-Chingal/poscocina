import React, { useState } from 'react';
import { Receipt, Plus } from 'lucide-react';
import { Supplier, InventoryItem } from '../types/inventory.types';
import { PurchaseLineRow } from './PurchaseLineRow';
import { PurchaseMetaFields } from './PurchaseMetaFields';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="2xl" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span>Registrar Factura de Compra de Insumos</span>
          </DialogTitle>
        </DialogHeader>

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

          <div className="border border-border rounded-xl p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Insumos Comprados
              </h4>
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  setLines([
                    ...lines,
                    { inventoryItemId: items[0]?.id || '', quantity: '1', unitCost: '0' },
                  ])
                }
                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center space-x-1 h-7 px-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Fila</span>
              </Button>
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

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground">Total Factura:</span>
              <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Input
            type="text"
            placeholder="Observaciones / Notas de Entrega (Ej. Camión placas XYZ-123)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-10 rounded-xl"
          />

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Factura'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPurchaseModal;
