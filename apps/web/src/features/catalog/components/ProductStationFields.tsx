import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  printerStation: string;
  prepTimeMin: number;
  onPrinterStationChange: (val: string) => void;
  onPrepTimeMinChange: (val: number) => void;
}

export const ProductStationFields: React.FC<Props> = ({
  printerStation,
  prepTimeMin,
  onPrinterStationChange,
  onPrepTimeMinChange,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">Estación de Impresión</label>
      <select
        value={printerStation}
        onChange={(e) => onPrinterStationChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
      >
        <option value="kitchen">Cocina Principal (KDS)</option>
        <option value="bar">Barra de Bebidas (Bar)</option>
      </select>
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">Tiempo preparación (min)</label>
      <div className="relative">
        <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="number"
          min="0"
          value={prepTimeMin}
          onChange={(e) => onPrepTimeMinChange(parseInt(e.target.value) || 0)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);
