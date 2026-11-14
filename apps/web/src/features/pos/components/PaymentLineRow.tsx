import React from 'react';
import {
  DollarSign,
  CreditCard,
  Send,
  Ticket,
  Trash2,
  Coins,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
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
      return <DollarSign className="size-3.5 text-emerald-500 shrink-0" />;
    case 'card_credit':
    case 'card_debit':
      return <CreditCard className="size-3.5 text-blue-500 shrink-0" />;
    case 'transfer':
      return <Send className="size-3.5 text-purple-500 shrink-0" />;
    case 'voucher':
      return <Ticket className="size-3.5 text-amber-500 shrink-0" />;
    default:
      return <DollarSign className="size-3.5 text-muted-foreground shrink-0" />;
  }
};

const QUICK_METHODS: { id: PaymentMethodType; label: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'Efectivo', icon: <DollarSign className="size-3.5 text-emerald-500" /> },
  { id: 'card_debit', label: 'Débito', icon: <CreditCard className="size-3.5 text-blue-500" /> },
  { id: 'card_credit', label: 'Crédito', icon: <CreditCard className="size-3.5 text-sky-500" /> },
  { id: 'transfer', label: 'Transferencia', icon: <Send className="size-3.5 text-purple-500" /> },
  { id: 'voucher', label: 'Bono', icon: <Ticket className="size-3.5 text-amber-500" /> },
];

const getQuickDenominations = (amount: number): number[] => {
  if (amount <= 0) return [20000, 50000, 100000];
  const common = [10000, 20000, 50000, 100000, 200000];
  const rounded10k = Math.ceil(amount / 10000) * 10000;
  const set = new Set<number>();
  if (rounded10k > amount) {
    set.add(rounded10k);
  }
  common.forEach((c) => {
    if (c > amount) set.add(c);
  });
  return Array.from(set).slice(0, 3);
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
  const isExactGiven = hasTendered && Math.abs(tenderedNum - line.amount) < 0.01;
  const denominations = isCash ? getQuickDenominations(line.amount) : [];

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs space-y-3.5 transition-all">
      {/* Botones de Selección Rápida de Método */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Medio de Pago
          </Label>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Eliminar este medio de pago"
              onClick={() => onRemove(partId, line.id)}
              className="h-6 px-2 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 rounded-md cursor-pointer"
            >
              <Trash2 className="size-3" />
              <span>Quitar</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {QUICK_METHODS.map((method) => {
            const isSelected = line.method === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onUpdate(partId, line.id, { method: method.id })}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                    : 'bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/60'
                }`}
              >
                <span className={isSelected ? 'text-primary-foreground' : ''}>
                  {method.icon}
                </span>
                <span className="truncate">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fila Principal: Selector Secundario + Monto Asignado */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-border/50">
        <div className="sm:col-span-5">
          <Label className="text-[11px] text-muted-foreground font-medium mb-1 block">
            Detalle del Método
          </Label>
          <Select
            value={line.method}
            onValueChange={(val) => onUpdate(partId, line.id, { method: val as PaymentMethodType })}
          >
            <SelectTrigger className="h-9 text-xs font-semibold bg-background">
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

        <div className="sm:col-span-7">
          <Label className="text-[11px] text-muted-foreground font-medium mb-1 block">
            Monto a Cobrar por este medio ($)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-mono">
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
              className="h-9 pl-7 pr-3 text-sm font-mono font-black text-right bg-background"
            />
          </div>
        </div>
      </div>

      {/* Manejo inteligente de Efectivo y Vuelto */}
      {isCash ? (
        <div className="p-3 bg-muted/20 border border-border/70 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Coins className="size-4 text-emerald-500 shrink-0" />
              <Label className="text-xs font-bold text-foreground">
                Efectivo Recibido del Cliente:
              </Label>
            </div>

            {/* Atajos de Billetes y Monto Exacto */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSetExactCash(partId, line.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  isExactGiven
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                    : 'bg-background hover:bg-muted text-foreground border-border/80'
                }`}
              >
                Exacto (${line.amount.toLocaleString()})
              </button>

              {denominations.map((denom) => {
                const isSelected = tenderedNum === denom;
                return (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => onUpdate(partId, line.id, { cashTendered: denom.toString() })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                        : 'bg-background hover:bg-muted text-foreground border-border/80'
                    }`}
                  >
                    ${denom.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-mono">
                  $
                </span>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={line.cashTendered}
                  onChange={(e) => onUpdate(partId, line.id, { cashTendered: e.target.value })}
                  placeholder={line.amount > 0 ? line.amount.toString() : '0.00'}
                  className="h-9 pl-7 pr-3 text-sm font-mono font-bold text-right bg-background"
                />
              </div>
            </div>

            {/* Tarjeta de Cambio / Vuelto en Alta Visibilidad */}
            <div className="sm:col-span-7">
              {hasTendered ? (
                isCashShort ? (
                  <div className="p-2 px-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-destructive text-xs font-bold">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>Falta por entregar:</span>
                    </div>
                    <span className="text-sm font-mono font-black text-destructive">
                      -${(line.amount - tenderedNum).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Cambio / Vuelto:</span>
                    </div>
                    <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                      ${changeDue.toLocaleString()} COP
                    </span>
                  </div>
                )
              ) : (
                <div className="p-2 px-3 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Seleccione un billete o digite el valor recibido</span>
                  <Badge variant="outline" className="text-[10px] font-mono">Pendiente</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Voucher / Transacción Electrónica */
        <div className="p-3 bg-muted/20 border border-border/70 rounded-xl space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground block">
            Comprobante, Aprobación de Datáfono o Referencia (Opcional)
          </Label>
          <Input
            type="text"
            value={line.reference}
            onChange={(e) => onUpdate(partId, line.id, { reference: e.target.value })}
            placeholder="ej. Aprobación #048291, Nequi ref: M1829..."
            className="h-8 text-xs bg-background"
          />
        </div>
      )}
    </div>
  );
};

export default PaymentLineRow;
