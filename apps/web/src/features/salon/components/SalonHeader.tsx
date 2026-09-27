import { Settings2, Plus, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  isEditMode: boolean;
  isManager: boolean;
  hasFloorPlans?: boolean;
  viewMode: 'canvas' | 'grid';
  onToggleViewMode: (mode: 'canvas' | 'grid') => void;
  onToggleEditMode: () => void;
  onOpenCreateTable: () => void;
  onOpenNewFloorPlan?: () => void;
}

export const SalonHeader: React.FC<Props> = ({
  isEditMode,
  isManager,
  hasFloorPlans = true,
  viewMode,
  onToggleViewMode,
  onToggleEditMode,
  onOpenCreateTable,
  onOpenNewFloorPlan,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center space-x-2">
          <span>Mapa de Salón y Mesas</span>
          {isEditMode && (
            <Badge variant="outline" className="text-xs font-bold uppercase bg-amber-500/20 text-amber-500 border-amber-500/40">
              Modo Edición
            </Badge>
          )}
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          {isEditMode
            ? 'Agrega zonas, edita capacidades o elimina mesas de la sala.'
            : 'Supervisa el estado de las mesas en tiempo real y asigna comandas.'}
        </p>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Status Legend */}
        <div className="hidden lg:flex items-center space-x-3 bg-muted/50 px-3.5 py-2 rounded-xl border border-border text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-muted-foreground">Libre</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-muted-foreground">Ocupada</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-muted-foreground">En Cuenta</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-muted-foreground">Reservada</span>
          </div>
        </div>

        {/* View Mode Toggle: Canvas / Grid */}
        <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggleViewMode('canvas')}
            className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'canvas'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 mr-1 text-primary" />
            <span className="hidden sm:inline">Plano Visual</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggleViewMode('grid')}
            className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Tarjetas</span>
          </Button>
        </div>

        {/* Manager Controls */}
        {isManager && (
          <div className="flex items-center space-x-2">
            {!hasFloorPlans && onOpenNewFloorPlan ? (
              <Button
                type="button"
                onClick={onOpenNewFloorPlan}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 h-9 rounded-xl shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Salón</span>
              </Button>
            ) : (
              <>
                <Button
                  variant={isEditMode ? 'default' : 'ghost'}
                  type="button"
                  onClick={onToggleEditMode}
                  className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 h-9 rounded-xl border transition ${
                    isEditMode
                      ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500'
                      : 'bg-card border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Finalizar Edición' : 'Editar Salón'}</span>
                </Button>

                {isEditMode && onOpenNewFloorPlan && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenNewFloorPlan}
                    className="flex items-center space-x-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold px-3 h-9 rounded-xl shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Zona</span>
                  </Button>
                )}

                {isEditMode && (
                  <Button
                    type="button"
                    onClick={onOpenCreateTable}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 h-9 rounded-xl shadow transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Mesa</span>
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonHeader;
