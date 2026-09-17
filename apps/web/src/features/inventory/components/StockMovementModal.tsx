import React, { useState, FormEvent } from 'react';
import { ArrowDownRight, X } from 'lucide-react';
import { InventoryItem, MovementType } from '../types/inventory.types';

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

  if (!isOpen || !item) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) return;
    onSubmit(movementType, quantity, notes);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-base">Ajuste de Existencias</h3>
              <p className="text-[11px] text-slate-400">{item.name} ({item.unit})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Movimiento</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'purchase' as const, label: 'Entrada (+)', color: 'border-emerald-500 text-emerald-400' },
                { id: 'waste' as const, label: 'Merma (-)', color: 'border-rose-500 text-rose-400' },
                { id: 'adjustment' as const, label: 'Ajuste', color: 'border-cyan-500 text-cyan-400' },
              ].map(({ id, label, color }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMovementType(id)}
                  className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    movementType === id ? `bg-slate-800 ${color}` : 'border-slate-800 text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cantidad ({item.unit}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Observaciones / Motivo</label>
            <input
              type="text"
              placeholder="Ej. Daño por refrigeración o conteo semanal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-2 text-xs text-slate-400 hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
