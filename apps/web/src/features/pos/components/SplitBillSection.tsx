import React from 'react';
import { Divide, Tag } from 'lucide-react';
import { SplitMode, DiscountType } from '../types/pos.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/common/native-select';
import { Switch } from '@/components/ui/switch';

interface Props {
  checkoutMode: SplitMode;
  equalSplitCount: number;
  applyDiscount: boolean;
  discountType: DiscountType;
  discountValue: string;
  discountReason: string;
  onModeChange: (mode: SplitMode) => void;
  onSplitCountChange: (count: number) => void;
  onApplyDiscountChange: (apply: boolean) => void;
  onDiscountTypeChange: (t: DiscountType) => void;
  onDiscountValueChange: (v: string) => void;
  onDiscountReasonChange: (r: string) => void;
}

export const SplitBillSection: React.FC<Props> = ({
  checkoutMode,
  equalSplitCount,
  applyDiscount,
  discountType,
  discountValue,
  discountReason,
  onModeChange,
  onSplitCountChange,
  onApplyDiscountChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onDiscountReasonChange,
}) => (
  <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
    <div className="flex items-center justify-between">
      <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
        <Divide className="w-3.5 h-3.5 text-orange-400" />
        <span>División de Cuenta:</span>
      </span>
      <div className="flex space-x-1">
        {(['single', 'equal'] as SplitMode[]).map((mode) => (
          <Button
            key={mode}
            type="button"
            size="sm"
            variant={checkoutMode === mode ? 'default' : 'secondary'}
            onClick={() => onModeChange(mode)}
            className={`h-7 px-2.5 text-xs font-medium cursor-pointer ${
              checkoutMode === mode
                ? 'bg-orange-600 text-white font-bold hover:bg-orange-500'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {mode === 'single' ? 'Cuenta Total' : 'Partes Iguales'}
          </Button>
        ))}
      </div>
    </div>

    {checkoutMode === 'equal' && (
      <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl">
        <span className="text-slate-400">Dividir entre cuántas personas:</span>
        <div className="flex items-center space-x-2">
          {[2, 3, 4, 5].map((cnt) => (
            <Button
              key={cnt}
              type="button"
              size="sm"
              variant={equalSplitCount === cnt ? 'default' : 'secondary'}
              onClick={() => onSplitCountChange(cnt)}
              className={`w-7 h-7 p-0 rounded-lg font-mono font-bold cursor-pointer ${
                equalSplitCount === cnt
                  ? 'bg-orange-600 text-white hover:bg-orange-500'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cnt}
            </Button>
          ))}
        </div>
      </div>
    )}

    <div className="pt-2 border-t border-slate-800/80">
      <div className="flex items-center space-x-2 mb-2">
        <Switch
          id="apply-discount-toggle"
          checked={applyDiscount}
          onCheckedChange={onApplyDiscountChange}
        />
        <Label
          htmlFor="apply-discount-toggle"
          className="text-slate-300 font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <Tag className="w-3 h-3 text-orange-400" />
          <span>Aplicar Descuento Especial</span>
        </Label>
      </div>

      {applyDiscount && (
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-800/60 rounded-xl">
          <div className="space-y-1">
            <Label className="block text-[10px] text-slate-400">Tipo:</Label>
            <Select
              value={discountType}
              onChange={(e: any) => onDiscountTypeChange(e.target.value)}
              className="h-8 text-xs"
            >
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="block text-[10px] text-slate-400">Valor:</Label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="block text-[10px] text-slate-400">Motivo:</Label>
            <Input
              type="text"
              value={discountReason}
              onChange={(e) => onDiscountReasonChange(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
