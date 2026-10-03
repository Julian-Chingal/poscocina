import React, { useState } from 'react';
import { Clock, Flame } from 'lucide-react';
import { HourlySale } from '../types/reports.types';
import { formatCurrency } from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HourlySalesChartProps {
  hourly: HourlySale[];
}

export const HourlySalesChart: React.FC<HourlySalesChartProps> = ({ hourly }) => {
  const [hoveredHour, setHoveredHour] = useState<HourlySale | null>(null);

  // Guarantee all 24 hours (0..23) are accounted for
  const hourMap = new Map<number, HourlySale>();
  (hourly || []).forEach((h) => hourMap.set(h.hour, h));

  const complete24Hours: HourlySale[] = [];
  for (let i = 0; i < 24; i++) {
    complete24Hours.push(
      hourMap.get(i) || {
        hour: i,
        hourLabel: `${String(i).padStart(2, '0')}:00`,
        sales: 0,
        tickets: 0,
      }
    );
  }

  const totalDaySales = complete24Hours.reduce((acc, h) => acc + h.sales, 0);
  const maxHourlySale = Math.max(...complete24Hours.map((h) => h.sales), 1);
  const peakHour = complete24Hours.reduce(
    (max, h) => (h.sales > max.sales ? h : max),
    complete24Hours[0]
  );
  const activeHoursCount = complete24Hours.filter((h) => h.sales > 0).length;

  return (
    <Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="font-bold text-sm text-foreground">
                Curva de Ventas por Hora del Día
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                Flujo horario (00:00 a 23:00) para optimización de personal y cocina
              </CardDescription>
            </div>
          </div>

          {peakHour?.sales > 0 && (
            <Badge
              variant="outline"
              className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 font-semibold flex items-center gap-1.5 w-fit"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Pico: {peakHour.hourLabel} • {formatCurrency(peakHour.sales)}
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-1 space-y-3">
        {/* Active Stats Pill */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pb-1">
          <span>
            {activeHoursCount > 0
              ? `${activeHoursCount} horas con actividad comercial`
              : 'Sin transacciones en este período'}
          </span>
          {hoveredHour && hoveredHour.sales > 0 ? (
            <span className="font-semibold text-foreground">
              {hoveredHour.hourLabel} — {formatCurrency(hoveredHour.sales)} ({hoveredHour.tickets} tickets)
            </span>
          ) : (
            <span>Total ventas: <strong className="text-foreground">{formatCurrency(totalDaySales)}</strong></span>
          )}
        </div>

        {/* 24-Column Bar Chart */}
        <div className="h-44 flex items-end gap-1 px-1 pt-6 pb-2 border-b border-border/60 relative">
          {complete24Hours.map((h) => {
            const isPeak = h.hour === peakHour?.hour && h.sales > 0;
            const hasSales = h.sales > 0;
            const heightPct = hasSales ? Math.max((h.sales / maxHourlySale) * 100, 10) : 0;
            const pctOfDay = totalDaySales > 0 ? Math.round((h.sales / totalDaySales) * 100) : 0;

            return (
              <div
                key={h.hour}
                onMouseEnter={() => setHoveredHour(h)}
                onMouseLeave={() => setHoveredHour(null)}
                className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
              >
                {/* Floating tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-150 bg-popover/95 backdrop-blur-xs border border-border text-popover-foreground text-[10px] py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-md flex flex-col items-center">
                  <span className="font-bold">{h.hourLabel} - {String(h.hour).padStart(2, '0')}:59</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatCurrency(h.sales)} {h.tickets > 0 ? `(${h.tickets} ped.)` : ''}
                  </span>
                  {hasSales && <span className="text-[9px] text-muted-foreground">{pctOfDay}% del volumen</span>}
                </div>

                {/* Column background track */}
                <div className="w-full h-full flex items-end justify-center rounded-t-sm group-hover:bg-muted/40 transition-colors">
                  {hasSales ? (
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                        isPeak
                          ? 'bg-amber-500 shadow-xs'
                          : 'bg-primary/80 group-hover:bg-primary'
                      }`}
                    />
                  ) : (
                    <div className="w-1.5 h-1 rounded-full bg-muted-foreground/20 mb-0.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestone hour labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground pt-1 px-1 font-mono">
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

