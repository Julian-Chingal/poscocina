import React from 'react';

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
      <label className="block text-xs font-semibold text-slate-300 mb-1">Capacidad</label>
      <input
        type="number"
        min="1"
        max="50"
        required
        value={capacity}
        onChange={(e) => onCapacityChange(parseInt(e.target.value) || 1)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">Forma Geométrica</label>
      <select
        value={shape}
        onChange={(e) => onShapeChange(e.target.value as 'rect' | 'circle' | 'square')}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
      >
        <option value="rect">Rectangular</option>
        <option value="square">Cuadrada</option>
        <option value="circle">Redonda</option>
      </select>
    </div>
  </div>
);
