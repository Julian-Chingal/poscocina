import React from 'react';
import { User, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PaymentLineRow } from './PaymentLineRow';
import { SplitPartState, PaymentLineState, SplitMode } from '../types/split-bill.types';

interface SplitPartCardProps {
  part: SplitPartState;
  index: number;
  splitMode: SplitMode;
  canRemovePart: boolean;
  onUpdatePartName: (partId: string, name: string) => void;
  onUpdatePartTarget: (partId: string, target: number) => void;
  onRemovePart: (partId: string) => void;
  onAddPaymentLine: (partId: string) => void;
  onUpdatePaymentLine: (partId: string, lineId: string, updates: Partial<PaymentLineState>) => void;
  onRemovePaymentLine: (partId: string, lineId: string) => void;
  onSetExactCash: (partId: string, lineId: string) => void;
}

export const SplitPartCard: React.FC<SplitPartCardProps> = ({
  part,
  index,
  splitMode,
  canRemovePart,
  onUpdatePartName,
  onUpdatePartTarget,
  onRemovePart,
  onAddPaymentLine,
  onUpdatePaymentLine,
  onRemovePaymentLine,
  onSetExactCash,
}) => {
  const covered = part.payments.reduce((sum, line) => sum + line.amount, 0);
  const roundedCovered = Math.round(covered * 100) / 100;
  const target = Math.round(part.targetAmount * 100) / 100;
  const diff = Math.round((target - roundedCovered) * 100) / 100;

  const isExact = Math.abs(diff) < 0.01;
  const isShort = diff > 0.01;

  return (
    <Card className="border border-border/80 bg-card/60 shadow-xs overflow-hidden transition-all">
      <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Nombre de la Parte / Persona */}
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {splitMode === 'single' ? <User className="size-3.5" /> : index + 1}
            </div>

            {splitMode === 'custom' ? (
              <Input
                type="text"
                value={part.name}
                onChange={(e) => onUpdatePartName(part.id, e.target.value)}
                className="h-7 w-36 text-xs font-semibold"
                placeholder="Nombre persona"
              />
            ) : (
              <span className="text-xs font-bold text-foreground">
                {part.name}
              </span>
            )}
          </div>

          {/* Cuota Objetivo y Estado */}
          <div className="flex items-center gap-2">
            {splitMode === 'custom' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Cuota:</span>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={part.targetAmount || ''}
                    onChange={(e) => onUpdatePartTarget(part.id, parseFloat(e.target.value) || 0)}
                    className="h-7 pl-5 text-xs font-mono font-bold text-right"
                  />
                </div>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs font-mono font-bold bg-background">
                Cuota: ${target.toLocaleString()}
              </Badge>
            )}

            {/* Badge de estado de la persona */}
            {isExact ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1"
              >
                <CheckCircle2 className="size-3" />
                Cubierto
              </Badge>
            ) : isShort ? (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1"
              >
                <AlertCircle className="size-3" />
                Falta ${diff.toLocaleString()}
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="text-[10px] gap-1"
              >
                Excede ${Math.abs(diff).toLocaleString()}
              </Badge>
            )}

            {/* Opción de eliminar persona en modo custom */}
            {canRemovePart && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Eliminar esta persona"
                onClick={() => onRemovePart(part.id)}
                className="size-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2.5">
        {part.payments.map((line) => (
          <PaymentLineRow
            key={line.id}
            line={line}
            partId={part.id}
            canRemove={part.payments.length > 1}
            onUpdate={onUpdatePaymentLine}
            onRemove={onRemovePaymentLine}
            onSetExactCash={onSetExactCash}
          />
        ))}
      </CardContent>

      <CardFooter className="py-2 px-3 bg-muted/10 border-t border-border/40 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddPaymentLine(part.id)}
          className="h-7 text-xs font-semibold gap-1.5 border-dashed hover:border-primary text-primary"
        >
          <Plus className="size-3.5" />
          <span>Dividir / Agregar otro método</span>
        </Button>

        <span className="text-[11px] text-muted-foreground font-mono">
          Asignado a {part.name}:{' '}
          <strong className="text-foreground">${roundedCovered.toLocaleString()}</strong>
        </span>
      </CardFooter>
    </Card>
  );
};
