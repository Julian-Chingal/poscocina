import React from 'react';
import { Clock } from 'lucide-react';
import { HourlySale } from '../types/reports.types';
import { formatCurrency } from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HourlySalesChartProps {
  hourly: HourlySale[];
}

export const HourlySalesChart: React.FC<HourlySalesChartProps> = ({ hourly }) => {
  const maxHourlySale = Math.max(...hourly.map((h) => h.sales), 1);
  const peakHour = hourly.reduce(
    (max, h) => (h.sales > max.sales ? h : max),
    hourly[0] || { hourLabel: '--', sales: 0, hour: -1, tickets: 0 }
  );

  return (
    <Card className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
      <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <CardTitle className="font-bold text-sm text-white">Curva de Ventas por Hora del Día</CardTitle>
            <CardDescription className="text-[11px] text-slate-400">Distribución para detección de horas pico y dimensionamiento de personal</CardDescription>
          </div>
        </div>
        {peakHour?.sales > 0 && (
          <Badge variant="outline" className="text-[11px] bg-amber-500/20 text-amber-300 border-amber-500/30 font-medium">
            Pico: {peakHour.hourLabel} ({formatCurrency(peakHour.sales)})
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-6 pt-0">
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
      </CardContent>
    </Card>
  );
};
