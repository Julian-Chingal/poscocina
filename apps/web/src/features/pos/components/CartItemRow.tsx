import React, { useState } from 'react';
import { Plus, Minus, Trash2, FileText, SlidersHorizontal } from 'lucide-react';
import { CartItem } from '../types/pos.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Props {
  item: CartItem;
  index: number;
  onUpdateQuantity: (index: number, delta: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onCustomizeItem?: (index: number) => void;
}

export const CartItemRow: React.FC<Props> = ({
  item,
  index,
  onUpdateQuantity,
  onUpdateNotes,
  onCustomizeItem,
}) => {
  const [showNotesInput, setShowNotesInput] = useState(Boolean(item.notes));
  const unitPrice = parseFloat(item.product.price || '0');
  const modsDelta = item.modifiers?.reduce((acc, m) => acc + (m.priceDelta || 0), 0) || 0;
  const lineTotal = (unitPrice + modsDelta) * item.quantity;
  const hasModifiersInProduct = Boolean(
    item.product.modifierGroups && item.product.modifierGroups.length > 0
  );
  const hasSelectedModifiers = Boolean(item.modifiers && item.modifiers.length > 0);

  return (
    <Card className="p-3 sm:p-3.5 bg-muted/25 hover:bg-muted/40 rounded-xl border border-border/70 space-y-2.5 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h5 className="text-sm sm:text-base font-bold text-foreground leading-snug whitespace-normal break-words">
            {item.product.name}
          </h5>
          <span className="text-xs font-mono tabular-nums text-muted-foreground mt-0.5 block">
            ${(unitPrice + modsDelta).toLocaleString()} c/u
          </span>

          {hasSelectedModifiers && (
            <div className="flex flex-wrap gap-1.5 mt-2">
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
                    className="inline-flex items-center text-xs bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded-md font-semibold whitespace-normal break-words"
                  >
                    +{modName}
                    {mod.priceDelta > 0 && ` (+$${mod.priceDelta.toLocaleString()})`}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-primary shrink-0 pt-0.5">
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

        <div className="flex items-center gap-1.5">
          {(hasModifiersInProduct || hasSelectedModifiers) && onCustomizeItem && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onCustomizeItem(index)}
              className={`h-7 px-2 text-[11px] rounded-lg flex items-center gap-1 transition-colors ${
                hasSelectedModifiers
                  ? 'text-primary font-bold bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <SlidersHorizontal className="size-3" />
              <span>{hasSelectedModifiers ? 'Toppings' : '+ Toppings'}</span>
            </Button>
          )}

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
            <span>{item.notes ? 'Nota' : '+ Nota'}</span>
          </Button>
        </div>
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
