import React from 'react';
import { TableItem } from '../types/reservations.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';

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
}

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
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="block text-xs font-medium text-muted-foreground">Fecha</Label>
          <Input
            type="date"
            required
            value={formDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="block text-xs font-medium text-muted-foreground">Hora</Label>
          <Input
            type="time"
            required
            value={formTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="block text-xs font-medium text-muted-foreground">Comensales</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={guestCount}
            onChange={(e) => onGuestCountChange(Number(e.target.value))}
            className="h-9 text-xs font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="block text-xs font-medium text-muted-foreground">Mesa Sugerida</Label>
          <Select
            value={tableId}
            onChange={(e) => onTableIdChange(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="">-- Cualquiera --</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.capacity}p - {t.status})
              </option>
            ))}
          </Select>
        </div>
      </div>
    </>
  );
};
