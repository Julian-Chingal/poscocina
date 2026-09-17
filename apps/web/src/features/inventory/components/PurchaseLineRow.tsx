import React from 'react';
import { Trash2 } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';

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
    <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
      <select
        value={line.inventoryItemId}
        onChange={(e) => onUpdate(index, 'inventoryItemId', e.target.value)}
        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none"
      >
        <option value="">-- Insumo --</option>
        {items.map((it) => (
          <option key={it.id} value={it.id}>
            {it.name} ({it.unit})
          </option>
        ))}
      </select>
      <input
        type="number"
        step="any"
        placeholder="Cant"
        value={line.quantity}
        onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
      />
      <input
        type="number"
        step="any"
        placeholder="Costo"
        value={line.unitCost}
        onChange={(e) => onUpdate(index, 'unitCost', e.target.value)}
        className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
      />
      <div className="w-24 text-right font-mono font-bold text-emerald-400">
        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
