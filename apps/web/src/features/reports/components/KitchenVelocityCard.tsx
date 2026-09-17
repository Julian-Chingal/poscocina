import React from 'react';
import { ChefHat } from 'lucide-react';
import { KdsMetrics } from '../types/reports.types';

interface KitchenVelocityCardProps {
  kdsMetrics: KdsMetrics | null;
}

export const KitchenVelocityCard: React.FC<KitchenVelocityCardProps> = ({ kdsMetrics }) => {
  return (
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
  );
};
