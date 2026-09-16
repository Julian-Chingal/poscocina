import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Receipt,
  Clock,
  Award,
  Download,
  Printer,
  RefreshCw,
  PieChart,
  ChefHat,
  Percent,
  Wallet,
  ShieldAlert,
} from 'lucide-react';
import { useBrandingStore } from '../stores/branding.store';
import { api } from '../services/api';

interface AuditLogItem {
  id: string;
  venueId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: any;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    roleId?: string;
  };
}

interface OverviewMetrics {
  totalSales: number;
  subtotalSales: number;
  taxTotal: number;
  discountTotal: number;
  ticketCount: number;
  avgTicket: number;
  totalTips: number;
  paymentMethods: {
    method: string;
    totalAmount: number;
    totalTip: number;
    count: number;
    percentage: number;
  }[];
}

interface HourlySale {
  hour: number;
  hourLabel: string;
  sales: number;
  tickets: number;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  revenue: number;
}

interface KdsMetrics {
  avgPrepMinutes: number;
  totalCompleted: number;
  totalPending: number;
  totalPreparing: number;
}

interface CogsMetrics {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
}

interface ReportsViewProps {
  venueId?: string | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ venueId }) => {
  const { settings, name: venueName } = useBrandingStore();
  const [period, setPeriod] = useState<'today' | '7d' | 'month' | 'all'>('today');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [hourly, setHourly] = useState<HourlySale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [kdsMetrics, setKdsMetrics] = useState<KdsMetrics | null>(null);
  const [cogsMetrics, setCogsMetrics] = useState<CogsMetrics | null>(null);

  // Phase 6: Security Audit Trail Tab
  const [activeTab, setActiveTab] = useState<'metrics' | 'audit'>('metrics');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditFilterAction, setAuditFilterAction] = useState<string>('all');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  const loadAuditLogs = useCallback(async () => {
    if (!venueId) return;
    setAuditLoading(true);
    try {
      const url = auditFilterAction !== 'all'
        ? `/api/audit?venueId=${venueId}&action=${auditFilterAction}`
        : `/api/audit?venueId=${venueId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [venueId, auditFilterAction]);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, loadAuditLogs]);

  const getDateRange = useCallback(() => {
    const now = new Date();
    let from: Date | null = null;
    const to = new Date();

    if (period === 'today') {
      from = new Date();
      from.setHours(0, 0, 0, 0);
    } else if (period === '7d') {
      from = new Date();
      from.setDate(now.getDate() - 7);
      from.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      from: from ? from.toISOString() : undefined,
      to: to.toISOString(),
    };
  }, [period]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { from, to } = getDateRange();
      const params = { from, to, venueId: venueId || undefined };

      const [resOverview, resHourly, resTop, resKds, resCogs] = await Promise.all([
        api.get<OverviewMetrics>('/api/analytics/overview', { params }),
        api.get<HourlySale[]>('/api/analytics/hourly-sales', { params }),
        api.get<TopProduct[]>('/api/analytics/top-products', { params }),
        api.get<KdsMetrics>('/api/analytics/kds-metrics', { params }),
        api.get<CogsMetrics>('/api/analytics/cogs-profitability', { params }),
      ]);

      setOverview(resOverview);
      setHourly(resHourly || []);
      setTopProducts(resTop || []);
      setKdsMetrics(resKds);
      setCogsMetrics(resCogs);
    } catch (err) {
      console.error('Error cargando analítica:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getDateRange, venueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Max hourly sales to scale the bar chart
  const maxHourlySale = Math.max(...hourly.map((h) => h.sales), 1);
  const peakHour = hourly.reduce((max, h) => (h.sales > max.sales ? h : max), hourly[0] || { hourLabel: '--', sales: 0 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!overview) return;
    const lines = [
      ['REPORTE DE VENTAS - POSCOCINA', settings.companyName || venueName],
      ['Generado el', new Date().toLocaleString('es-CO')],
      ['Periodo', period],
      [],
      ['RESUMEN GENERAL'],
      ['Ventas Brutas', overview.totalSales],
      ['Subtotal', overview.subtotalSales],
      ['Impuestos (INC/IVA)', overview.taxTotal],
      ['Descuentos', overview.discountTotal],
      ['Total Tickets', overview.ticketCount],
      ['Ticket Promedio', overview.avgTicket],
      ['Propinas Recaudadas', overview.totalTips],
      [],
      ['DESGLOSE POR MEDIO DE PAGO'],
      ['Metodo', 'Monto', 'Propinas', 'Transacciones', '% Participacion'],
      ...overview.paymentMethods.map((p) => [
        p.method,
        p.totalAmount,
        p.totalTip,
        p.count,
        `${p.percentage}%`,
      ]),
      [],
      ['TOP PRODUCTOS VENDIDOS'],
      ['Producto', 'Categoria', 'Precio Unitario', 'Cantidad Vendida', 'Ingresos'],
      ...topProducts.map((p) => [p.name, p.category, p.price, p.quantity, p.revenue]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 print:p-0 print:text-black">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Reportes & Business Intelligence</h1>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
              Fase 3
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas transaccionales, rentabilidad de recetas, flujo horario y velocidad de cocina
          </p>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Period Selector Tabs */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                period === 'today' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                period === '7d' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Últimos 7 Días
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                period === 'month' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                period === 'all' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todo
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={loadData}
            title="Actualizar datos"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher: Métricas vs Auditoría */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:hidden">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Métricas & Rentabilidad</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Auditoría de Seguridad (Audit Trail)</span>
        </button>
      </div>

      {activeTab === 'metrics' && (
        <>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Totales */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
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
        </div>

        {/* Card 2: Ticket Promedio */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
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
        </div>

        {/* Card 3: Margen Bruto (Food Cost / Recetas) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
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
        </div>

        {/* Card 4: Propinas y Descuentos */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
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
        </div>
      </div>

      {/* Row 2: Peak Hours Chart & Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Peak Sales (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Curva de Ventas por Hora del Día</h3>
                <p className="text-[11px] text-slate-400">Distribución para detección de horas pico y dimensionamiento de personal</p>
              </div>
            </div>
            {peakHour?.sales > 0 && (
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                Pico: {peakHour.hourLabel} ({formatCurrency(peakHour.sales)})
              </span>
            )}
          </div>

          {/* Bar Chart Bars */}
          <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-800">
            {hourly.map((h) => {
              const heightPct = (h.sales / maxHourlySale) * 100;
              const isPeak = h.hour === peakHour?.hour && h.sales > 0;

              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    {h.hourLabel}: {formatCurrency(h.sales)} ({h.tickets} tickets)
                  </div>

                  <div
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isPeak
                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                        : h.sales > 0
                        ? 'bg-orange-500/80 hover:bg-orange-400'
                        : 'bg-slate-800/50'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Hour labels */}
          <div className="flex justify-between text-[10px] text-slate-500 pt-2 px-1">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Payment Methods Breakdown (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Medios de Pago</h3>
                <p className="text-[11px] text-slate-400">Participación sobre el total recaudado</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {(overview?.paymentMethods || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No hay registros de cobros en este periodo</p>
              ) : (
                overview?.paymentMethods.map((p) => {
                  const labelMap: Record<string, string> = {
                    cash: 'Efectivo',
                    card: 'Tarjeta Crédito / Débito',
                    transfer: 'Transferencia / QR',
                  };
                  const colorMap: Record<string, string> = {
                    cash: 'bg-emerald-500',
                    card: 'bg-blue-500',
                    transfer: 'bg-violet-500',
                  };

                  return (
                    <div key={p.method} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-200">{labelMap[p.method] || p.method}</span>
                        <div className="text-right">
                          <span className="font-bold text-white">{formatCurrency(p.totalAmount)}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({p.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorMap[p.method] || 'bg-orange-500'}`}
                          style={{ width: `${p.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{p.count} transacciones</span>
                        {p.totalTip > 0 && <span>Propina: {formatCurrency(p.totalTip)}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick summary footer */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Total Recibos Pagados:</span>
            <span className="font-bold text-slate-200">{overview?.ticketCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products & Kitchen Velocity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Top 10 Productos Más Vendidos</h3>
                <p className="text-[11px] text-slate-400">Platos y bebidas con mayor volumen e ingresos brutos</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                  <th className="py-2.5 px-3 text-center">Cant. Vendida</th>
                  <th className="py-2.5 px-3 text-right">Total Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Sin movimientos de venta registrados en este periodo
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-bold text-amber-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(p.price)}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-300">{p.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KDS Kitchen Velocity (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Velocidad en Cocina (KDS)</h3>
              <p className="text-[11px] text-slate-400">Tiempos de preparación y estado</p>
            </div>
          </div>

          {/* Average Prep Time Metric */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Tiempo Promedio de Preparación
            </span>
            <div className="text-3xl font-black text-rose-400 tracking-tight">
              {kdsMetrics?.avgPrepMinutes || 0} <span className="text-sm font-semibold text-slate-300">min</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Desde comanda enviada hasta marcada como lista</p>
          </div>

          {/* Kitchen Orders Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
              <span>Platos Despachados:</span>
              <span className="font-bold">{kdsMetrics?.totalCompleted || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-300">
              <span>En Preparación Ahora:</span>
              <span className="font-bold">{kdsMetrics?.totalPreparing || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <span>Pendientes en Cola:</span>
              <span className="font-bold">{kdsMetrics?.totalPending || 0}</span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filter by action */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filtrar por evento:</span>
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'billing:discount_applied', label: 'Descuentos' },
                  { id: 'order:item_cancelled', label: 'Platos Cancelados' },
                  { id: 'cash_drawer:manual_open', label: 'Apertura Gaveta' },
                  { id: 'cash_shift:discrepancy', label: 'Diferencia Caja' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAuditFilterAction(item.id)}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      auditFilterAction === item.id
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={loadAuditLogs}
              title="Recargar eventos"
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Evento de Seguridad</th>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">IP / Origen</th>
                    <th className="py-3 px-4">Detalles / Causa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        Cargando registro de auditoría...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No se registran eventos de seguridad para este local.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const dt = new Date(log.createdAt).toLocaleString('es-CO');
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {dt}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {log.action === 'billing:discount_applied' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🏷️ Descuento Aplicado
                              </span>
                            )}
                            {log.action === 'order:item_cancelled' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                ❌ Plato Cancelado
                              </span>
                            )}
                            {log.action === 'cash_drawer:manual_open' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                🔓 Gaveta Manual
                              </span>
                            )}
                            {log.action === 'cash_shift:discrepancy' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                                ⚠️ Diferencia en Arqueo
                              </span>
                            )}
                            {!['billing:discount_applied', 'order:item_cancelled', 'cash_drawer:manual_open', 'cash_shift:discrepancy'].includes(log.action) && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                {log.action}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">
                              {log.user?.name || (log.userId ? log.userId.slice(0, 8) : 'Sistema / POS')}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {log.ipAddress || '127.0.0.1'}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-slate-300">
                            {log.payload ? (
                              <pre className="max-w-md truncate whitespace-pre-wrap font-sans text-[11px] text-slate-400">
                                {JSON.stringify(log.payload, null, 1).replace(/[\{\}"]/g, '')}
                              </pre>
                            ) : (
                              '--'
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
