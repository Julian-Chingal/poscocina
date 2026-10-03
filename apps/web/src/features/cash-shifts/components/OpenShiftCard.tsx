import React, { useState, FormEvent } from 'react';
import { Unlock, KeyRound, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  onOpenShift: (amount: number, notes?: string) => Promise<void>;
}

const PRESET_AMOUNTS = [50000, 100000, 150000, 200000, 300000];
const QUICK_NOTES = [
  'Billetes de baja denominación',
  'Base estándar de cambio',
  'Billetes y monedas',
];

export const OpenShiftCard: React.FC<Props> = ({ onOpenShift }) => {
  const user = useAuthStore((s) => s.currentUser);
  const [openingAmount, setOpeningAmount] = useState('100000');
  const [openingNotes, setOpeningNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const numericAmount = parseFloat(openingAmount) || 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (numericAmount < 0) return;
    setSubmitting(true);
    await onOpenShift(numericAmount, openingNotes.trim() || undefined);
    setSubmitting(false);
  };

  const handleSelectPreset = (amount: number) => {
    setOpeningAmount(amount.toString());
  };

  const handleSelectQuickNote = (note: string) => {
    setOpeningNotes((prev) => (prev ? `${prev}, ${note.toLowerCase()}` : note));
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-all">
      {/* Card Header & Cashier Profile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border/70">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
            <Unlock className="size-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Apertura de Turno de Caja
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ingresa la base inicial en efectivo para habilitar facturación y ventas.
            </p>
          </div>
        </div>

        {/* Cashier Badge */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <div className="size-6 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <span className="font-bold text-foreground block truncate max-w-[130px] leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {user.roleLabel || user.roleName || 'Cajero'}
              </span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Formatted Amount Display & Input */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="opening-amount"
              className="text-xs font-bold text-foreground flex items-center gap-1.5"
            >
              <Banknote className="size-3.5 text-primary" />
              <span>Fondo Inicial en Efectivo (Base de Cambio) *</span>
            </Label>
            <span className="text-[11px] font-mono text-muted-foreground font-semibold">
              Pesos Colombianos (COP)
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-base sm:text-lg font-black pointer-events-none select-none">
              $
            </span>
            <Input
              id="opening-amount"
              type="number"
              min="0"
              step="1000"
              required
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              className="pl-9 pr-24 h-12 text-base sm:text-lg font-mono font-black rounded-xl bg-background border-border/80 focus-visible:ring-primary shadow-2xs tabular-nums text-foreground"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground select-none">
              COP
            </div>
          </div>

          {/* Quick Denomination Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Bases habituales rápidas:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = numericAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/20 scale-[1.02]'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Observations / Notes */}
        <div className="space-y-2">
          <Label
            htmlFor="opening-notes"
            className="text-xs font-bold text-foreground block"
          >
            Observaciones de Apertura (Opcional):
          </Label>
          <Input
            id="opening-notes"
            type="text"
            placeholder="Ej. Billetes de baja denominación ($5k, $10k, $20k) para cambio"
            value={openingNotes}
            onChange={(e) => setOpeningNotes(e.target.value)}
            className="h-9 text-xs rounded-xl bg-background border-border/80 focus-visible:ring-primary shadow-2xs placeholder:text-muted-foreground/70"
          />

          {/* Quick note suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {QUICK_NOTES.map((qNote) => (
              <button
                key={qNote}
                type="button"
                onClick={() => handleSelectQuickNote(qNote)}
                className="text-[10px] text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 border border-border/60 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                + {qNote}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting || numericAmount <= 0}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-[0.98] gap-2"
          >
            <KeyRound className="size-4" strokeWidth={2.2} />
            <span>
              {submitting
                ? 'Abriendo turno de caja...'
                : `Abrir Turno con $${numericAmount.toLocaleString()} COP`}
            </span>
          </Button>
          <p className="text-[11px] text-center text-muted-foreground mt-2">
            El fondo inicial será descontado automáticamente del arqueo de efectivo al cierre del turno.
          </p>
        </div>
      </form>
    </div>
  );
};

export default OpenShiftCard;
