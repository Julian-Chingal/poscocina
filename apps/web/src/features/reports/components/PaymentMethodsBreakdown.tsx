import React from 'react';
import { PieChart } from 'lucide-react';
import { OverviewMetrics } from '../types/reports.types';
import { formatCurrency } from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface PaymentMethodsBreakdownProps {
  overview: OverviewMetrics | null;
}

const LABEL_MAP: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta Crédito / Débito',
  transfer: 'Transferencia / QR',
};

const COLOR_MAP: Record<string, string> = {
  cash: 'bg-emerald-500',
  card: 'bg-blue-500',
  transfer: 'bg-violet-500',
};

export const PaymentMethodsBreakdown: React.FC<PaymentMethodsBreakdownProps> = ({ overview }) => {
  const methods = overview?.paymentMethods || [];

  return (
    <Card className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
      <div>
        <CardHeader className="p-6 pb-4 flex flex-row items-center gap-2 space-y-0">
          <PieChart className="w-5 h-5 text-emerald-400" />
          <div>
            <CardTitle className="font-bold text-sm text-white">Medios de Pago</CardTitle>
            <CardDescription className="text-[11px] text-slate-400">Participación sobre el total recaudado</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-3.5">
          {methods.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No hay registros de cobros en este periodo</p>
          ) : (
            methods.map((p) => (
              <div key={p.method} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{LABEL_MAP[p.method] || p.method}</span>
                  <div className="text-right">
                    <span className="font-bold text-white">{formatCurrency(p.totalAmount)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({p.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${COLOR_MAP[p.method] || 'bg-orange-500'}`}
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{p.count} transacciones</span>
                  {p.totalTip > 0 && <span>Propina: {formatCurrency(p.totalTip)}</span>}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </div>

      <CardFooter className="p-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
        <span>Total Recibos Pagados:</span>
        <span className="font-bold text-slate-200">{overview?.ticketCount || 0}</span>
      </CardFooter>
    </Card>
  );
};
