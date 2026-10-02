import React from 'react';
import { ListChecks, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ItemsSelectionListProps {
  items: any[];
  selectedItemIds: string[];
  onToggleItem: (itemId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const ItemsSelectionList: React.FC<ItemsSelectionListProps> = ({
  items,
  selectedItemIds,
  onToggleItem,
  onSelectAll,
  onClearAll,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
        No hay ítems registrados en la comanda para dividir.
      </div>
    );
  }

  const selectedCount = selectedItemIds.length;
  const allSelected = selectedCount === items.length && items.length > 0;

  return (
    <Card className="p-3 bg-muted/20 border-border/70 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <ListChecks className="size-4 text-primary" />
          <span>Seleccionar ítems a cobrar en esta parte:</span>
          <Badge variant="outline" className="text-[10px] ml-1">
            {selectedCount} de {items.length} seleccionados
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={allSelected ? onClearAll : onSelectAll}
            className="h-6 px-2 text-[10px] font-semibold"
          >
            {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => {
          const isSelected = selectedItemIds.includes(item.id);
          const unitPrice = parseFloat(item.unitPrice || '0');
          const qty = item.quantity || 1;
          const lineTotal = unitPrice * qty;

          return (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer select-none transition-colors ${
                isSelected
                  ? 'bg-primary/10 border-primary text-foreground font-medium'
                  : 'bg-background/80 border-border/70 text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`size-4 rounded flex items-center justify-center border shrink-0 ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/40 bg-background'
                  }`}
                >
                  {isSelected && <Check className="size-3" />}
                </div>

                <div className="truncate">
                  <span className="font-semibold text-foreground">
                    {qty}x {item.product?.name || 'Producto'}
                  </span>
                  {item.notes && (
                    <span className="text-[10px] text-muted-foreground ml-1.5 italic">
                      ({item.notes})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0 font-mono font-bold text-foreground pl-2">
                ${lineTotal.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
