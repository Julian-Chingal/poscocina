import React from 'react';
import { ChefHat } from 'lucide-react';
import { KdsMetrics } from '../types/reports.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface KitchenVelocityCardProps {
  kdsMetrics: KdsMetrics | null;
}

export const KitchenVelocityCard: React.FC<KitchenVelocityCardProps> = ({ kdsMetrics }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-6 pb-4 flex flex-row items-center gap-2 space-y-0">
        <ChefHat className="w-5 h-5 text-destructive" />
        <div>
          <CardTitle className="font-bold text-sm text-foreground">Velocidad en Cocina (KDS)</CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">Tiempos de preparación y estado</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-4">
        {/* Average Prep Time Metric */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border text-center">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Tiempo Promedio de Preparación
          </span>
          <div className="text-3xl font-black text-destructive tracking-tight">
            {kdsMetrics?.avgPrepMinutes || 0} <span className="text-sm font-semibold text-muted-foreground">min</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Desde comanda enviada hasta marcada como lista</p>
        </div>

        {/* Kitchen Orders Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <span>Platos Despachados:</span>
            <span className="font-bold">{kdsMetrics?.totalCompleted || 0}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <span>En Preparación Ahora:</span>
            <span className="font-bold">{kdsMetrics?.totalPreparing || 0}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 border border-border text-foreground">
            <span>Pendientes en Cola:</span>
            <span className="font-bold">{kdsMetrics?.totalPending || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
