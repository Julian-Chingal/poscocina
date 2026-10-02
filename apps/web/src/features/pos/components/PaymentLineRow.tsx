import React from 'react';
import { DollarSign, CreditCard, Send, Ticket, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PaymentLineState,
  PaymentMethodType,
  PAYMENT_METHOD_OPTIONS,
} from '../types/split-bill.types';

interface PaymentLineRowProps {
  line: PaymentLineState;
  partId: string;
  canRemove: boolean;
  onUpdate: (partId: string, lineId: string, updates: Partial<PaymentLineState>) => void;
  onRemove: (partId: string, lineId: string) => void;
  onSetExactCash: (partId: string, lineId: string) => void;
}

const getMethodIcon = (method: PaymentMethodType) => {
  switch (method) {
    case 'cash':
      return <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    case 'card_credit':
    case 'card_debit':
      return <CreditCard className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
    case 'transfer':
      return <Send className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
    case 'voucher':
      return <Ticket className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
    default:
      return <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  }
};

export const PaymentLineRow: React.FC<PaymentLineRowProps> = ({
  line,
  partId,
  canRemove,
  onUpdate,
  onRemove,
  onSetExactCash,
}) => {
  const isCash = line.method === 'cash';
  const tenderedNum = parseFloat(line.cashTendered);
  const hasTendered = !isNaN(tenderedNum) && tenderedNum > 0;
  const changeDue = hasTendered ? Math.max(0, Math.round((tenderedNum - line.amount) * 100) / 100) : 0;
  const isCashShort = hasTendered && tenderedNum < line.amount;

  return (
    <div className="p-3 rounded-xl border border-border/80 bg-background/60 shadow-2xs space-y-2.5 transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
        {/* Selector de Método de Pago con shadcn Select */}
        <div className="sm:col-span-5">
          <Label className="text-[11px] text-muted-foreground font-medium mb-1 block">
            Método de Pago
          </Label>
          <Select
            value={line.method}
            onValueChange={(val) => onUpdate(partId, line.id, { method: val as PaymentMethodType })}
          >
            <SelectTrigger className="h-9 text-xs font-semibold">
              <div className="flex items-center gap-2 truncate">
                {getMethodIcon(line.method)}
                <SelectValue placeholder="Seleccione método" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(opt.id)}
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Monto asignado al método */}
        <div className={canRemove ? 'sm:col-span-6' : 'sm:col-span-7'}>
          <Label className="text-[11px] text-muted-foreground font-medium mb-1 block">
            Monto a Cobrar ($)
          </Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="any"
              min="0"
              value={line.amount === 0 ? '' : line.amount}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onUpdate(partId, line.id, { amount: val });
              }}
              placeholder="0.00"
              className="h-9 pl-6 text-xs font-mono font-bold text-right"
            />
          </div>
        </div>

        {/* Botón eliminar línea */}
        {canRemove && (
          <div className="sm:col-span-1 flex items-end justify-center pt-5 sm:pt-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Eliminar este método de pago"
              onClick={() => onRemove(partId, line.id)}
              className="h-9 w-9 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Campos dinámicos según el método: Efectivo o Electrónico */}
      {isCash ? (
        <div className="pt-2 border-t border-dashed border-border/70 flex flex-wrap items-center justify-between gap-2 bg-muted/20 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">
              Efectivo Entregado:
            </span>
            <div className="relative w-32">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="any"
                min="0"
                value={line.cashTendered}
                onChange={(e) => onUpdate(partId, line.id, { cashTendered: e.target.value })}
                placeholder={line.amount > 0 ? line.amount.toString() : '0.00'}
                className="h-7 pl-5 pr-2 text-xs font-mono text-right"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSetExactCash(partId, line.id)}
              className="h-7 px-2 text-[10px] font-semibold cursor-pointer"
            >
              Exacto
            </Button>
          </div>

          {/* Cálculo visual de cambio/vuelto */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-muted-foreground">Vuelto:</span>
            {isCashShort ? (
              <Badge variant="destructive" className="h-6 text-[11px] font-mono font-bold">
                Faltan ${(line.amount - (tenderedNum || 0)).toLocaleString()}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="h-6 text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
              >
                <ArrowRight className="w-2.5 h-2.5" />
                ${changeDue.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-dashed border-border/70">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
              Voucher / Referencia:
            </span>
            <Input
              type="text"
              value={line.reference}
              onChange={(e) => onUpdate(partId, line.id, { reference: e.target.value })}
              placeholder="Número de aprobación, transferencia o voucher (opcional)"
              className="h-7 text-xs flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};
