import React from 'react';
import { Settings2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  isEditMode: boolean;
  isManager: boolean;
  onToggleEditMode: () => void;
  onOpenCreateTable: () => void;
}

export const SalonHeader: React.FC<Props> = ({
  isEditMode,
  isManager,
  onToggleEditMode,
  onOpenCreateTable,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Mapa de Salón y Mesas</span>
          {isEditMode && (
            <Badge variant="outline" className="text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border-amber-500/40">
              Modo Edición
            </Badge>
          )}
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {isEditMode
            ? 'Agrega, edita capacidades o elimina mesas de la sala.'
            : 'Supervisa el estado de las mesas en tiempo real y asigna comandas.'}
        </p>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Status Legend */}
        <div className="hidden lg:flex items-center space-x-3 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Libre</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Ocupada</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-slate-300">En Cuenta</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-300">Reservada</span>
          </div>
        </div>

        {/* Manager Controls */}
        {isManager && (
          <div className="flex items-center space-x-2">
            <Button
              variant={isEditMode ? 'default' : 'ghost'}
              type="button"
              onClick={onToggleEditMode}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 h-9 rounded-xl border transition ${
                isEditMode
                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Finalizar Edición' : 'Editar Salón'}</span>
            </Button>

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
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonHeader;
