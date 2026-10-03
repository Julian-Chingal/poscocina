import React from 'react';
import { ChefHat, CheckCircle2, Timer, Clock3, Gauge } from 'lucide-react';
import { KdsMetrics } from '../types/reports.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface KitchenVelocityCardProps {
  kdsMetrics: KdsMetrics | null;
}

export const KitchenVelocityCard: React.FC<KitchenVelocityCardProps> = ({ kdsMetrics }) => {
  const avgMins = kdsMetrics?.avgPrepMinutes || 0;
  const targetMins = kdsMetrics?.targetMinutes || 15;
  const totalCompleted = kdsMetrics?.totalCompleted || 0;
  const totalPreparing = kdsMetrics?.totalPreparing || 0;
  const totalPending = kdsMetrics?.totalPending || 0;

  let speedStatus = {
    label: 'Sin datos recientes',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    textClass: 'text-muted-foreground',
  };

  if (avgMins > 0) {
    if (avgMins <= 10) {
      speedStatus = {
        label: 'Despacho Rápido',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        textClass: 'text-emerald-600 dark:text-emerald-400',
      };
    } else if (avgMins <= targetMins) {
      speedStatus = {
        label: 'En Objetivo',
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        textClass: 'text-blue-600 dark:text-blue-400',
      };
    } else {
      speedStatus = {
        label: 'Requiere Atención',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
        textClass: 'text-amber-600 dark:text-amber-400',
      };
    }
  }

  return (
    <Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
      <div>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="font-bold text-sm text-foreground">
                Velocidad en Cocina (KDS)
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                Tiempos de comanda a plato servido
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-1 space-y-4">
          {/* Average Prep Time Metric Hero */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tiempo Promedio
              </span>
            </div>

            <div className="flex items-baseline justify-center gap-1 my-1">
              <span className={`text-3xl font-extrabold tracking-tight ${avgMins > 0 ? speedStatus.textClass : 'text-foreground'}`}>
                {avgMins}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">min</span>
            </div>

            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1">
              <span className={speedStatus.textClass}>{speedStatus.label}</span>
              <span className="text-muted-foreground ml-1.5 font-normal">(Meta: ≤ {targetMins}m)</span>
            </div>
          </div>

          {/* Kitchen Orders Status Cards */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-xs">Platos Despachados</span>
              </div>
              <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {totalCompleted}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-foreground">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-xs">En Preparación Activa</span>
              </div>
              <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
                {totalPreparing}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/30 border border-border/50 text-foreground">
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-xs">En Cola de Espera</span>
              </div>
              <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-muted/60 text-foreground">
                {totalPending}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

