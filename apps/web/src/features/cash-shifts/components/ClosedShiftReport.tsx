import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CloseShiftReportData } from '../types/cash-shifts.types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
  report: CloseShiftReportData;
  onDismiss: () => void;
}

export const ClosedShiftReport: React.FC<Props> = ({ report, onDismiss }) => {
  const diff = report.difference ?? 0;

  return (
    <Card className="max-w-xl mx-auto rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <CardHeader className="text-center p-0 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-black text-foreground">Arqueo de Turno Finalizado</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">El turno de caja ha sido cerrado con éxito.</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Card className="p-5 bg-muted/40 border-border space-y-2.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Efectivo Esperado (Fondo + Ventas):</span>
            <span className="font-mono text-foreground">${report.expected?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Efectivo Físico Contado (Arqueo ciego):</span>
            <span className="font-mono text-foreground">${report.actual?.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-sm">
            <span>Diferencia de Caja:</span>
            <span
              className={`font-mono ${
                diff === 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : diff > 0
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-destructive'
              }`}
            >
              {diff === 0
                ? '$0 (Caja Cuadrada)'
                : diff > 0
                ? `+$${diff.toLocaleString()} (Sobrante)`
                : `-$${Math.abs(diff).toLocaleString()} (Faltante)`}
            </span>
          </div>
        </Card>
      </CardContent>

      <CardFooter className="p-0">
        <Button
          type="button"
          variant="default"
          onClick={onDismiss}
          className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Entendido / Continuar
        </Button>
      </CardFooter>
    </Card>
  );
};
