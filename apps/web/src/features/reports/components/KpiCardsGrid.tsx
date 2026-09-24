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
    <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
      {/* Card 1: Ventas Totales */}
      <Card className="w-full min-w-0 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Ventas Brutas</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-foreground tracking-tight">
          {formatCurrency(overview?.totalSales || 0)}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
          <span>Subtotal: {formatCurrency(overview?.subtotalSales || 0)}</span>
          <span>•</span>
          <span>Impuestos: {formatCurrency(overview?.taxTotal || 0)}</span>
        </div>
      </Card>

      {/* Card 2: Ticket Promedio */}
      <Card className="p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Ticket Promedio</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-foreground tracking-tight">
          {formatCurrency(overview?.avgTicket || 0)}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Total Recibos: <span className="font-semibold text-foreground">{overview?.ticketCount || 0}</span>
        </div>
      </Card>

      {/* Card 3: Margen Bruto (Food Cost / Recetas) */}
      <Card className="p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Margen Bruto Est.</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground tracking-tight">
            {cogsMetrics?.grossMarginPct || 0}%
          </span>
          <span className="text-xs text-cyan-600 dark:text-cyan-400">
            ({formatCurrency(cogsMetrics?.grossProfit || 0)})
          </span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Costo Insumos (COGS): {formatCurrency(cogsMetrics?.totalCogs || 0)}
        </div>
      </Card>

      {/* Card 4: Propinas y Descuentos */}
      <Card className="p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Propinas Recaudadas</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-foreground tracking-tight">
          {formatCurrency(overview?.totalTips || 0)}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Descuentos otorgados: {formatCurrency(overview?.discountTotal || 0)}
        </div>
      </Card>
    </div>
  );
};
