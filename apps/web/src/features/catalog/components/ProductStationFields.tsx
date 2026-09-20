import React from 'react';
import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';

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
      <Label className="mb-1.5 block">Estación de Impresión</Label>
      <Select
        value={printerStation}
        onChange={(e) => onPrinterStationChange(e.target.value)}
        className="h-10 rounded-xl"
      >
        <option value="kitchen">Cocina Principal (KDS)</option>
        <option value="bar">Barra de Bebidas (Bar)</option>
      </Select>
    </div>
    <div>
      <Label className="mb-1.5 block">Tiempo preparación (min)</Label>
      <div className="relative">
        <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
        <Input
          type="number"
          min="0"
          value={prepTimeMin}
          onChange={(e) => onPrepTimeMinChange(parseInt(e.target.value) || 0)}
          className="pl-9 h-10 rounded-xl"
        />
      </div>
    </div>
  </div>
);

export default ProductStationFields;
