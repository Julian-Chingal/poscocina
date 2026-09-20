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
    <Card className="bg-slate-800/60 border-slate-700/60 rounded-2xl shadow-sm">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recaudación Acumulada en el Turno Actual:
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-row items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Efectivo Recaudado</span>
              <span className="text-lg font-bold text-white font-mono">
                ${cashTotal.toLocaleString()}
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-row items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Tarjetas (Datáfono)</span>
              <span className="text-lg font-bold text-white font-mono">
                ${cardTotal.toLocaleString()}
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-row items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Transferencias</span>
              <span className="text-lg font-bold text-white font-mono">
                ${transferTotal.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
