import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  <div className="pt-2 flex flex-wrap items-center gap-6">
    <div className="flex items-center space-x-2">
      <Switch
        checked={trackInventory}
        onCheckedChange={onTrackInventoryChange}
      />
      <Label className="font-normal cursor-pointer" onClick={() => onTrackInventoryChange(!trackInventory)}>
        Descontar insumos (Receta)
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <Switch
        checked={isAvailable}
        onCheckedChange={onIsAvailableChange}
      />
      <Label className="font-normal cursor-pointer" onClick={() => onIsAvailableChange(!isAvailable)}>
        Disponible en carta
      </Label>
    </div>
  </div>
);

export default ProductFlagsFields;
