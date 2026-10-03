import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Supplier } from '../types/inventory.types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
          value={supplierId || 'none'}
          onValueChange={(val) => onSupplierChange(val === 'none' ? '' : val)}
        >
          <SelectTrigger className="h-9 text-xs rounded-xl bg-card">
            <SelectValue placeholder="-- Seleccionar Proveedor --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Seleccionar Proveedor --</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.documentNumber})
              </SelectItem>
            ))}
          </SelectContent>
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
          className="h-9 text-xs font-mono rounded-xl bg-card"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant={status === 'received' ? 'default' : 'outline'}
        onClick={() => onStatusChange('received')}
        className={`h-9 text-xs font-medium cursor-pointer rounded-xl ${
          status === 'received'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            : 'text-muted-foreground'
        }`}
      >
        <CheckCircle className="w-3.5 h-3.5 mr-1" />
        Ingreso Directo a Inventario
      </Button>
      <Button
        type="button"
        variant={status === 'draft' ? 'default' : 'outline'}
        onClick={() => onStatusChange('draft')}
        className={`h-9 text-xs font-medium cursor-pointer rounded-xl ${
          status === 'draft'
            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
            : 'text-muted-foreground'
        }`}
      >
        <Clock className="w-3.5 h-3.5 mr-1" />
        Guardar como Borrador
      </Button>
    </div>
  </div>
);

export default PurchaseMetaFields;
