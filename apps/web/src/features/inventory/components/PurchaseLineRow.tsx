import React from 'react';
import { Trash2 } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { Select } from '@/components/common/native-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LineItem {
  inventoryItemId: string;
  quantity: string;
  unitCost: string;
}

interface Props {
  index: number;
  line: LineItem;
  items: InventoryItem[];
  canRemove: boolean;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

export const PurchaseLineRow: React.FC<Props> = ({
  index,
  line,
  items,
  canRemove,
  onUpdate,
  onRemove,
}) => {
  const subtotal = (parseFloat(line.quantity) || 0) * (parseFloat(line.unitCost) || 0);

  return (
    <Card className="flex flex-row items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border-slate-800 text-xs">
      <div className="flex-1">
        <Select
          value={line.inventoryItemId}
          onChange={(e) => onUpdate(index, 'inventoryItemId', e.target.value)}
          className="h-8 text-xs"
        >
          <option value="">-- Insumo --</option>
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name} ({it.unit})
            </option>
          ))}
        </Select>
      </div>
      <Input
        type="number"
        step="any"
        placeholder="Cant"
        value={line.quantity}
        onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
        className="w-20 h-8 font-mono text-xs"
      />
      <Input
        type="number"
        step="any"
        placeholder="Costo"
        value={line.unitCost}
        onChange={(e) => onUpdate(index, 'unitCost', e.target.value)}
        className="w-24 h-8 font-mono text-xs"
      />
      <div className="w-24 text-right font-mono font-bold text-emerald-400">
        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          className="h-7 w-7 text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </Card>
  );
};
