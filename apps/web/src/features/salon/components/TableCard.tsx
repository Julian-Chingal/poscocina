import React from 'react';
import {
  Users,
  Clock,
  Edit2,
  Trash2,
  Square,
  Circle as CircleIcon,
  RectangleHorizontal,
  ArrowRightLeft,
  GitMerge,
} from 'lucide-react';
import { TableItem } from '../types/salon.types';
import { TableStatusBadge } from '@/components/ui/status-badge';

interface Props {
  table: TableItem;
  isEditMode: boolean;
  onSelect: (table: TableItem) => void;
  onEdit: (table: TableItem, e: React.MouseEvent) => void;
  onDelete: (table: TableItem) => void;
  onStartTransfer: (table: TableItem) => void;
  onStartMerge: (table: TableItem) => void;
}

const getStatusColor = (status: TableItem['status']) => {
  switch (status) {
    case 'free':
      return 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 hover:border-emerald-400';
    case 'occupied':
      return 'bg-amber-950/40 border-amber-500/60 text-amber-400 hover:border-amber-400';
    case 'check_requested':
      return 'bg-purple-950/40 border-purple-500/60 text-purple-400 hover:border-purple-400 animate-pulse';
    case 'reserved':
      return 'bg-blue-950/40 border-blue-500/60 text-blue-400 hover:border-blue-400';
    case 'blocked':
      return 'bg-rose-950/40 border-rose-500/60 text-rose-400 hover:border-rose-400 opacity-60';
    default:
      return 'bg-slate-800 border-slate-700 text-slate-400';
  }
};

export const TableCard: React.FC<Props> = ({
  table,
  isEditMode,
  onSelect,
  onEdit,
  onDelete,
  onStartTransfer,
  onStartMerge,
}) => {
  const ShapeIcon =
    table.shape === 'circle' ? CircleIcon : table.shape === 'square' ? Square : RectangleHorizontal;

  return (
    <div
      onClick={() => onSelect(table)}
      className={`relative flex flex-col justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 ${getStatusColor(
        table.status
      )} ${isEditMode ? 'ring-2 ring-amber-500/50 hover:border-amber-400' : ''}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center space-x-1.5">
          <ShapeIcon className="w-4 h-4 opacity-70" />
          <span className="text-xl font-black tracking-tight text-white">{table.label}</span>
        </div>

        {isEditMode ? (
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => onEdit(table, e)}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(table)}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950 text-rose-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <TableStatusBadge status={table.status} />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between w-full text-xs text-slate-300">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{table.capacity} comensales</span>
        </div>
        {table.status === 'occupied' && !isEditMode && (
          <div className="flex items-center space-x-1 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Activa</span>
          </div>
        )}
      </div>

      {(table.status === 'occupied' || table.status === 'check_requested') && !isEditMode && (
        <div
          className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onStartTransfer(table)}
            className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition text-[11px] border border-slate-700/60"
          >
            <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
            <span>Cambiar</span>
          </button>

          <button
            type="button"
            onClick={() => onStartMerge(table)}
            className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition text-[11px] border border-slate-700/60"
          >
            <GitMerge className="w-3 h-3 text-amber-400" />
            <span>Unir</span>
          </button>
        </div>
      )}
    </div>
  );
};
