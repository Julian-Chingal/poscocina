import React from 'react';
import { Calendar, Plus, LayoutGrid, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReservationsHeaderProps {
  onOpenNew: () => void;
  viewMode: 'grid' | 'timeline';
  onToggleViewMode: (mode: 'grid' | 'timeline') => void;
  totalActive?: number;
}

export const ReservationsHeader: React.FC<ReservationsHeaderProps> = ({
  onOpenNew,
  viewMode,
  onToggleViewMode,
  totalActive = 0,
}) => {
  const todayLabel = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const formattedToday = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-5 mb-5 border-b border-border/80 gap-4">
      {/* Title & Context */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Libro de Reservas
          </h2>
          <Badge
            variant="outline"
            className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-muted/60 text-muted-foreground border-border flex items-center gap-1.5 capitalize"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {formattedToday}
          </Badge>
          {totalActive > 0 && (
            <Badge
              variant="secondary"
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20"
            >
              {totalActive} activas
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm pl-0.5">
          Control de reservas anticipadas, aforo del salón y bienvenida a comensales.
        </p>
      </div>

      {/* Right Controls: View Switcher + New Reservation CTA */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/80">
          <button
            type="button"
            onClick={() => onToggleViewMode('grid')}
            title="Vista en tarjetas cuadrícula"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tarjetas</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('timeline')}
            title="Vista cronológica por turno de servicio"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Por Turnos</span>
          </button>
        </div>

        {/* Primary Action Button */}
        <Button
          type="button"
          onClick={onOpenNew}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 h-9 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Reserva</span>
        </Button>
      </div>
    </div>
  );
};

export default ReservationsHeader;
