import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Product, Modifier, ModifierGroup } from '../types/pos.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export interface SelectedModifierPayload {
  modifierId: string;
  name: string;
  priceDelta: number;
}

interface Props {
  isOpen: boolean;
  product: Product | null;
  initialModifiers?: SelectedModifierPayload[];
  initialQuantity?: number;
  initialNotes?: string;
  isEditing?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    product: Product;
    quantity: number;
    notes: string;
    modifiers: SelectedModifierPayload[];
  }) => void;
}

export const ProductModifiersModal: React.FC<Props> = ({
  isOpen,
  product,
  initialModifiers = [],
  initialQuantity = 1,
  initialNotes = '',
  isEditing = false,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [notes, setNotes] = useState(initialNotes);
  const [selectedMods, setSelectedMods] = useState<Map<string, SelectedModifierPayload>>(new Map());

  // Reset or initialize state when modal opens or product changes
  useEffect(() => {
    if (!isOpen || !product) {
      setSelectedMods(new Map());
      setQuantity(1);
      setNotes('');
      return;
    }

    setQuantity(initialQuantity || 1);
    setNotes(initialNotes || '');

    const map = new Map<string, SelectedModifierPayload>();
    if (initialModifiers && initialModifiers.length > 0) {
      initialModifiers.forEach((m) => {
        map.set(m.modifierId, m);
      });
    } else {
      // Auto-select defaults if any
      product.modifierGroups?.forEach((group) => {
        group.modifiers?.forEach((mod) => {
          if (mod.isDefault && mod.isAvailable) {
            map.set(mod.id, {
              modifierId: mod.id,
              name: mod.name,
              priceDelta: typeof mod.priceDelta === 'string' ? parseFloat(mod.priceDelta) : mod.priceDelta,
            });
          }
        });
      });
    }
    setSelectedMods(map);
  }, [isOpen, product, initialModifiers, initialQuantity, initialNotes]);

  const basePrice = useMemo(() => {
    return parseFloat(product?.price || '0');
  }, [product]);

  const modifiersDeltaTotal = useMemo(() => {
    let sum = 0;
    selectedMods.forEach((m) => {
      sum += m.priceDelta || 0;
    });
    return sum;
  }, [selectedMods]);

  const unitTotal = basePrice + modifiersDeltaTotal;
  const lineTotal = unitTotal * quantity;

  // Validation: Check if all required groups have met their minimum selections
  const validationErrors = useMemo(() => {
    if (!product?.modifierGroups) return [];
    const errors: string[] = [];

    product.modifierGroups.forEach((group) => {
      const selectedInGroup = (group.modifiers || []).filter((m) => selectedMods.has(m.id));
      const minRequired = group.isRequired ? Math.max(group.minSelections || 1, 1) : (group.minSelections || 0);

      if (minRequired > 0 && selectedInGroup.length < minRequired) {
        errors.push(`Grupo "${group.name}": selecciona al menos ${minRequired} opción(es).`);
      }

      if (group.maxSelections && selectedInGroup.length > group.maxSelections) {
        errors.push(`Grupo "${group.name}": máximo ${group.maxSelections} opción(es) permitidas.`);
      }
    });

    return errors;
  }, [product, selectedMods]);

  const isValid = validationErrors.length === 0;

  const handleToggleModifier = (group: ModifierGroup, mod: Modifier) => {
    if (!mod.isAvailable) return;

    setSelectedMods((prev) => {
      const next = new Map(prev);
      const isSingle = group.selectionType === 'single';
      const modPriceDelta = typeof mod.priceDelta === 'string' ? parseFloat(mod.priceDelta) : mod.priceDelta;

      if (isSingle) {
        // Deselect any other modifier in this group
        group.modifiers.forEach((m) => {
          if (m.id !== mod.id) next.delete(m.id);
        });

        if (next.has(mod.id) && !group.isRequired) {
          next.delete(mod.id);
        } else {
          next.set(mod.id, {
            modifierId: mod.id,
            name: mod.name,
            priceDelta: modPriceDelta,
          });
        }
      } else {
        // Multi-selection
        if (next.has(mod.id)) {
          next.delete(mod.id);
        } else {
          // Check max limit
          if (group.maxSelections) {
            const currentCountInGroup = group.modifiers.filter((m) => next.has(m.id)).length;
            if (currentCountInGroup >= group.maxSelections) {
              return prev; // Reached max
            }
          }
          next.set(mod.id, {
            modifierId: mod.id,
            name: mod.name,
            priceDelta: modPriceDelta,
          });
        }
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (!product || !isValid) return;
    onConfirm({
      product,
      quantity,
      notes: notes.trim(),
      modifiers: Array.from(selectedMods.values()),
    });
    onClose();
  };

  if (!product) return null;

  const groups = product.modifierGroups || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {product.name}
                </DialogTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  Base: ${basePrice.toLocaleString()}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {product.description || 'Personaliza los ingredientes, toppings o término del plato.'}
              </DialogDescription>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
                Unitario
              </span>
              <span className="text-base font-extrabold font-mono text-primary tabular-nums">
                ${unitTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Groups & Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs border border-dashed rounded-xl p-4">
              Este producto no tiene grupos de toppings o adicionales configurados. Puedes agregar notas de cocina a continuación.
            </div>
          ) : (
            groups.map((group) => {
              const selectedCount = (group.modifiers || []).filter((m) => selectedMods.has(m.id)).length;
              const isSingle = group.selectionType === 'single';

              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {group.name}
                      </h4>
                      {group.isRequired ? (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Requerido
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Opcional
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {isSingle
                        ? '1 opción'
                        : group.maxSelections
                        ? `${selectedCount}/${group.maxSelections} máx`
                        : `${selectedCount} seleccionados`}
                    </span>
                  </div>

                  {/* Modifiers List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(group.modifiers || []).map((mod) => {
                      const isSelected = selectedMods.has(mod.id);
                      const deltaNum =
                        typeof mod.priceDelta === 'string'
                          ? parseFloat(mod.priceDelta)
                          : mod.priceDelta;

                      return (
                        <Card
                          key={mod.id}
                          onClick={() => handleToggleModifier(group, mod)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between select-none ${
                            !mod.isAvailable
                              ? 'opacity-40 cursor-not-allowed bg-muted/40'
                              : isSelected
                              ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                              : 'border-border/80 hover:border-primary/50 bg-card hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`size-4 rounded-${
                                isSingle ? 'full' : 'md'
                              } border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground/40 bg-background'
                              }`}
                            >
                              {isSelected && <Check className="size-3" strokeWidth={3} />}
                            </div>
                            <span
                              className={`text-xs font-medium truncate ${
                                isSelected ? 'text-primary font-bold' : 'text-foreground'
                              }`}
                            >
                              {mod.name}
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            {deltaNum > 0 ? (
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono font-bold ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-transparent'
                                    : 'text-primary border-primary/30 bg-primary/5'
                                }`}
                              >
                                +${deltaNum.toLocaleString()}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                Gratis
                              </span>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          <Separator />

          {/* Kitchen notes */}
          <div className="space-y-1.5">
            <Label htmlFor="kitchen-notes" className="text-xs font-semibold text-foreground">
              Instrucciones especiales para cocina (Opcional)
            </Label>
            <Input
              id="kitchen-notes"
              type="text"
              placeholder="Ej. Sin salsa, término 3/4, salsa aparte, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Validation alerts if any */}
          {validationErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="size-3.5" />
                <span>Atención requerida:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer with quantity and action */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex-row items-center justify-between sm:justify-between gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="size-9 rounded-xl"
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center font-mono font-bold text-sm text-foreground select-none">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="size-9 rounded-xl"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Confirm Button */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" type="button" onClick={onClose} className="rounded-xl text-xs h-9">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!isValid}
              className="rounded-xl font-bold text-xs h-9 px-4 gap-2 shadow-sm"
            >
              <Sparkles className="size-3.5" />
              <span>
                {isEditing ? 'Actualizar' : 'Agregar'} (${lineTotal.toLocaleString()})
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModifiersModal;
