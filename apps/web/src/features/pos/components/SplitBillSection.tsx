import React from 'react';
import { Divide, Tag } from 'lucide-react';
import { SplitMode, DiscountType } from '../types/pos.types';

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
          <button
            key={mode}
            type="button"
            onClick={() => onModeChange(mode)}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              checkoutMode === mode
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {mode === 'single' ? 'Cuenta Total' : 'Partes Iguales'}
          </button>
        ))}
      </div>
    </div>

    {checkoutMode === 'equal' && (
      <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl">
        <span className="text-slate-400">Dividir entre cuántas personas:</span>
        <div className="flex items-center space-x-2">
          {[2, 3, 4, 5].map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => onSplitCountChange(cnt)}
              className={`w-7 h-7 rounded-lg font-mono font-bold cursor-pointer transition ${
                equalSplitCount === cnt
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>
    )}

    <div className="pt-2 border-t border-slate-800/80">
      <label className="flex items-center space-x-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={applyDiscount}
          onChange={(e) => onApplyDiscountChange(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
        />
        <span className="text-slate-300 font-semibold flex items-center space-x-1">
          <Tag className="w-3 h-3 text-orange-400" />
          <span>Aplicar Descuento Especial</span>
        </span>
      </label>

      {applyDiscount && (
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-800/60 rounded-xl">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Tipo:</label>
            <select
              value={discountType}
              onChange={(e: any) => onDiscountTypeChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Valor:</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Motivo:</label>
            <input
              type="text"
              value={discountReason}
              onChange={(e) => onDiscountReasonChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
