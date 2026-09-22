import React from 'react';
import { Download, Printer, RefreshCw, PieChart, ShieldAlert } from 'lucide-react';
import { ReportPeriod } from '../types/reports.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReportsHeaderProps {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
  activeTab: 'metrics' | 'audit';
  onTabChange: (tab: 'metrics' | 'audit') => void;
}

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: 'Últimos 7 Días' },
  { id: 'month', label: 'Este Mes' },
  { id: 'all', label: 'Todo' },
];

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  period,
  onPeriodChange,
  isLoading,
  onRefresh,
  onExportCSV,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reportes & Business Intelligence</h1>
            <Badge variant="outline" className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold">
              Fase 3
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Métricas transaccionales, rentabilidad de recetas, flujo horario y velocidad de cocina
          </p>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex bg-muted/40 border border-border rounded-xl p-1 text-xs">
            {PERIODS.map((p) => (
              <Button
                key={p.id}
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onPeriodChange(p.id)}
                className={`px-3 py-1.5 h-7 rounded-lg font-medium transition text-xs ${
                  period === p.id ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={onRefresh}
            title="Actualizar datos"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Sub-tab Switcher: Métricas vs Auditoría */}
      <div className="flex items-center gap-2 border-b border-border pb-3 print:hidden">
        <Button
          type="button"
          onClick={() => onTabChange('metrics')}
          className={`flex items-center gap-2 px-4 py-2 h-auto rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Métricas & Rentabilidad</span>
        </Button>

        <Button
          type="button"
          onClick={() => onTabChange('audit')}
          className={`flex items-center gap-2 px-4 py-2 h-auto rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Auditoría de Seguridad (Audit Trail)</span>
        </Button>
      </div>
    </div>
  );
};
