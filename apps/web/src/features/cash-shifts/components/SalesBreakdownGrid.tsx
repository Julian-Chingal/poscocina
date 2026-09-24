import React from 'react';
import { DollarSign, CreditCard, Send } from 'lucide-react';
import { ActiveShiftInfo } from '../types/cash-shifts.types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  salesByMethod?: ActiveShiftInfo['salesByMethod'];
}

export const SalesBreakdownGrid: React.FC<Props> = ({ salesByMethod = [] }) => {
  const cashData = salesByMethod.find((m) => m.method === 'cash');
  const cashTotal = parseFloat(cashData?.total || '0');

  const cardData = salesByMethod.filter((m) => ['card_credit', 'card_debit'].includes(m.method));
  const cardTotal = cardData.reduce((sum, c) => sum + parseFloat(c.total || '0'), 0);

  const transferData = salesByMethod.find((m) => m.method === 'transfer');
  const transferTotal = parseFloat(transferData?.total || '0');

  return (
    <Card className="w-full min-w-0 rounded-2xl shadow-sm">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Recaudación Acumulada en el Turno Actual:
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-fr">
          <Card className="p-4 bg-muted/40 rounded-xl border border-border flex flex-row items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Efectivo Recaudado</span>
              <span className="text-lg font-bold text-foreground font-mono">
                ${cashTotal.toLocaleString()}
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-muted/40 rounded-xl border border-border flex flex-row items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Tarjetas (Datáfono)</span>
              <span className="text-lg font-bold text-foreground font-mono">
                ${cardTotal.toLocaleString()}
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-muted/40 rounded-xl border border-border flex flex-row items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Transferencias</span>
              <span className="text-lg font-bold text-foreground font-mono">
                ${transferTotal.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
