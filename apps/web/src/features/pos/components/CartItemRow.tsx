import React, { useState } from 'react';
import { Plus, Minus, Trash2, FileText } from 'lucide-react';
import { CartItem } from '../types/pos.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Props {
  item: CartItem;
  index: number;
  onUpdateQuantity: (index: number, delta: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
}

export const CartItemRow: React.FC<Props> = ({
  item,
  index,
  onUpdateQuantity,
  onUpdateNotes,
}) => {
  const [showNotesInput, setShowNotesInput] = useState(Boolean(item.notes));
  const unitPrice = parseFloat(item.product.price || '0');
  const modsDelta = item.modifiers?.reduce((acc, m) => acc + (m.priceDelta || 0), 0) || 0;
  const lineTotal = (unitPrice + modsDelta) * item.quantity;

  return (
    <Card className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <h5 className="text-xs font-bold text-white leading-snug">{item.product.name}</h5>
          <span className="text-[10px] font-mono text-slate-400">
            ${(unitPrice + modsDelta).toLocaleString()} c/u
          </span>
        </div>
        <span className="text-xs font-black font-mono text-orange-400">
          ${lineTotal.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onUpdateQuantity(index, -1)}
            className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 p-0"
          >
            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-400" /> : <Minus className="w-3 h-3" />}
          </Button>
          <span className="w-6 text-center text-xs font-bold text-white font-mono">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onUpdateQuantity(index, 1)}
            className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setShowNotesInput(!showNotesInput)}
          className={`h-6 px-1 text-[10px] flex items-center space-x-1 ${
            item.notes ? 'text-orange-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileText className="w-3 h-3" />
          <span>{item.notes ? 'Ver nota' : 'Nota'}</span>
        </Button>
      </div>

      {showNotesInput && (
        <Input
          type="text"
          placeholder="Nota para cocina (ej. sin cebolla)"
          value={item.notes}
          onChange={(e) => onUpdateNotes(index, e.target.value)}
          className="h-7 text-[11px] rounded-lg bg-slate-950"
        />
      )}
    </Card>
  );
};

export default CartItemRow;
