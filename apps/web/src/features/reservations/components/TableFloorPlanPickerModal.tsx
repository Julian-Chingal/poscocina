import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Users,
  Check,
  LayoutGrid,
  Map as MapIcon,
  Info,
  Layers,
} from 'lucide-react';
import { TableItem, FloorPlanItem } from '../types/reservations.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TableFloorPlanPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableItem[];
  floorPlans: FloorPlanItem[];
  selectedTableId: string;
  onSelectTable: (tableId: string) => void;
  guestCount?: number;
}

export const TableFloorPlanPickerModal: React.FC<TableFloorPlanPickerModalProps> = ({
  isOpen,
  onClose,
  tables,
  floorPlans,
  selectedTableId,
  onSelectTable,
  guestCount = 2,
}) => {
  // Temporary selection inside modal
  const [tempSelectedId, setTempSelectedId] = useState<string>(selectedTableId);
  const [activePlanId, setActivePlanId] = useState<string>(() => {
    if (floorPlans.length > 0) return floorPlans[0].id;
    return 'all';
  });
  const [displayMode, setDisplayMode] = useState<'canvas' | 'grid'>('canvas');

  // Sync when opening
  React.useEffect(() => {
    if (isOpen) {
      setTempSelectedId(selectedTableId);
      // Auto-focus on the floor plan of the selected table if any
      const currentTable = tables.find((t) => t.id === selectedTableId);
      if (currentTable?.floorPlanId) {
        setActivePlanId(currentTable.floorPlanId);
      } else if (floorPlans.length > 0) {
        setActivePlanId(floorPlans[0].id);
      } else {
        setActivePlanId('all');
      }
    }
  }, [isOpen, selectedTableId, tables, floorPlans]);

  // Filter tables by active floor plan
  const visibleTables = useMemo(() => {
    if (activePlanId === 'all') return tables;
    return tables.filter((t) => t.floorPlanId === activePlanId);
  }, [tables, activePlanId]);

  const activePlanName = useMemo(() => {
    if (activePlanId === 'all') return 'Todas las zonas';
    const plan = floorPlans.find((p) => p.id === activePlanId);
    return plan?.name || 'Zona';
  }, [floorPlans, activePlanId]);

  const selectedTableObj = useMemo(() => {
    return tables.find((t) => t.id === tempSelectedId);
  }, [tables, tempSelectedId]);

  // Determine canvas bounds for relative positioning
  const canvasDimensions = useMemo(() => {
    let maxX = 800;
    let maxY = 550;
    visibleTables.forEach((t) => {
      const x = Number(t.positionX) || 0;
      const y = Number(t.positionY) || 0;
      if (x > maxX - 120) maxX = x + 140;
      if (y > maxY - 100) maxY = y + 120;
    });
    return { width: Math.max(maxX, 800), height: Math.max(maxY, 500) };
  }, [visibleTables]);

  const handleConfirm = () => {
    onSelectTable(tempSelectedId);
    onClose();
  };

  const handleClearSelection = () => {
    setTempSelectedId('');
    onSelectTable('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="2xl" onClose={onClose} className="max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl">
        {/* Modal Header */}
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/80 bg-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <MapIcon className="w-5 h-5 text-primary" />
                <span>Plano de Mesas del Salón</span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selecciona visualmente la mesa adecuada para la reserva ({guestCount} comensales esperados).
              </p>
            </div>

            {/* View Mode Switcher: Canvas vs Grid */}
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/70 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setDisplayMode('canvas')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  displayMode === 'canvas'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Plano Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  displayMode === 'grid'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
            </div>
          </div>

          {/* Floor Plans / Zones Tab Navigation */}
          {floorPlans.length > 0 && (
            <div className="flex items-center gap-1.5 pt-3 overflow-x-auto scrollbar-none">
              {floorPlans.map((plan) => {
                const count = tables.filter((t) => t.floorPlanId === plan.id).length;
                const isSelected = activePlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setActivePlanId(plan.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                    }`}
                  >
                    <span>{plan.name}</span>
                    <Badge
                      variant={isSelected ? 'secondary' : 'outline'}
                      className="text-[10px] px-1.5 py-0 h-4 min-w-4 text-center"
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setActivePlanId('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activePlanId === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todas ({tables.length})</span>
              </button>
            </div>
          )}
        </DialogHeader>

        {/* Modal Body: Interactive Canvas or Grid */}
        <div className="flex-1 overflow-auto p-4 bg-muted/20 min-h-[380px] max-h-[58vh]">
          {visibleTables.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <MapPin className="w-10 h-10 mb-2 opacity-40 text-muted-foreground" />
              <p className="font-semibold text-foreground text-sm">No hay mesas en esta zona</p>
              <p className="text-xs text-muted-foreground mt-1">
                Puedes agregar o configurar mesas en el módulo de Salón.
              </p>
            </div>
          ) : displayMode === 'canvas' ? (
            /* Visual Canvas View */
            <div
              className="relative rounded-2xl bg-card border border-border/80 shadow-inner overflow-auto min-w-[700px] min-h-[460px] p-6"
              style={{
                backgroundImage:
                  'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                width: `${canvasDimensions.width}px`,
                height: `${canvasDimensions.height}px`,
              }}
            >
              {visibleTables.map((t) => {
                const isSelected = tempSelectedId === t.id;
                const fitsGuests = t.capacity >= guestCount;
                const x = Number(t.positionX) || 60;
                const y = Number(t.positionY) || 60;
                const shape = t.shape || 'rect';

                // Shape styling
                const shapeClass =
                  shape === 'circle'
                    ? 'rounded-full'
                    : shape === 'square'
                    ? 'rounded-2xl'
                    : 'rounded-2xl';

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTempSelectedId(t.id)}
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      width: shape === 'rect' ? '120px' : '96px',
                      height: '96px',
                    }}
                    className={`absolute p-2 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer select-none group border-2 ${shapeClass} ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/30 shadow-xl scale-105 z-20'
                        : fitsGuests
                        ? 'bg-card hover:bg-muted/80 border-primary/40 hover:border-primary shadow-sm hover:scale-102 z-10'
                        : 'bg-card/70 hover:bg-card border-border/70 text-muted-foreground hover:text-foreground opacity-80 hover:opacity-100 shadow-xs'
                    }`}
                  >
                    {/* Top status tag */}
                    <div className="flex items-center justify-between w-full px-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          t.status === 'free'
                            ? 'bg-emerald-500'
                            : t.status === 'occupied'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : fitsGuests ? (
                        <span className="text-[10px] font-bold text-primary dark:text-primary-foreground/90">
                          Apta
                        </span>
                      ) : null}
                    </div>

                    {/* Table Label */}
                    <div className="font-black text-sm tracking-tight leading-tight truncate px-1">
                      {t.label}
                    </div>

                    {/* Capacity badge */}
                    <div
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>{t.capacity}p</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleTables.map((t) => {
                const isSelected = tempSelectedId === t.id;
                const fitsGuests = t.capacity >= guestCount;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTempSelectedId(t.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30 shadow-md'
                        : fitsGuests
                        ? 'bg-card hover:bg-muted/60 border-primary/30 hover:border-primary shadow-xs'
                        : 'bg-card hover:bg-muted/40 border-border/70 text-muted-foreground opacity-85'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-black text-sm block leading-tight">
                          {t.label}
                        </span>
                        <span
                          className={`text-[11px] block mt-0.5 ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          Capacidad: {t.capacity} personas
                        </span>
                      </div>

                      {isSelected ? (
                        <div className="p-1 rounded-full bg-white text-primary">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : fitsGuests ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border border-primary/20"
                        >
                          Apta
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/40 text-[11px]">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          t.status === 'free'
                            ? 'bg-emerald-500'
                            : t.status === 'occupied'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="capitalize font-medium">
                        {t.status === 'free'
                          ? 'Libre'
                          : t.status === 'occupied'
                          ? 'Ocupada'
                          : 'Reservada'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Selection Summary and Actions */}
        <DialogFooter className="p-3.5 sm:p-4 bg-card border-t border-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {selectedTableObj ? (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-foreground">
                    {selectedTableObj.label} seleccionada
                  </span>
                  <span className="text-muted-foreground ml-1.5">
                    ({selectedTableObj.capacity} personas • {activePlanName})
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>Ninguna mesa seleccionada (se puede asignar en recepción).</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            {tempSelectedId && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleClearSelection}
                className="text-xs text-muted-foreground hover:text-foreground h-9 rounded-xl"
              >
                Quitar Mesa
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onClose}
              className="text-xs h-9 rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              size="sm"
              type="button"
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
            >
              {tempSelectedId ? 'Asignar Mesa al Formulario' : 'Cerrar sin Asignar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TableFloorPlanPickerModal;
