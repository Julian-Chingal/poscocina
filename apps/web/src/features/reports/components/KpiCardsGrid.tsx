import React from 'react';
import { DollarSign, Receipt, Percent, Wallet } from 'lucide-react';
import { OverviewMetrics, CogsMetrics } from '../types/reports.types';
import { formatCurrency } from '../utils/formatCurrency';
import { Card } from '@/components/ui/card';

interface KpiCardsGridProps {
  overview: OverviewMetrics | null;
  cogsMetrics: CogsMetrics | null;
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ overview, cogsMetrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Ventas Totales */}
      <Card className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Ventas Brutas</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white tracking-tight">
          {formatCurrency(overview?.totalSales || 0)}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
          <span>Subtotal: {formatCurrency(overview?.subtotalSales || 0)}</span>
          <span>•</span>
          <span>Impuestos: {formatCurrency(overview?.taxTotal || 0)}</span>
        </div>
      </Card>

      {/* Card 2: Ticket Promedio */}
      <Card className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Ticket Promedio</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white tracking-tight">
          {formatCurrency(overview?.avgTicket || 0)}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Total Recibos: <span className="font-semibold text-slate-200">{overview?.ticketCount || 0}</span>
        </div>
      </Card>

      {/* Card 3: Margen Bruto (Food Cost / Recetas) */}
      <Card className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Margen Bruto Est.</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {cogsMetrics?.grossMarginPct || 0}%
          </span>
          <span className="text-xs text-cyan-300">
            ({formatCurrency(cogsMetrics?.grossProfit || 0)})
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Costo Insumos (COGS): {formatCurrency(cogsMetrics?.totalCogs || 0)}
        </div>
      </Card>

      {/* Card 4: Propinas y Descuentos */}
      <Card className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Propinas Recaudadas</span>
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white tracking-tight">
          {formatCurrency(overview?.totalTips || 0)}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Descuentos otorgados: {formatCurrency(overview?.discountTotal || 0)}
        </div>
      </Card>
    </div>
  );
};
