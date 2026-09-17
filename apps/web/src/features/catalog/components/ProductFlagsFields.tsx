import React from 'react';

interface Props {
  trackInventory: boolean;
  isAvailable: boolean;
  onTrackInventoryChange: (val: boolean) => void;
  onIsAvailableChange: (val: boolean) => void;
}

export const ProductFlagsFields: React.FC<Props> = ({
  trackInventory,
  isAvailable,
  onTrackInventoryChange,
  onIsAvailableChange,
}) => (
  <div className="pt-2 flex items-center space-x-6">
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={trackInventory}
        onChange={(e) => onTrackInventoryChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-700 text-blue-600"
      />
      <span className="text-xs font-medium text-slate-300">Descontar insumos (Receta)</span>
    </label>
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isAvailable}
        onChange={(e) => onIsAvailableChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-700 text-blue-600"
      />
      <span className="text-xs font-medium text-slate-300">Disponible en carta</span>
    </label>
  </div>
);
