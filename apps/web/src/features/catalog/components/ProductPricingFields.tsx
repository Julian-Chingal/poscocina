import React from 'react';
import { DollarSign } from 'lucide-react';
import { TAX_RATE_OPTIONS } from '../constants/catalog.constants';

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
      <label className="block text-xs font-semibold text-slate-300 mb-1">Precio (COP) *</label>
      <div className="relative">
        <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="number"
          min="0"
          step="100"
          required
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="35000"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">Impuesto</label>
      <select
        value={taxRate}
        onChange={(e) => onTaxRateChange(parseFloat(e.target.value))}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
      >
        {TAX_RATE_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  </div>
);
