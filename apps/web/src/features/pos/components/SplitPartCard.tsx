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
    <Card className="border border-border/80 bg-card/90 shadow-2xs rounded-2xl overflow-hidden transition-all">
      <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Nombre de la Parte / Persona */}
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {splitMode === 'single' ? <User className="size-4" /> : index + 1}
            </div>

            {splitMode === 'custom' ? (
              <Input
                type="text"
                value={part.name}
                onChange={(e) => onUpdatePartName(part.id, e.target.value)}
                className="h-8 w-40 text-xs font-bold bg-background"
                placeholder="Nombre persona"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {part.name}
                </span>
                {splitMode === 'single' && (
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    Pago Único
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Cuota Objetivo y Estado */}
          <div className="flex items-center gap-2">
            {splitMode === 'custom' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Cuota:</span>
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-mono">
                    $
                  </span>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={part.targetAmount || ''}
                    onChange={(e) => onUpdatePartTarget(part.id, parseFloat(e.target.value) || 0)}
                    className="h-8 pl-6 text-xs font-mono font-bold text-right bg-background"
                  />
                </div>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs font-mono font-bold bg-background/80 px-2.5 py-1">
                Cuota: ${target.toLocaleString()}
              </Badge>
            )}

            {/* Badge de estado de la persona */}
            {isExact ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1 px-2.5 py-0.5"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Cubierto</span>
              </Badge>
            ) : isShort ? (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs font-bold gap-1 px-2.5 py-0.5"
              >
                <AlertCircle className="size-3.5" />
                <span>Falta ${diff.toLocaleString()}</span>
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="text-xs font-bold gap-1 px-2.5 py-0.5"
              >
                <span>Excede ${Math.abs(diff).toLocaleString()}</span>
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
                className="size-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-3 bg-card/40">
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

      <CardFooter className="py-2.5 px-4 bg-muted/20 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddPaymentLine(part.id)}
          className="h-8 text-xs font-semibold gap-1.5 border-dashed hover:border-primary text-primary hover:bg-primary/5 rounded-xl cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Dividir / Agregar otro método de pago</span>
        </Button>

        <span className="text-xs text-muted-foreground font-mono">
          Asignado a {part.name}:{' '}
          <strong className="text-foreground text-sm font-bold">${roundedCovered.toLocaleString()}</strong>
        </span>
      </CardFooter>
    </Card>
  );
};

export default SplitPartCard;
