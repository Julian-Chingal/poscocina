import React from 'react';
import { Calendar, Plus } from 'lucide-react';

interface ReservationsHeaderProps {
  onOpenNew: () => void;
}

export const ReservationsHeader: React.FC<ReservationsHeaderProps> = ({ onOpenNew }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Calendar className="w-7 h-7 text-pink-500" />
          <span>Reservas de Mesas</span>
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Gestión de reservas anticipadas, asignación de mesas y bienvenida a comensales.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onOpenNew}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Reserva</span>
        </button>
      </div>
    </div>
  );
};
