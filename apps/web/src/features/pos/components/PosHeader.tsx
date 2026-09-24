import React from 'react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TableItem } from '../types/pos.types';
import { Select } from '@/components/common/native-select';
import { Badge } from '@/components/ui/badge';

interface Props {
  currentTable: TableItem | null;
  allTables: TableItem[];
  isCashShiftOpen: boolean | null;
  waiterName?: string;
  onSelectTable: (table: TableItem) => void;
}

export const PosHeader: React.FC<Props> = ({
  currentTable,
  allTables,
  isCashShiftOpen,
  waiterName,
  onSelectTable,
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-border gap-4">
    <div className="flex flex-wrap items-center gap-3">
      {/* Table Selector */}
      <div className="flex items-center space-x-2 bg-muted/40 border border-border rounded-xl px-3 py-1">
        <Users className="w-4 h-4 text-primary" />
        <div className="flex items-center space-x-1">
          <span className="text-xs text-muted-foreground font-medium">Mesa:</span>
          <Select
            value={currentTable?.id || ''}
            onChange={(e) => {
              const found = allTables.find((t) => t.id === e.target.value);
              if (found) onSelectTable(found);
            }}
            className="h-8 text-xs font-bold"
          >
            <option value="">Para Llevar / Sin Mesa</option>
            {allTables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.status === 'occupied' ? 'Ocupada' : t.status === 'paid_waiting_food' ? 'Pagada (Cocina)' : t.status === 'check_requested' ? 'Cuenta' : 'Libre'})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {waiterName && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Mesero: <strong className="text-foreground">{waiterName}</strong>
        </span>
      )}
    </div>

    <div>
      {isCashShiftOpen === false ? (
        <Badge variant="destructive" className="space-x-1.5 text-xs px-3 py-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Caja Cerrada (Turno sin abrir)</span>
        </Badge>
      ) : (
        <Badge variant="success" className="space-x-1.5 text-xs px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Caja Operativa</span>
        </Badge>
      )}
    </div>
  </div>
);
