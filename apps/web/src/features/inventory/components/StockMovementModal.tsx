import React, { useState, FormEvent } from 'react';
import { ArrowDownRight } from 'lucide-react';
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) return;
    await onSubmit(movementType, quantity, notes);
    setQuantity('1');
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            <div>
              <DialogTitle className="text-base font-bold">Ajuste de Existencias</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {item.name} ({item.unit})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <Label className="mb-1 block">Tipo de Movimiento</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'purchase' as const, label: 'Entrada (+)', color: 'border-emerald-500 text-emerald-400' },
                { id: 'waste' as const, label: 'Merma (-)', color: 'border-rose-500 text-rose-400' },
                { id: 'adjustment' as const, label: 'Ajuste', color: 'border-cyan-500 text-cyan-400' },
              ].map(({ id, label, color }) => (
                <Button
                  key={id}
                  type="button"
                  variant="ghost"
                  onClick={() => setMovementType(id)}
                  className={`p-2 h-auto rounded-xl border text-xs font-bold transition cursor-pointer ${
                    movementType === id ? `bg-slate-800 ${color}` : 'border-slate-800 text-slate-400'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Cantidad ({item.unit}) *</Label>
            <Input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono h-10 rounded-xl"
            />
          </div>

          <div>
            <Label className="mb-1 block">Observaciones / Motivo</Label>
            <Input
              type="text"
              placeholder="Ej. Daño por refrigeración o conteo semanal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementModal;
