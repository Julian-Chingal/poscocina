import React from 'react';
import { DollarSign } from 'lucide-react';
import { TAX_RATE_OPTIONS } from '../constants/catalog.constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';

interface Props {
  price: string;
  taxRate: number;
  onPriceChange: (val: string) => void;
  onTaxRateChange: (val: number) => void;
}

export const ProductPricingFields: React.FC<Props> = ({
  price,
  taxRate,
  onPriceChange,
  onTaxRateChange,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <Label className="mb-1.5 block">Precio (COP) *</Label>
      <div className="relative">
        <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
        <Input
          type="number"
          min="0"
          step="100"
          required
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="35000"
          className="pl-9 font-mono h-10 rounded-xl"
        />
      </div>
    </div>
    <div>
      <Label className="mb-1.5 block">Impuesto</Label>
      <Select
        value={taxRate}
        onChange={(e) => onTaxRateChange(parseFloat(e.target.value))}
        className="h-10 rounded-xl"
      >
        {TAX_RATE_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>
    </div>
  </div>
);

export default ProductPricingFields;
