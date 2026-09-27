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
    <Card className="p-3 bg-muted/25 hover:bg-muted/40 rounded-xl border border-border/70 space-y-2.5 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h5 className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate">
            {item.product.name}
          </h5>
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
            ${(unitPrice + modsDelta).toLocaleString()} c/u
          </span>

          {item.modifiers && item.modifiers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.modifiers.map((mod, mIdx) => {
                const modName =
                  mod.name ||
                  item.product.modifierGroups
                    ?.flatMap((g) => g.modifiers || [])
                    .find((m) => m.id === mod.modifierId)?.name ||
                  'Adición';
                return (
                  <span
                    key={`${mod.modifierId}-${mIdx}`}
                    className="inline-flex items-center text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md font-medium"
                  >
                    +{modName}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <span className="text-xs sm:text-sm font-extrabold font-mono tabular-nums text-primary shrink-0">
          ${lineTotal.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
        <div className="flex items-center space-x-1.5">
          <Button
            variant="secondary"
            size="icon"
            type="button"
            onClick={() => onUpdateQuantity(index, -1)}
            aria-label="Disminuir cantidad"
            className="size-7 sm:size-8 rounded-lg text-foreground hover:bg-muted active:scale-95 transition-transform"
          >
            {item.quantity === 1 ? (
              <Trash2 className="size-3.5 text-destructive" strokeWidth={2} />
            ) : (
              <Minus className="size-3.5" strokeWidth={2.5} />
            )}
          </Button>
          <span className="w-7 text-center text-xs sm:text-sm font-bold text-foreground font-mono tabular-nums select-none">
            {item.quantity}
          </span>
          <Button
            variant="secondary"
            size="icon"
            type="button"
            onClick={() => onUpdateQuantity(index, 1)}
            aria-label="Aumentar cantidad"
            className="size-7 sm:size-8 rounded-lg text-foreground hover:bg-muted active:scale-95 transition-transform"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setShowNotesInput(!showNotesInput)}
          className={`h-7 px-2 text-[11px] rounded-lg flex items-center gap-1.5 transition-colors ${
            item.notes
              ? 'text-primary font-bold bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <FileText className="size-3" />
          <span>{item.notes ? 'Editar nota' : '+ Nota'}</span>
        </Button>
      </div>

      {showNotesInput && (
        <Input
          type="text"
          placeholder="Nota para cocina (ej. sin cebolla, término medio)..."
          value={item.notes}
          onChange={(e) => onUpdateNotes(index, e.target.value)}
          className="h-8 text-xs rounded-lg bg-background border-border/80 focus-visible:ring-primary shadow-2xs"
          autoFocus
        />
      )}
    </Card>
  );
};

export default CartItemRow;
