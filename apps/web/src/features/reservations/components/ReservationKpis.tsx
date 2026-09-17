import React from 'react';
import { Users } from 'lucide-react';

interface ReservationKpisProps {
  pendingCount: number;
  confirmedCount: number;
  seatedCount: number;
  totalGuests: number;
}

export const ReservationKpis: React.FC<ReservationKpisProps> = ({
  pendingCount,
  confirmedCount,
  seatedCount,
  totalGuests,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <span className="text-xs text-slate-400 font-medium">Total Comensales</span>
        <div className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
          <Users className="w-5 h-5 text-pink-400" />
          {totalGuests}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <span className="text-xs text-amber-400 font-medium">Pendientes</span>
        <div className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <span className="text-xs text-blue-400 font-medium">Confirmadas</span>
        <div className="text-2xl font-black text-blue-300 mt-1">{confirmedCount}</div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <span className="text-xs text-emerald-400 font-medium">En Mesa (Sentados)</span>
        <div className="text-2xl font-black text-emerald-300 mt-1">{seatedCount}</div>
      </div>
    </div>
  );
};
