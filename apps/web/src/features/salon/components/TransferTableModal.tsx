import React from 'react';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';
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
import { TableItem, FloorPlanItem } from '../types/salon.types';

interface Props {
  sourceTable: TableItem | null;
  tables: TableItem[];
  floorPlans: FloorPlanItem[];
  targetZone: string;
  selectedTargetTableId: string;
  actionLoading: boolean;
  actionError: string | null;
  onClose: () => void;
  onZoneChange: (zone: string) => void;
  onTargetTableChange: (id: string) => void;
  onConfirm: () => Promise<void>;
}

export const TransferTableModal: React.FC<Props> = ({
  sourceTable,
  tables,
  floorPlans,
  targetZone,
  selectedTargetTableId,
  actionLoading,
  actionError,
  onClose,
  onZoneChange,
  onTargetTableChange,
  onConfirm,
}) => {
  if (!sourceTable) return null;

  const freeTables = tables.filter(
    (t) =>
      t.id !== sourceTable.id &&
      t.status === 'free' &&
      (targetZone === 'all' || t.floorPlanId === targetZone)
  );

  return (
    <Dialog open={Boolean(sourceTable)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase mb-1">
            <ArrowRightLeft className="w-4 h-4" />
            <span>Operación de Sala</span>
          </div>
          <DialogTitle>Cambiar de Mesa</DialogTitle>
          <DialogDescription>
            Trasladar la comanda activa de <strong className="text-foreground">{sourceTable.label}</strong> hacia una mesa disponible.
          </DialogDescription>
        </DialogHeader>

        {actionError && (
          <div className="p-3 bg-destructive/15 border border-destructive/30 text-destructive text-xs rounded-xl mb-4">
            {actionError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Filtrar por Zona o Salón:</Label>
            <Select
              value={targetZone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="h-10 rounded-xl mb-3"
            >
              <option value="all">Todas las Zonas ({floorPlans.length})</option>
              {floorPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </Select>
          </div>

          {freeTables.length === 0 ? (
            <Card className="p-4 bg-muted/40 rounded-2xl border-border text-center text-muted-foreground text-xs">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1.5 text-amber-500" />
              <span>No hay mesas libres disponibles en la zona seleccionada.</span>
            </Card>
          ) : (
            <div>
              <Label className="mb-1.5 block">Selecciona la Mesa Destino (Libre):</Label>
              <Select
                value={selectedTargetTableId}
                onChange={(e) => onTargetTableChange(e.target.value)}
                className="h-10 rounded-xl"
              >
                <option value="">-- Elige una mesa libre --</option>
                {freeTables.map((t) => {
                  const plan = floorPlans.find((p) => p.id === t.floorPlanId);
                  return (
                    <option key={t.id} value={t.id}>
                      [{plan ? plan.name : 'Zona'}] {t.label} (Cap: {t.capacity} personas)
                    </option>
                  );
                })}
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!selectedTargetTableId || actionLoading}
              onClick={onConfirm}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center space-x-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Trasladando...' : 'Confirmar Traslado'}</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferTableModal;
