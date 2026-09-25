import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { TableItem } from '../types/salon.types';
import { TableCard } from './TableCard';
import { Button } from '@/components/ui/button';

interface Props {
  tables: TableItem[];
  hasFloorPlans?: boolean;
  isEditMode: boolean;
  isManager: boolean;
  onSelectTable: (table: TableItem) => void;
  onOpenCreateTable: () => void;
  onOpenNewFloorPlan?: () => void;
  onEditTable: (table: TableItem, e: React.MouseEvent) => void;
  onDeleteTable: (table: TableItem) => void;
  onStartTransfer: (table: TableItem) => void;
  onStartMerge: (table: TableItem) => void;
}

export const TablesGrid: React.FC<Props> = ({
  tables,
  hasFloorPlans = true,
  isEditMode,
  isManager,
  onSelectTable,
  onOpenCreateTable,
  onOpenNewFloorPlan,
  onEditTable,
  onDeleteTable,
  onStartTransfer,
  onStartMerge,
}) => {
  if (tables.length === 0) {
    if (!hasFloorPlans) {
      return (
        <div className="w-full min-w-0 bg-muted/40 border border-border rounded-2xl p-12 text-center text-muted-foreground">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-500/80" />
          <p className="text-base font-semibold text-foreground">Aún no hay ningún salón o zona creado</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Para comenzar a registrar mesas y pedidos, primero debes crear al menos un salón o zona (ej. Salón Principal, Terraza, etc.).
          </p>
          {isManager && onOpenNewFloorPlan && (
            <Button
              type="button"
              onClick={onOpenNewFloorPlan}
              className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 h-9 rounded-xl shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Salón</span>
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="w-full min-w-0 bg-muted/40 border border-border rounded-2xl p-12 text-center text-muted-foreground">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
        <p className="text-base font-semibold text-foreground">No hay mesas configuradas en esta zona.</p>
        {isManager && (
          <Button
            type="button"
            onClick={onOpenCreateTable}
            className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 h-9 rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear la primera mesa</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 auto-rows-fr">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          isEditMode={isEditMode}
          onSelect={(t) => (isEditMode ? onEditTable(t, {} as any) : onSelectTable(t))}
          onEdit={onEditTable}
          onDelete={onDeleteTable}
          onStartTransfer={onStartTransfer}
          onStartMerge={onStartMerge}
        />
      ))}
    </div>
  );
};

export default TablesGrid;
