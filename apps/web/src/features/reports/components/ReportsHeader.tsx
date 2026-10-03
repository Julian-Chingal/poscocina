import React from 'react';
import { Download, Printer, RefreshCw, PieChart, ShieldAlert } from 'lucide-react';
import { ReportPeriod } from '../types/reports.types';
import { Button } from '@/components/ui/button';

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
  const periodDescriptions: Record<ReportPeriod, string> = {
    today: 'Transacciones y rendimiento del turno actual',
    '7d': 'Consolidado acumulado de los últimos 7 días',
    month: 'Rendimiento mensual acumulado en curso',
    all: 'Histórico global consolidado del establecimiento',
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reportes & Analítica de Negocio
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>En vivo</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {periodDescriptions[period] || 'Métricas transaccionales, rentabilidad de recetas, flujo horario y KDS'}
          </p>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          {/* Period selector pill */}
          <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60 shadow-xs">
            {PERIODS.map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPeriodChange(p.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={onRefresh}
            title="Actualizar datos"
            className="h-8 w-8 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl border-border/80 text-xs font-semibold transition cursor-pointer hover:bg-muted/50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Sub-tab Switcher: Métricas vs Auditoría */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 print:hidden">
        <button
          type="button"
          onClick={() => onTabChange('metrics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Métricas de Operación</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('audit')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-foreground text-background shadow-xs'
              : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Registro de Auditoría</span>
        </button>
      </div>
    </div>
  );
};
