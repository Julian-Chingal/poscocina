import React from 'react';
import { Receipt, CheckCircle2, Percent, FileText, Info } from 'lucide-react';
import { TaxType } from '../types/settings.types';
import { CURRENCY_OPTIONS } from '../constants/settings.constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/common/native-select';

interface Props {
  taxId: string;
  regime?: string;
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  currency: string;
  isInvoiceResolutionEnabled?: boolean;
  invoicePrefix?: string;
  invoiceResolution?: string;
  invoiceInitialNumber?: string;
  invoiceFinalNumber?: string;
  invoiceResolutionDate?: string;
  onFieldChange: (field: any, val: any) => void;
  onTaxTypeChange: (type: TaxType) => void;
}

export const TaxBillingTab: React.FC<Props> = ({
  taxId,
  regime = 'SIMPLIFICADO',
  taxType,
  taxRate,
  defaultTipPct,
  currency,
  isInvoiceResolutionEnabled = false,
  invoicePrefix = '',
  invoiceResolution = '',
  invoiceInitialNumber = '',
  invoiceFinalNumber = '',
  invoiceResolutionDate = '',
  onFieldChange,
  onTaxTypeChange,
}) => (
  <div className="w-full min-w-0 space-y-6">
    {/* Global Corporate Banner */}
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start space-x-3 text-xs text-foreground">
      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold block text-primary text-sm">Configuración Fiscal Corporativa Global</span>
        <p className="text-muted-foreground mt-0.5">
          Esta información tributaria y numeración fiscal es centralizada. Aplica de manera uniforme a todas las sedes y sucursales de la empresa. Las sedes operativas no configuran impuestos independientes.
        </p>
      </div>
    </div>

    {/* Impuestos & Régimen */}
    <Card className="p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-border">
        <Receipt className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        <div>
          <h3 className="font-bold text-foreground text-base">Régimen Fiscal y Políticas de Cobro</h3>
          <p className="text-xs text-muted-foreground">Normas tributarias para restaurantes y bares (INC 8% vs IVA 19%).</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">
              Identificación Fiscal de la Empresa (NIT / RUT)
            </Label>
            <Input
              type="text"
              value={taxId}
              onChange={(e) => onFieldChange('taxId', e.target.value)}
              placeholder="900.123.456-7"
              className="h-10 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">
              Régimen Tributario
            </Label>
            <Select
              value={regime}
              onChange={(e) => onFieldChange('regime', e.target.value)}
              className="h-10 text-sm"
            >
              <option value="SIMPLIFICADO">Régimen Simplificado (No Responsable IVA)</option>
              <option value="COMUN">Régimen Común (Responsable IVA)</option>
              <option value="NO_RESPONSABLE_IVA">No Responsable de IVA</option>
              <option value="ESPECIAL">Régimen Especial</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="block text-xs font-semibold text-foreground">
            Tarifa de Impuesto para Alimentos y Bebidas
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

    {/* Facturación y Resolución DIAN / Entidad Fiscal */}
    <Card className="p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div className="flex items-center space-x-2.5">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-bold text-foreground text-base">Resolución y Numeración de Facturación</h3>
            <p className="text-xs text-muted-foreground">Datos fiscales oficiales impresos en facturas y recibos de caja.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-muted/40 px-3.5 py-2 rounded-xl border border-border">
          <Switch
            id="isInvoiceResolutionEnabled"
            checked={isInvoiceResolutionEnabled}
            onCheckedChange={(checked) => onFieldChange('isInvoiceResolutionEnabled', checked)}
          />
          <Label htmlFor="isInvoiceResolutionEnabled" className="cursor-pointer text-xs font-semibold">
            {isInvoiceResolutionEnabled ? 'Resolución Fiscal Habilitada' : 'Sin Resolución (Recibos Simples)'}
          </Label>
        </div>
      </div>

      {!isInvoiceResolutionEnabled ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center text-xs text-muted-foreground space-y-1.5">
          <p className="font-medium text-foreground">
            El sistema actualmente emite recibos de venta internos sin numeración fiscal reglamentaria.
          </p>
          <p>
            Activa el switch superior si tu establecimiento cuenta con una resolución de facturación oficial emitida por la entidad tributaria (ej. DIAN).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">
              Prefijo de Factura <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              value={invoicePrefix}
              onChange={(e) => onFieldChange('invoicePrefix', e.target.value)}
              placeholder="Ej. POS o FAC"
              className="h-10 text-sm font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="block text-xs font-semibold text-foreground">
              Número de Resolución Fiscal <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              value={invoiceResolution}
              onChange={(e) => onFieldChange('invoiceResolution', e.target.value)}
              placeholder="Ej. 18764000001 de 2026"
              className="h-10 text-sm font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">Fecha Resolución</Label>
            <Input
              type="date"
              value={invoiceResolutionDate}
              onChange={(e) => onFieldChange('invoiceResolutionDate', e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">
              Rango Inicial (Desde) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={invoiceInitialNumber}
              onChange={(e) => onFieldChange('invoiceInitialNumber', e.target.value)}
              placeholder="1"
              className="h-10 text-sm font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">
              Rango Final (Hasta) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={invoiceFinalNumber}
              onChange={(e) => onFieldChange('invoiceFinalNumber', e.target.value)}
              placeholder="50000"
              className="h-10 text-sm font-mono"
              required
            />
          </div>
        </div>
      )}
    </Card>
  </div>
);
