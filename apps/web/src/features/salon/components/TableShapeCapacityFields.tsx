import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';

interface Props {
  capacity: number;
  shape: 'rect' | 'circle' | 'square';
  onCapacityChange: (cap: number) => void;
  onShapeChange: (shape: 'rect' | 'circle' | 'square') => void;
}

export const TableShapeCapacityFields: React.FC<Props> = ({
  capacity,
  shape,
  onCapacityChange,
  onShapeChange,
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label className="mb-1.5 block">Capacidad</Label>
      <Input
        type="number"
        min="1"
        max="50"
        required
        value={capacity}
        onChange={(e) => onCapacityChange(parseInt(e.target.value) || 1)}
        className="font-mono h-10 rounded-xl"
      />
    </div>
    <div>
      <Label className="mb-1.5 block">Forma Geométrica</Label>
      <Select
        value={shape}
        onChange={(e) => onShapeChange(e.target.value as 'rect' | 'circle' | 'square')}
        className="h-10 rounded-xl"
      >
        <option value="rect">Rectangular</option>
        <option value="square">Cuadrada</option>
        <option value="circle">Redonda</option>
      </Select>
    </div>
  </div>
);

export default TableShapeCapacityFields;
