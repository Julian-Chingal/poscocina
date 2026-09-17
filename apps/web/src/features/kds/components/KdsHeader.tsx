import React from 'react';
import { ChefHat, UtensilsCrossed } from 'lucide-react';

interface KdsHeaderProps {
  activeCount: number;
}

export const KdsHeader: React.FC<KdsHeaderProps> = ({ activeCount }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="bg-rose-600 p-2.5 rounded-2xl text-white shadow-lg shadow-rose-600/30">
          <ChefHat className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">KDS — Pantalla de Producción</h2>
          <p className="text-slate-400 text-xs">
            Pase de comandas y control de tiempos por estación en tiempo real.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs font-semibold bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300">
        <UtensilsCrossed className="w-4 h-4 text-orange-400" />
        <span>Comandas activas:</span>
        <span className="text-orange-400 font-mono font-bold ml-1">{activeCount}</span>
      </div>
    </div>
  );
};
