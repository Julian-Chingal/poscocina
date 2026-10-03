import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Utensils,
  MapPin,
  Map as MapIcon,
  X,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { TableItem, FloorPlanItem } from '../types/reservations.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableFloorPlanPickerModal } from './TableFloorPlanPickerModal';

interface ReservationDateTimeFieldsProps {
  formDate: string;
  onDateChange: (d: string) => void;
  formTime: string;
  onTimeChange: (t: string) => void;
  guestCount: number;
  onGuestCountChange: (cnt: number) => void;
  tableId: string;
  onTableIdChange: (id: string) => void;
  tables: TableItem[];
  floorPlans?: FloorPlanItem[];
}

const PARTY_SIZES = [1, 2, 4, 6, 8, 12];

export const ReservationDateTimeFields: React.FC<ReservationDateTimeFieldsProps> = ({
  formDate,
  onDateChange,
  formTime,
  onTimeChange,
  guestCount,
  onGuestCountChange,
  tableId,
  onTableIdChange,
  tables,
  floorPlans = [],
}) => {
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);

  const selectedTable = tables.find((t) => t.id === tableId);
  const selectedFloorPlan = selectedTable?.floorPlanId
    ? floorPlans.find((fp) => fp.id === selectedTable.floorPlanId)
    : null;

  return (
    <div className="space-y-4">
      {/* Date & Time Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Fecha *</span>
          </Label>
          <Input
            type="date"
            required
            value={formDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-9 text-xs rounded-xl bg-card border-border/80 focus-visible:ring-primary/40 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Hora *</span>
          </Label>
          <Input
            type="time"
            required
            value={formTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="h-9 text-xs rounded-xl bg-card border-border/80 focus-visible:ring-primary/40 cursor-pointer font-mono"
          />
        </div>
      </div>

      {/* Guest Count with Quick Party Size Selectors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Número de Comensales *</span>
          </Label>
          <span className="text-[11px] text-muted-foreground font-medium">
            {guestCount} {guestCount === 1 ? 'persona' : 'personas'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Party Size Chips */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 flex-1 overflow-x-auto">
            {PARTY_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onGuestCountChange(size)}
                className={`flex-1 min-w-8 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                  guestCount === size
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Stepper controls */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-foreground font-mono">
              {guestCount}
            </span>
            <button
              type="button"
              onClick={() => onGuestCountChange(guestCount + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Assignment with Floor Plan Option */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-primary" />
            <span>Mesa Asignada</span>
          </Label>

          {/* Direct Floor Plan Button */}
          <button
            type="button"
            onClick={() => setShowFloorPlanModal(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg border border-primary/20 transition cursor-pointer shadow-2xs"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Ver Mesas en Plano</span>
          </button>
        </div>

        {/* Selected Table Preview Card OR Dropdown Selector */}
        {selectedTable ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/30 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-foreground truncate">
                  {selectedTable.label}
                  {selectedFloorPlan && (
                    <span className="text-muted-foreground font-normal ml-1.5">
                      • {selectedFloorPlan.name}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Capacidad: {selectedTable.capacity} personas{' '}
                  {selectedTable.capacity >= guestCount ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      (Apta para {guestCount}p)
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold">
                      (Aforo menor al grupo)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowFloorPlanModal(true)}
                className="h-7 px-2.5 rounded-lg text-[11px] font-semibold border-primary/30 text-primary hover:bg-primary/10"
              >
                Cambiar en Plano
              </Button>
              <button
                type="button"
                onClick={() => onTableIdChange('')}
                title="Quitar mesa asignada"
                className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={tableId || 'none'}
                  onValueChange={(val) => onTableIdChange(val === 'none' ? '' : val)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-card border-border/80">
                    <SelectValue placeholder="-- Asignar automáticamente en recepción --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Asignar automáticamente en recepción --</SelectItem>
                    {tables.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label} (Cap: {t.capacity}p - {t.status === 'free' ? 'Libre' : t.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFloorPlanModal(true)}
                className="h-9 px-3 rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Elegir en Plano</span>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Puedes dejarla sin asignar o seleccionar una mesa específica desde el plano visual del restaurante.
            </p>
          </div>
        )}
      </div>

      {/* Visual Floor Plan Picker Modal */}
      <TableFloorPlanPickerModal
        isOpen={showFloorPlanModal}
        onClose={() => setShowFloorPlanModal(false)}
        tables={tables}
        floorPlans={floorPlans}
        selectedTableId={tableId}
        onSelectTable={onTableIdChange}
        guestCount={guestCount}
      />
    </div>
  );
};

export default ReservationDateTimeFields;
