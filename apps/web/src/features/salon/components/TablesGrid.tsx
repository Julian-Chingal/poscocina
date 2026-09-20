import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { TableItem } from '../types/salon.types';
import { TableCard } from './TableCard';
import { Button } from '@/components/ui/button';

interface Props {
  tables: TableItem[];
  isEditMode: boolean;
  isManager: boolean;
  onSelectTable: (table: TableItem) => void;
  onOpenCreateTable: () => void;
  onEditTable: (table: TableItem, e: React.MouseEvent) => void;
  onDeleteTable: (table: TableItem) => void;
  onStartTransfer: (table: TableItem) => void;
  onStartMerge: (table: TableItem) => void;
}

export const TablesGrid: React.FC<Props> = ({
  tables,
  isEditMode,
  isManager,
  onSelectTable,
  onOpenCreateTable,
  onEditTable,
  onDeleteTable,
  onStartTransfer,
  onStartMerge,
}) => {
  if (tables.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-600" />
        <p className="text-base font-semibold text-slate-300">No hay mesas configuradas en esta zona.</p>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
