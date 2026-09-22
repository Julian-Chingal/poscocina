import React from 'react';
import { Receipt, CheckCircle2, Percent } from 'lucide-react';
import { TaxType } from '../types/settings.types';
import { CURRENCY_OPTIONS } from '../constants/settings.constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/common/native-select';

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
    <Card className="p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-border">
        <Receipt className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        <div>
          <h3 className="font-bold text-foreground text-base">Régimen Fiscal y Políticas de Cobro</h3>
          <p className="text-xs text-muted-foreground">Normas DIAN para restaurantes y bares (INC 8% vs IVA 19%).</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-foreground">
            Identificación Fiscal (NIT / RUT / RFC)
          </Label>
          <Input
            type="text"
            value={taxId}
            onChange={(e) => onFieldChange('taxId', e.target.value)}
            placeholder="900.123.456-7"
            className="h-10 text-sm font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="block text-xs font-semibold text-foreground">
            Régimen Tributario para Alimentos y Bebidas
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'INC_8' as const, label: 'INC 8% (Restaurantes)', desc: 'Impuesto al Consumo estándar Colombia.' },
              { id: 'IVA_19' as const, label: 'IVA 19% (General)', desc: 'Para franquicias o régimen común IVA.' },
              { id: 'EXENTO' as const, label: 'Exento (0%)', desc: 'Sin cobro de impuesto en comandas.' },
            ].map(({ id, label, desc }) => (
              <Button
                key={id}
                variant="ghost"
                type="button"
                onClick={() => onTaxTypeChange(id)}
                className={`p-3.5 h-auto rounded-xl border text-left transition cursor-pointer flex flex-col items-start justify-start whitespace-normal ${
                  taxType === id
                    ? 'border-primary bg-primary/10 text-foreground hover:bg-primary/20'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between w-full">
                  <span>{label}</span>
                  {taxType === id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 font-normal">{desc}</div>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">Tasa de Impuesto (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                value={taxRate}
                onChange={(e) => onFieldChange('taxRate', e.target.value)}
                className="h-10 text-sm pr-8"
              />
              <Percent className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">
              Propina Voluntaria Sugerida (%)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={defaultTipPct}
                onChange={(e) => onFieldChange('defaultTipPct', e.target.value)}
                placeholder="10"
                className="h-10 text-sm pr-8"
              />
              <Percent className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span className="text-[10px] text-muted-foreground block">Por defecto 10% voluntario</span>
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">Moneda Operativa</Label>
            <Select
              value={currency}
              onChange={(e) => onFieldChange('currency', e.target.value)}
              className="h-10 text-sm"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </Card>
  </div>
);
