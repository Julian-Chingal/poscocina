import { useState, useEffect, useCallback } from 'react';
import { reportsApi } from '../api/reports.api';
import {
  ReportPeriod,
  OverviewMetrics,
  HourlySale,
  TopProduct,
  KdsMetrics,
  CogsMetrics,
} from '../types/reports.types';

export const useReportsData = (venueId?: string | null, companyName?: string) => {
  const [period, setPeriod] = useState<ReportPeriod>('today');
  const [isLoading, setIsLoading] = useState(true);

  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [hourly, setHourly] = useState<HourlySale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [kdsMetrics, setKdsMetrics] = useState<KdsMetrics | null>(null);
  const [cogsMetrics, setCogsMetrics] = useState<CogsMetrics | null>(null);

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
        reportsApi.getOverview(params),
        reportsApi.getHourlySales(params),
        reportsApi.getTopProducts(params),
        reportsApi.getKdsMetrics(params),
        reportsApi.getCogsProfitability(params),
      ]);

      // Normalize overview and payment methods
      if (resOverview) {
        const rawMethods = resOverview.paymentMethods || resOverview.salesByPaymentMethod || [];
        const totalSales = Number(resOverview.totalSales || 0);
        const normalizedMethods = rawMethods.map((m: any) => {
          const amount = Number(m.totalAmount ?? m.total ?? 0);
          const tip = Number(m.totalTip ?? m.tip ?? 0);
          const count = Number(m.count ?? 0);
          const percentage = m.percentage !== undefined
            ? Number(m.percentage)
            : totalSales > 0 ? Math.round((amount / totalSales) * 100) : 0;
          return {
            method: m.method,
            totalAmount: amount,
            totalTip: tip,
            count,
            percentage,
          };
        });

        setOverview({
          ...resOverview,
          totalSales,
          subtotalSales: Number(resOverview.subtotalSales || 0),
          taxTotal: Number(resOverview.taxTotal || 0),
          discountTotal: Number(resOverview.discountTotal || 0),
          ticketCount: Number(resOverview.ticketCount || 0),
          avgTicket: Number(resOverview.avgTicket || 0),
          totalTips: Number(resOverview.totalTips || 0),
          paymentMethods: normalizedMethods,
        });
      } else {
        setOverview(null);
      }

      // Normalize hourly sales to full 24-hour array (00:00 to 23:00)
      const hourlyList = Array.isArray(resHourly) ? resHourly : [];
      const hourMap = new Map<number, { sales: number; tickets: number }>();
      for (const h of hourlyList) {
        hourMap.set(h.hour, {
          sales: Number(h.sales || 0),
          tickets: Number(h.tickets ?? h.orderCount ?? 0),
        });
      }

      const full24Hours: HourlySale[] = [];
      for (let hour = 0; hour < 24; hour++) {
        const existing = hourMap.get(hour);
        full24Hours.push({
          hour,
          hourLabel: `${String(hour).padStart(2, '0')}:00`,
          sales: existing ? existing.sales : 0,
          tickets: existing ? existing.tickets : 0,
        });
      }
      setHourly(full24Hours);

      // Normalize top products
      const rawProducts = Array.isArray(resTop) ? resTop : [];
      const normalizedProducts: TopProduct[] = rawProducts.map((p: any, idx: number) => {
        const qty = Number(p.quantity ?? p.unitsSold ?? 0);
        const rev = Number(p.revenue ?? p.totalRevenue ?? 0);
        const unitPrice = p.price !== undefined && !isNaN(Number(p.price))
          ? Number(p.price)
          : qty > 0 ? Math.round(rev / qty) : 0;

        return {
          id: String(p.id ?? p.productId ?? `prod-${idx}`),
          productId: p.productId,
          name: p.name || p.productName || 'Producto sin nombre',
          category: p.category || p.categoryName || 'General',
          quantity: qty,
          unitsSold: qty,
          price: unitPrice,
          revenue: rev,
        };
      });
      setTopProducts(normalizedProducts);

      // Normalize KDS metrics
      if (resKds) {
        setKdsMetrics({
          avgPrepMinutes: Number(resKds.avgPrepMinutes ?? resKds.avgPrepTimeMinutes ?? 0),
          totalCompleted: Number(resKds.totalCompleted ?? resKds.totalOrdersPrepared ?? 0),
          totalPreparing: Number(resKds.totalPreparing ?? 0),
          totalPending: Number(resKds.totalPending ?? 0),
          targetMinutes: Number(resKds.targetMinutes ?? 15),
        });
      } else {
        setKdsMetrics(null);
      }

      // Normalize COGS metrics
      if (Array.isArray(resCogs)) {
        // Legacy array response
        let rev = 0;
        for (const item of resCogs) {
          rev += Number(item.totalRevenue ?? item.revenue ?? 0);
        }
        const cogs = Math.round(rev * 0.35);
        const profit = rev - cogs;
        setCogsMetrics({
          totalRevenue: rev,
          totalCogs: cogs,
          grossProfit: profit,
          grossMarginPct: rev > 0 ? Math.round((profit / rev) * 100) : 0,
          items: resCogs,
        });
      } else if (resCogs && typeof resCogs === 'object') {
        setCogsMetrics({
          totalRevenue: Number(resCogs.totalRevenue || 0),
          totalCogs: Number(resCogs.totalCogs || 0),
          grossProfit: Number(resCogs.grossProfit || 0),
          grossMarginPct: Number(resCogs.grossMarginPct || 0),
          items: resCogs.items || [],
        });
      } else {
        setCogsMetrics(null);
      }
    } catch (err) {
      console.error('Error cargando analítica:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getDateRange, venueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const exportCSV = () => {
    if (!overview) return;
    const lines = [
      ['REPORTE DE VENTAS - POSCOCINA', companyName || ''],
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

  return {
    period,
    isLoading,
    overview,
    hourly,
    topProducts,
    kdsMetrics,
    cogsMetrics,
    setPeriod,
    refreshData: loadData,
    exportCSV,
  };
};
