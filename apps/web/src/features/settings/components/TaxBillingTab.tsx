import React from 'react';
import { Receipt, CheckCircle2, Percent } from 'lucide-react';
import { TaxType } from '../types/settings.types';
import { CURRENCY_OPTIONS } from '../constants/settings.constants';

interface Props {
  taxId: string;
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  currency: string;
  onFieldChange: (field: any, val: any) => void;
  onTaxTypeChange: (type: TaxType) => void;
}

export const TaxBillingTab: React.FC<Props> = ({
  taxId,
  taxType,
  taxRate,
  defaultTipPct,
  currency,
  onFieldChange,
  onTaxTypeChange,
}) => (
  <div className="max-w-3xl space-y-6">
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-700/60">
        <Receipt className="w-5 h-5 text-emerald-400" />
        <div>
          <h3 className="font-bold text-white text-base">Régimen Fiscal y Políticas de Cobro</h3>
          <p className="text-xs text-slate-400">Normas DIAN para restaurantes y bares (INC 8% vs IVA 19%).</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Identificación Fiscal (NIT / RUT / RFC)
          </label>
          <input
            type="text"
            value={taxId}
            onChange={(e) => onFieldChange('taxId', e.target.value)}
            placeholder="900.123.456-7"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Régimen Tributario para Alimentos y Bebidas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'INC_8' as const, label: 'INC 8% (Restaurantes)', desc: 'Impuesto al Consumo estándar Colombia.' },
              { id: 'IVA_19' as const, label: 'IVA 19% (General)', desc: 'Para franquicias o régimen común IVA.' },
              { id: 'EXENTO' as const, label: 'Exento (0%)', desc: 'Sin cobro de impuesto en comandas.' },
            ].map(({ id, label, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => onTaxTypeChange(id)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  taxType === id
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{label}</span>
                  {taxType === id && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tasa de Impuesto (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={taxRate}
                onChange={(e) => onFieldChange('taxRate', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Propina Voluntaria Sugerida (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={defaultTipPct}
                onChange={(e) => onFieldChange('defaultTipPct', e.target.value)}
                placeholder="10"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Por defecto 10% voluntario</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Moneda Operativa</label>
            <select
              value={currency}
              onChange={(e) => onFieldChange('currency', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
);
