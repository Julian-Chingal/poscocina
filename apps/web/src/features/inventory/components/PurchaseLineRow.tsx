import React from 'react';
import { Trash2 } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    <Card className="flex flex-row items-center space-x-2 bg-muted/40 p-2 rounded-xl border-border text-xs">
      <div className="flex-1">
        <Select
          value={line.inventoryItemId || 'none'}
          onValueChange={(val) => onUpdate(index, 'inventoryItemId', val === 'none' ? '' : val)}
        >
          <SelectTrigger className="h-8 text-xs rounded-lg bg-background">
            <SelectValue placeholder="-- Insumo --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Insumo --</SelectItem>
            {items.map((it) => (
              <SelectItem key={it.id} value={it.id}>
                {it.name} ({it.unit})
              </SelectItem>
            ))}
          </SelectContent>
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
        placeholder="Costo U."
        value={line.unitCost}
        onChange={(e) => onUpdate(index, 'unitCost', e.target.value)}
        className="w-24 h-8 font-mono text-xs"
      />
      <div className="w-24 text-right font-mono font-bold text-foreground">
        ${subtotal.toLocaleString('es-CO')}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canRemove}
        onClick={() => onRemove(index)}
        className="text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </Card>
  );
};

export default PurchaseLineRow;
