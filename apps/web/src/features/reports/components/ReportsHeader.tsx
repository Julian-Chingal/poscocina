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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Reportes & Business Intelligence</h1>
            <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 font-semibold">
              Fase 3
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas transaccionales, rentabilidad de recetas, flujo horario y velocidad de cocina
          </p>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {PERIODS.map((p) => (
              <Button
                key={p.id}
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onPeriodChange(p.id)}
                className={`px-3 py-1.5 h-7 rounded-lg font-medium transition text-xs ${
                  period === p.id ? 'bg-orange-500 text-white shadow hover:bg-orange-600 hover:text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Sub-tab Switcher: Métricas vs Auditoría */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:hidden">
        <Button
          type="button"
          onClick={() => onTabChange('metrics')}
          className={`flex items-center gap-2 px-4 py-2 h-auto rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-orange-600 text-white shadow-lg hover:bg-orange-500'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
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
              ? 'bg-rose-600 text-white shadow-lg hover:bg-rose-500'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Auditoría de Seguridad (Audit Trail)</span>
        </Button>
      </div>
    </div>
  );
};
