import React, { useState, FormEvent, useMemo } from 'react';
import { ArrowRight, Boxes, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { InventoryItem, MovementType } from '../types/inventory.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  item: InventoryItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (type: MovementType, quantity: string, notes?: string) => Promise<void>;
}

export const StockMovementModal: React.FC<Props> = ({
  isOpen,
  item,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [movementType, setMovementType] = useState<MovementType>('purchase');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const currentStock = parseFloat(item.currentStock || '0');
  const qtyNumber = parseFloat(quantity || '0');

  // Compute live projected stock
  const projectedStock = useMemo(() => {
    if (isNaN(qtyNumber)) return currentStock;
    if (movementType === 'purchase') {
      return currentStock + qtyNumber;
    }
    if (movementType === 'waste') {
      return Math.max(0, currentStock - qtyNumber);
    }
    if (movementType === 'adjustment') {
      return qtyNumber;
    }
    return currentStock;
  }, [currentStock, qtyNumber, movementType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) return;
    await onSubmit(movementType, quantity, notes);
    setQuantity('1');
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose} className="rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                Ajuste Operativo de Existencias
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {item.name} · Unidad: <span className="font-semibold text-foreground uppercase">{item.unit}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Movement Type Selection */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold">Tipo de Movimiento</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'purchase' as const,
                  label: 'Entrada (+)',
                  icon: TrendingUp,
                  activeColor: 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-500/20',
                },
                {
                  id: 'waste' as const,
                  label: 'Merma (-)',
                  icon: TrendingDown,
                  activeColor: 'border-destructive/50 text-destructive bg-destructive/15 ring-2 ring-destructive/20',
                },
                {
                  id: 'adjustment' as const,
                  label: 'Fijar Conteo',
                  icon: RefreshCw,
                  activeColor: 'border-primary/50 text-primary bg-primary/15 ring-2 ring-primary/20',
                },
              ].map(({ id, label, icon: Icon, activeColor }) => (
                <Button
                  key={id}
                  type="button"
                  variant="ghost"
                  onClick={() => setMovementType(id)}
                  className={`p-2.5 h-auto rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                    movementType === id
                      ? activeColor
                      : 'border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Current Stock vs Projected Preview */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block">Stock Actual</span>
              <span className="font-mono font-black text-sm text-foreground">
                {currentStock.toLocaleString()} {item.unit}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mx-2" />

            <div className="text-right">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                {movementType === 'adjustment' ? 'Nuevo Stock Fijado' : 'Stock Resultante'}
              </span>
              <span className={`font-mono font-black text-sm ${
                movementType === 'waste' ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {projectedStock.toLocaleString()} {item.unit}
              </span>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold">
              {movementType === 'adjustment' ? 'Cantidad final real en inventario *' : `Cantidad a ${movementType === 'purchase' ? 'ingresar' : 'descontar'} (${item.unit}) *`}
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono h-10 rounded-xl text-sm"
              autoFocus
            />
          </div>

          {/* Notes / Reason */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold">Motivo / Observaciones</Label>
            <Input
              type="text"
              placeholder="Ej. Conteo físico semanal, producto dañado, reposición rápida..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 rounded-xl text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" type="button" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-4"
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementModal;
