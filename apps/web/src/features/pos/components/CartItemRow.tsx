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
    <Card className="p-2.5 bg-muted/30 rounded-xl border border-border space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <h5 className="text-xs font-bold text-foreground leading-snug">{item.product.name}</h5>
          <span className="text-[10px] font-mono text-muted-foreground">
            ${(unitPrice + modsDelta).toLocaleString()} c/u
          </span>
        </div>
        <span className="text-xs font-black font-mono text-primary">
          ${lineTotal.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/60">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onUpdateQuantity(index, -1)}
            className="h-6 w-6 rounded bg-muted hover:bg-muted/80 text-foreground p-0"
          >
            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
          </Button>
          <span className="w-6 text-center text-xs font-bold text-foreground font-mono">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onUpdateQuantity(index, 1)}
            className="h-6 w-6 rounded bg-muted hover:bg-muted/80 text-foreground p-0"
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
            item.notes ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
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
          className="h-7 text-[11px] rounded-lg bg-background"
        />
      )}
    </Card>
  );
};

export default CartItemRow;
