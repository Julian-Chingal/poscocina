import React, { useState } from 'react';
import { Plus, Minus, Trash2, FileText, SlidersHorizontal } from 'lucide-react';
import { CartItem } from '../types/pos.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="p-3 bg-card hover:bg-card/90 rounded-xl border border-border/80 space-y-2.5 transition-all shadow-2xs">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <h5 className="text-xs sm:text-sm font-bold text-foreground leading-snug break-words">
            {item.product.name}
          </h5>
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground mt-0.5 block">
            ${(unitPrice + modsDelta).toLocaleString()} c/u
          </span>

          {/* Selected Modifiers Pills */}
          {hasSelectedModifiers && (
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
                    className="inline-flex items-center text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded-md font-semibold"
                  >
                    +{modName}
                    {mod.priceDelta > 0 && ` (+$${mod.priceDelta.toLocaleString()})`}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-black font-mono tabular-nums text-primary block">
            ${lineTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Row: Stepper & Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
        <div className="flex items-center space-x-1 bg-muted/40 p-0.5 rounded-lg border border-border/60">
          <button
            type="button"
            onClick={() => onUpdateQuantity(index, -1)}
            aria-label="Disminuir cantidad"
            className="size-6 sm:size-7 rounded-md text-foreground hover:bg-muted active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            {item.quantity === 1 ? (
              <Trash2 className="size-3 text-destructive" strokeWidth={2} />
            ) : (
              <Minus className="size-3" strokeWidth={2.5} />
            )}
          </button>
          <span className="w-6 text-center text-xs font-bold text-foreground font-mono tabular-nums select-none">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(index, 1)}
            aria-label="Aumentar cantidad"
            className="size-6 sm:size-7 rounded-md text-foreground hover:bg-muted active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            <Plus className="size-3" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(hasModifiersInProduct || hasSelectedModifiers) && onCustomizeItem && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onCustomizeItem(index)}
              className={`h-6.5 px-2 text-[10px] rounded-lg flex items-center gap-1 transition-colors ${
                hasSelectedModifiers
                  ? 'text-primary font-bold bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Personalizar adiciones y opciones"
            >
              <SlidersHorizontal className="size-3" />
              <span>{hasSelectedModifiers ? 'Opciones' : '+ Opciones'}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setShowNotesInput(!showNotesInput)}
            className={`h-6.5 px-2 text-[10px] rounded-lg flex items-center gap-1 transition-colors ${
              item.notes
                ? 'text-primary font-bold bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Añadir nota o instrucción para cocina"
          >
            <FileText className="size-3" />
            <span>{item.notes ? 'Nota' : '+ Nota'}</span>
          </Button>
        </div>
      </div>

      {/* Expandable Kitchen Note Input */}
      {showNotesInput && (
        <div className="pt-1">
          <Input
            type="text"
            placeholder="Nota para cocina (ej. sin cebolla, término medio)..."
            value={item.notes}
            onChange={(e) => onUpdateNotes(index, e.target.value)}
            className="h-7 text-xs rounded-lg bg-background border-border/80 focus-visible:ring-primary shadow-2xs placeholder:text-muted-foreground/70"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default CartItemRow;
