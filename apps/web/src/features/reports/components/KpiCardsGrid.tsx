import React from 'react';
import { TrendingUp, Receipt, Percent, HeartHandshake } from 'lucide-react';
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
      {/* Card 1: Ventas Brutas */}
      <Card className="p-5 shadow-xs border-border/80 relative overflow-hidden flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ventas Brutas
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(overview?.totalSales || 0)}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Sub: {formatCurrency(overview?.subtotalSales || 0)}</span>
          <span className="font-medium text-foreground/80">Imp: {formatCurrency(overview?.taxTotal || 0)}</span>
        </div>
      </Card>

      {/* Card 2: Ticket Promedio */}
      <Card className="p-5 shadow-xs border-border/80 relative overflow-hidden flex flex-col justify-between hover:border-amber-500/30 transition-colors">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ticket Promedio
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(overview?.avgTicket || 0)}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Tickets pagados</span>
          <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
            {overview?.ticketCount || 0}
          </span>
        </div>
      </Card>

      {/* Card 3: Margen Bruto (Food Cost / Recetas) */}
      <Card className="p-5 shadow-xs border-border/80 relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Margen Bruto Est.
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {cogsMetrics?.grossMarginPct || 0}%
            </span>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              ({formatCurrency(cogsMetrics?.grossProfit || 0)})
            </span>
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Costo Insumos (COGS)</span>
          <span className="font-medium text-foreground/80">{formatCurrency(cogsMetrics?.totalCogs || 0)}</span>
        </div>
      </Card>

      {/* Card 4: Propinas y Descuentos */}
      <Card className="p-5 shadow-xs border-border/80 relative overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-colors">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Propinas Recaudadas
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(overview?.totalTips || 0)}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Descuentos otorgados</span>
          <span className="font-medium text-foreground/80">{formatCurrency(overview?.discountTotal || 0)}</span>
        </div>
      </Card>
    </div>
  );
};

