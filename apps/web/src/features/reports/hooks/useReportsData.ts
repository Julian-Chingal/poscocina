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
