import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
        onValueChange={(val) => onShapeChange(val as 'rect' | 'circle' | 'square')}
      >
        <SelectTrigger className="h-10 rounded-xl w-full">
          <SelectValue placeholder="Seleccionar forma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rect">Rectangular</SelectItem>
          <SelectItem value="square">Cuadrada</SelectItem>
          <SelectItem value="circle">Redonda</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default TableShapeCapacityFields;
