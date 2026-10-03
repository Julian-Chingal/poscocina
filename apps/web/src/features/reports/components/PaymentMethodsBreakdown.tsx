import React from 'react';
import { Banknote, CreditCard, QrCode, Wallet, ArrowUpRight } from 'lucide-react';
import { OverviewMetrics } from '../types/reports.types';
import { formatCurrency } from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface PaymentMethodsBreakdownProps {
  overview: OverviewMetrics | null;
}

const METHOD_CONFIG: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }>; color: string; bgBadge: string }
> = {
  cash: {
    label: 'Efectivo',
    icon: Banknote,
    color: 'bg-emerald-500',
    bgBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  card: {
    label: 'Tarjeta Crédito / Débito',
    icon: CreditCard,
    color: 'bg-blue-500',
    bgBadge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  transfer: {
    label: 'Transferencia / QR',
    icon: QrCode,
    color: 'bg-violet-500',
    bgBadge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },
};

export const PaymentMethodsBreakdown: React.FC<PaymentMethodsBreakdownProps> = ({ overview }) => {
  const methods = overview?.paymentMethods || [];

  return (
    <Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
      <div>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="font-bold text-sm text-foreground">Medios de Pago</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                Participación del recaudo y propinas por canal
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-1 space-y-4">
          {methods.length === 0 ? (
            <div className="py-8 text-center space-y-1.5">
              <p className="text-xs font-semibold text-foreground">Sin registros de pago</p>
              <p className="text-[11px] text-muted-foreground">
                No hay cobros registrados en el rango de fechas seleccionado
              </p>
            </div>
          ) : (
            methods.map((p) => {
              const config = METHOD_CONFIG[p.method] || {
                label: p.method,
                icon: Wallet,
                color: 'bg-primary',
                bgBadge: 'bg-muted text-muted-foreground border-border',
              };
              const Icon = config.icon;

              return (
                <div key={p.method} className="space-y-1.5 p-2 rounded-xl bg-muted/20 border border-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-background flex items-center justify-center border border-border/50 text-foreground">
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-foreground">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{formatCurrency(p.totalAmount)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${config.bgBadge}`}>
                        {p.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Sleek bar */}
                  <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.color}`}
                      style={{ width: `${Math.min(Math.max(p.percentage, 2), 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                    <span>{p.count} transacción{p.count !== 1 ? 'es' : ''}</span>
                    {p.totalTip > 0 && (
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        Propina: {formatCurrency(p.totalTip)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </div>

      <CardFooter className="p-5 pt-3 border-t border-border/60 text-xs text-muted-foreground flex justify-between items-center bg-muted/10">
        <span className="text-[11px]">Total Recibos Cobrados:</span>
        <span className="font-bold text-foreground text-sm flex items-center gap-1">
          {overview?.ticketCount || 0}
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
        </span>
      </CardFooter>
    </Card>
  );
};

