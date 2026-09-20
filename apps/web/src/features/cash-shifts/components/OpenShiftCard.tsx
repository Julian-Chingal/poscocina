import React, { useState, FormEvent } from 'react';
import { Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

interface Props {
  onOpenShift: (amount: number, notes?: string) => Promise<void>;
}

export const OpenShiftCard: React.FC<Props> = ({ onOpenShift }) => {
  const [openingAmount, setOpeningAmount] = useState('100000');
  const [openingNotes, setOpeningNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onOpenShift(parseFloat(openingAmount) || 0, openingNotes);
    setSubmitting(false);
  };

  return (
    <Card className="max-w-md mx-auto rounded-3xl p-8 shadow-2xl border-slate-700/60">
      <CardHeader className="p-0 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
          <Unlock className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl">
          Apertura de Turno de Caja
        </CardTitle>
        <CardDescription className="mt-1">
          Inicia el turno ingresando el fondo de caja inicial en efectivo (base de cambio).
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="opening-amount" className="block text-xs font-semibold text-slate-300">
              Fondo Inicial en Efectivo:
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold z-10">
                $
              </span>
              <Input
                id="opening-amount"
                type="number"
                required
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="pl-8 font-mono h-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opening-notes" className="block text-xs font-semibold text-slate-300">
              Observaciones de Apertura:
            </Label>
            <Input
              id="opening-notes"
              type="text"
              placeholder="Ej. Billetes de baja denominación para cambio"
              value={openingNotes}
              onChange={(e) => setOpeningNotes(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Abriendo turno...' : 'Abrir Turno de Caja'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
