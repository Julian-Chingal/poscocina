import React from 'react';
import { TableItem } from '../types/reservations.types';

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
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Fecha</label>
          <input
            type="date"
            required
            value={formDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Hora</label>
          <input
            type="time"
            required
            value={formTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Comensales</label>
          <input
            type="number"
            min={1}
            max={50}
            value={guestCount}
            onChange={(e) => onGuestCountChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Mesa Sugerida</label>
          <select
            value={tableId}
            onChange={(e) => onTableIdChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
          >
            <option value="">-- Cualquiera --</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.capacity}p - {t.status})
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
