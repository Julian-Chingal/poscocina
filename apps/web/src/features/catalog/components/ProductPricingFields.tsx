import React from 'react';
import { DollarSign } from 'lucide-react';
import { TAX_RATE_OPTIONS } from '../constants/catalog.constants';
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
        value={String(taxRate)}
        onValueChange={(val) => onTaxRateChange(parseFloat(val))}
      >
        <SelectTrigger className="h-10 rounded-xl bg-background">
          <SelectValue placeholder="Seleccionar impuesto" />
        </SelectTrigger>
        <SelectContent>
          {TAX_RATE_OPTIONS.map((t) => (
            <SelectItem key={t.value} value={String(t.value)}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default ProductPricingFields;
