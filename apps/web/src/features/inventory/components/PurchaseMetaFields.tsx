import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Supplier } from '../types/inventory.types';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/common/native-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-foreground">Proveedor: *</Label>
        <Select
          required
          value={supplierId}
          onChange={(e) => onSupplierChange(e.target.value)}
          className="h-9 text-xs"
        >
          <option value="">-- Seleccionar Proveedor --</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.documentNumber})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-foreground">Número Factura: *</Label>
        <Input
          type="text"
          required
          placeholder="FAC-99214"
          value={invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
          className="h-9 text-xs font-mono"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="ghost"
        onClick={() => onStatusChange('received')}
        className={`h-9 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 cursor-pointer ${
          status === 'received'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow hover:bg-emerald-500/25'
            : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Recibir Ahora (Actualiza CPP)</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onStatusChange('draft')}
        className={`h-9 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 cursor-pointer ${
          status === 'draft'
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400 shadow hover:bg-amber-500/25'
            : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Guardar Borrador (Pendiente)</span>
      </Button>
    </div>
  </div>
);
