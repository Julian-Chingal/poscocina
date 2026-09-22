import React from 'react';
import { GitMerge, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select } from '@/components/common/native-select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TableItem } from '../types/salon.types';

interface Props {
  sourceTable: TableItem | null;
  tables: TableItem[];
  selectedTargetTableId: string;
  actionLoading: boolean;
  actionError: string | null;
  onClose: () => void;
  onTargetTableChange: (id: string) => void;
  onConfirm: () => Promise<void>;
}

export const MergeTablesModal: React.FC<Props> = ({
  sourceTable,
  tables,
  selectedTargetTableId,
  actionLoading,
  actionError,
  onClose,
  onTargetTableChange,
  onConfirm,
}) => {
  if (!sourceTable) return null;

  const occupiedTables = tables.filter(
    (t) =>
      t.id !== sourceTable.id &&
      (t.status === 'occupied' || t.status === 'check_requested')
  );

  return (
    <Dialog open={Boolean(sourceTable)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
            <GitMerge className="w-4 h-4" />
            <span>Operación de Sala</span>
          </div>
          <DialogTitle className="text-xl font-black">Unir Mesas (Fusión)</DialogTitle>
          <DialogDescription>
            Todos los ítems de <strong className="text-foreground">{sourceTable.label}</strong> se transferirán a la mesa seleccionada, liberando luego la mesa origen.
          </DialogDescription>
        </DialogHeader>

        {actionError && (
          <div className="p-3 bg-destructive/15 border border-destructive/30 text-destructive text-xs rounded-xl mb-4">
            {actionError}
          </div>
        )}

        {occupiedTables.length === 0 ? (
          <Card className="p-6 bg-muted/40 rounded-2xl border-border text-center text-muted-foreground text-xs">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <span>No hay otras mesas ocupadas para fusionar.</span>
          </Card>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Selecciona la Mesa Destino Principal:</Label>
              <Select
                value={selectedTargetTableId}
                onChange={(e) => onTargetTableChange(e.target.value)}
                className="h-10 rounded-xl"
              >
                <option value="">-- Elige la mesa receptora --</option>
                {occupiedTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} (Orden activa)
                  </option>
                ))}
              </Select>
            </div>

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!selectedTargetTableId || actionLoading}
                onClick={onConfirm}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center space-x-1.5"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>{actionLoading ? 'Uniendo...' : 'Confirmar Fusión'}</span>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MergeTablesModal;
