import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReservationsHeaderProps {
  onOpenNew: () => void;
}

export const ReservationsHeader: React.FC<ReservationsHeaderProps> = ({ onOpenNew }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center space-x-2">
          <Calendar className="w-7 h-7 text-primary" />
          <span>Reservas de Mesas</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gestión de reservas anticipadas, asignación de mesas y bienvenida a comensales.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          type="button"
          onClick={onOpenNew}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 h-auto rounded-xl shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Reserva</span>
        </Button>
      </div>
    </div>
  );
};
