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
import { TableStatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
      return 'bg-emerald-500/10 border-emerald-500/40 text-foreground hover:border-emerald-500/70';
    case 'occupied':
      return 'bg-amber-500/10 border-amber-500/40 text-foreground hover:border-amber-500/70';
    case 'check_requested':
      return 'bg-purple-500/10 border-purple-500/40 text-foreground hover:border-purple-500/70 animate-pulse';
    case 'reserved':
      return 'bg-blue-500/10 border-blue-500/40 text-foreground hover:border-blue-500/70';
    case 'blocked':
      return 'bg-destructive/10 border-destructive/40 text-muted-foreground hover:border-destructive/70 opacity-60';
    default:
      return 'bg-card border-border text-foreground';
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
    <Card
      onClick={() => onSelect(table)}
      className={`w-full h-full min-w-0 relative flex flex-col justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 ${getStatusColor(
        table.status
      )} ${isEditMode ? 'ring-2 ring-amber-500/50 hover:border-amber-400' : ''}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center space-x-1.5">
          <ShapeIcon className="w-4 h-4 opacity-70" />
          <span className="text-xl font-black tracking-tight text-foreground">{table.label}</span>
        </div>

        {isEditMode ? (
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={(e) => onEdit(table, e)}
              className="h-7 w-7 p-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onDelete(table)}
              className="h-7 w-7 p-1 rounded-lg bg-muted hover:bg-destructive/20 text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <TableStatusBadge status={table.status} />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between w-full text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{table.capacity} comensales</span>
        </div>
        {table.status === 'occupied' && !isEditMode && (
          <div className="flex items-center space-x-1 text-amber-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Activa</span>
          </div>
        )}
      </div>

      {(table.status === 'occupied' || table.status === 'check_requested') && !isEditMode && (
        <div
          className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onStartTransfer(table)}
            className="px-2 h-7 rounded-lg bg-card hover:bg-muted text-foreground flex items-center space-x-1 text-[11px] border border-border"
          >
            <ArrowRightLeft className="w-3 h-3 text-cyan-500" />
            <span>Cambiar</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onStartMerge(table)}
            className="px-2 h-7 rounded-lg bg-card hover:bg-muted text-foreground flex items-center space-x-1 text-[11px] border border-border"
          >
            <GitMerge className="w-3 h-3 text-amber-500" />
            <span>Unir</span>
          </Button>
        </div>
      )}
    </Card>
  );
};

export default TableCard;
