import React, { useState } from 'react';
import {
  Receipt,
  Percent,
  FileText,
  Info,
  Scale,
  Calendar,
  Hash,
  ShieldCheck,
  Building2,
  UtensilsCrossed,
  Calculator,
  FileCheck2,
  Check
} from 'lucide-react';
import { TaxType } from '../types/settings.types';
import { CURRENCY_OPTIONS } from '../constants/settings.constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface TaxBillingTabProps {
  taxId: string;
  companyName?: string;
  legalName?: string;
  logoUrl?: string;
  primaryColor?: string;
  venueAddress?: string;
  phone?: string;
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

const REGIME_INFO: Record<string, { label: string; badge: string; desc: string }> = {
  SIMPLIFICADO: {
    label: 'Régimen Simplificado (No Responsable de IVA)',
    badge: 'Persona Natural / No Responsable',
    desc: 'No cobra IVA comercial; aplica Impuesto Nacional al Consumo (INC 8%) en expendio de comidas y bebidas a la mesa.',
  },
  COMUN: {
    label: 'Régimen Común (Responsable de IVA)',
    badge: 'Sociedad / Persona Jurídica',
    desc: 'Obligado a facturar IVA 19% o INC según opere bajo modelo de franquicia o explotación de intangibles.',
  },
  NO_RESPONSABLE_IVA: {
    label: 'No Responsable de IVA',
    badge: 'Umbral Mínimo DIAN',
    desc: 'Establecimientos con ingresos brutos operativos por debajo de los topes legales fijados por el Estatuto Tributario.',
  },
  ESPECIAL: {
    label: 'Régimen Simple de Tributación (RST)',
    badge: 'RST Formalizado',
    desc: 'Modelo consolidado de tributación unificada con tarifas preferenciales sustitutivas de renta e ICA.',
  },
};

const TEST_SCENARIOS = {
  lunch: {
    id: 'lunch',
    name: 'Almuerzo a la Mesa ($50.000 COP)',
    base: 50000,
    items: [
      { name: '1x Menú Degustación Chef', price: 38000 },
      { name: '1x Bebida Artesanal Gourmet', price: 12000 },
    ],
  },
  cafe: {
    id: 'cafe',
    name: 'Cafetería & Pastelería ($18.000 COP)',
    base: 18000,
    items: [
      { name: '2x Cappuccino Especial', price: 11000 },
      { name: '1x Croissant Almendras', price: 7000 },
    ],
  },
  group: {
    id: 'group',
    name: 'Cena & Banquete Grupal ($150.000 COP)',
    base: 150000,
    items: [
      { name: '3x Asado Tira Premium', price: 96000 },
      { name: '1x Botella Vino Selección', price: 34000 },
      { name: '2x Postre Volcán Chocolate', price: 20000 },
    ],
  },
};

export const TaxBillingTab: React.FC<TaxBillingTabProps> = ({
  taxId,
  companyName = 'poscocina Gourmet',
  legalName = 'poscocina S.A.S.',
  logoUrl = '',
  primaryColor = '#ea580c',
  venueAddress = 'Calle 93 # 12-45, Sede Principal',
  phone = '+57 300 123 4567',
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
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'receipt' | 'accounting'>('receipt');
  const [selectedScenario, setSelectedScenario] = useState<'lunch' | 'cafe' | 'group'>('lunch');

  // Cálculos dinámicos para el simulador basados en el escenario activo
  const currentScenario = TEST_SCENARIOS[selectedScenario];
  const sampleBase = currentScenario.base;
  const numTaxRate = parseFloat(taxRate) || 0;
  const sampleTax = Math.round(sampleBase * (numTaxRate / 100));
  const numTipPct = parseFloat(defaultTipPct) || 0;
  const sampleTip = Math.round(sampleBase * (numTipPct / 100));
  const sampleTotal = sampleBase + sampleTax + sampleTip;

  const currentRegime = REGIME_INFO[regime] || REGIME_INFO.SIMPLIFICADO;

  const TAX_PRESETS: Array<{
    id: TaxType;
    label: string;
    badge: string;
    desc: string;
    formula: string;
    rate: string;
  }> = [
    {
      id: 'INC_8',
      label: 'INC 8% (Impuesto Nacional al Consumo)',
      badge: 'Restaurantes & Bares',
      desc: 'Tarifa general en Colombia para servicio a la mesa, restaurantes, cafeterías y bares.',
      formula: 'Base × 8%',
      rate: '8',
    },
    {
      id: 'IVA_19',
      label: 'IVA 19% (Régimen General / Franquicias)',
      badge: 'Franquicias / Común',
      desc: 'Obligatorio cuando el establecimiento opera bajo franquicia o régimen general de IVA.',
      formula: 'Base × 19%',
      rate: '19',
    },
    {
      id: 'EXENTO',
      label: 'Exento (0% de Impuestos)',
      badge: 'Zonas Especiales',
      desc: 'Sin cobro de gravamen en zonas francas, zonas de frontera o exenciones tributarias especiales.',
      formula: 'Sin impuesto',
      rate: '0',
    },
  ];

  return (
    <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* ======================================================== */}
      {/* COLUMNA IZQUIERDA: CONFIGURADOR FISCAL Y POLÍTICAS (2 cols) */}
      {/* ======================================================== */}
      <div className="w-full min-w-0 lg:col-span-2 space-y-6">
        {/* Banner Corporativo y Auditoría */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">
                  Parámetros Fiscales & Normativa Tributaria
                </span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/10 font-bold">
                  DIAN POS
                </Badge>
              </div>
              <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11.5px]">
                Configuración centralizada para la liquidación contable, emisión de comprobantes y auditoría fiscal de la empresa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-[11px]">
            <Badge variant="secondary" className="font-semibold">
              Régimen: {regime}
            </Badge>
            <Badge variant="outline" className="font-bold text-primary border-primary/30">
              Tasa: {taxRate}%
            </Badge>
          </div>
        </div>

        {/* 1. Entidad Jurídica & Régimen Legal ante la DIAN (EN FILAS) */}
        <Card className="p-6 shadow-xs border-border/80 space-y-6 bg-card">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-tight">
                  Identificación Jurídica y Régimen Fiscal
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Razón social oficial, NIT/RUT y categoría tributaria registrada ante la DIAN.
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-[10.5px] font-semibold text-primary border-primary/30 bg-primary/5 hidden sm:inline-flex">
              Datos Obligatorios DIAN
            </Badge>
          </div>

          {/* Formulario Estructurado en FILAS AMPLIAS */}
          <div className="space-y-5">
            {/* FILA 1: Razón Social Legal */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-muted-foreground" />
                Razón Social Legal (Empresa)
              </Label>
              <Input
                type="text"
                value={legalName}
                onChange={(e) => onFieldChange('legalName', e.target.value)}
                placeholder="Ej. poscocina S.A.S."
                className="h-11 text-sm bg-background font-medium"
              />
              <span className="text-[11px] text-muted-foreground block">
                Nombre oficial de la persona jurídica o natural registrado en Cámara de Comercio y el RUT.
              </span>
            </div>

            {/* FILA 2: NIT / RUT con Dígito de Verificación */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Identificación Fiscal (NIT / RUT con Dígito de Verificación)
              </Label>
              <Input
                type="text"
                value={taxId}
                onChange={(e) => onFieldChange('taxId', e.target.value)}
                placeholder="Ej. 900.123.456-7"
                className="h-11 text-sm font-mono font-bold bg-background"
              />
              <span className="text-[11px] text-muted-foreground block">
                Número de Identificación Tributaria oficial impreso en el encabezado de todas las facturas y comprobantes.
              </span>
            </div>

            {/* FILA 3: Régimen Tributario ante la DIAN */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Régimen Tributario
              </Label>
              <Select
                value={regime}
                onValueChange={(val) => onFieldChange('regime', val)}
              >
                <SelectTrigger className="h-11 text-sm bg-background font-medium rounded-xl">
                  <SelectValue placeholder="Seleccionar Régimen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLIFICADO">Régimen Simplificado (No Responsable de IVA)</SelectItem>
                  <SelectItem value="COMUN">Régimen Común (Responsable de IVA)</SelectItem>
                  <SelectItem value="NO_RESPONSABLE_IVA">No Responsable de IVA (Bajo Tope Legal)</SelectItem>
                  <SelectItem value="ESPECIAL">Régimen Simple de Tributación (RST)</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 text-xs flex items-center gap-2.5">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[11.5px] text-muted-foreground leading-snug">
                  {currentRegime.desc}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Política de Impuestos para Alimentos y Bebidas (EN FILAS) */}
        <Card className="p-6 shadow-xs border-border/80 space-y-6 bg-card">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-tight">
                  Políticas de Impuestos en Venta (Alimentos & Bebidas)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tarifas aplicadas a platos, combos y bebidas en servicio a la mesa, barra y domicilio.
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-[10.5px] font-mono px-2.5 py-0.5 font-bold text-primary border-primary/30 bg-primary/5">
              Tasa Activa: {taxRate}%
            </Badge>
          </div>

          {/* Opciones de Impuesto en FILAS HORIZONTALES (Sin apretar columnas) */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-foreground block">
              Modalidad de Impuesto Aplicable
            </Label>
            
            <div className="space-y-2.5">
              {TAX_PRESETS.map((preset) => {
                const isSelected = taxType === preset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onTaxTypeChange(preset.id);
                      onFieldChange('taxRate', preset.rate);
                    }}
                    className={cn(
                      'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group select-none',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                        : 'border-border/80 bg-background hover:bg-muted/40 hover:border-border'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted-foreground/40 bg-background'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {preset.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/5"
                          >
                            {preset.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                          {preset.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
                      <span className="px-3 py-1 rounded-lg bg-muted/80 border border-border/70 font-bold text-foreground">
                        {preset.formula}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parámetros de Liquidación en FILAS DEDICADAS */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            {/* FILA: Tasa de Impuesto Numérica */}
            <div className="p-4 rounded-2xl border border-border/80 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Label className="text-sm font-bold text-foreground block">
                  Tasa de Impuesto Liquidada (%)
                </Label>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Porcentaje que se calculará automáticamente sobre la base imponible en cada orden.
                </span>
              </div>
              <div className="relative w-full sm:w-44 shrink-0">
                <Input
                  type="number"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => onFieldChange('taxRate', e.target.value)}
                  className="h-10 text-sm pr-8 bg-card font-mono font-bold"
                />
                <Percent className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* FILA: Propina Voluntaria Sugerida */}
            <div className="p-4 rounded-2xl border border-border/80 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-bold text-foreground block">
                    Propina Voluntaria Sugerida
                  </Label>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/80">
                    Ley 1935
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Porcentaje sugerido en la pre-cuenta (siempre de carácter voluntario para el comensal).
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1">
                  {['0', '5', '10', '15', '20'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => onFieldChange('defaultTipPct', pct)}
                      className={cn(
                        'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer',
                        defaultTipPct === pct
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-muted/70 text-muted-foreground border-border hover:bg-muted'
                      )}
                    >
                      {pct}%{pct === '10' ? ' ⭐' : ''}
                    </button>
                  ))}
                </div>
                <div className="relative w-24 shrink-0">
                  <Input
                    type="number"
                    value={defaultTipPct}
                    onChange={(e) => onFieldChange('defaultTipPct', e.target.value)}
                    placeholder="10"
                    className="h-10 text-sm pr-7 bg-card font-mono font-bold text-center"
                  />
                  <Percent className="w-3 h-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* FILA: Moneda Operativa */}
            <div className="p-4 rounded-2xl border border-border/80 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Label className="text-sm font-bold text-foreground block">
                  Moneda Operativa de Facturación
                </Label>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Símbolo y denominación monetaria para comandas, recibos e informes contables.
                </span>
              </div>
              <div className="w-full sm:w-56 shrink-0">
                <Select
                  value={currency}
                  onValueChange={(val) => onFieldChange('currency', val)}
                >
                  <SelectTrigger className="h-10 text-sm bg-card font-medium rounded-xl">
                    <SelectValue placeholder="Seleccionar Moneda..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Resolución y Numeración de Facturación Oficial DIAN (EN FILAS) */}
        <Card className="p-6 shadow-xs border-border/80 space-y-6 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/60 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-tight">
                  Resolución y Consecutivos DIAN (Facturación POS)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Autorización de numeración oficial emitida por el formulario 1876 de la DIAN.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-muted/50 px-3.5 py-2 rounded-xl border border-border/80 self-start sm:self-auto">
              <Switch
                id="isInvoiceResolutionEnabled"
                checked={isInvoiceResolutionEnabled}
                onCheckedChange={(checked) => onFieldChange('isInvoiceResolutionEnabled', checked)}
              />
              <Label htmlFor="isInvoiceResolutionEnabled" className="cursor-pointer text-xs font-bold text-foreground">
                {isInvoiceResolutionEnabled ? 'Resolución Oficial Habilitada' : 'Sin Resolución (Recibos Simples)'}
              </Label>
            </div>
          </div>

          {!isInvoiceResolutionEnabled ? (
            <div className="rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center text-xs text-muted-foreground space-y-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Info className="w-5 h-5" />
              </div>
              <p className="font-bold text-foreground text-sm">
                Emisión de Comprobantes Internos de Venta
              </p>
              <p className="max-w-md mx-auto leading-relaxed text-muted-foreground">
                Activa el switch superior si tu establecimiento cuenta con una resolución de facturación POS o documento equivalente autorizada por la DIAN.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Indicator */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Autorización Fiscal Activa
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] font-bold text-primary border-primary/30">
                  {invoicePrefix ? `${invoicePrefix}-${invoiceInitialNumber || '1'} al ${invoicePrefix}-${invoiceFinalNumber || '50000'}` : 'Configuración Incompleta'}
                </Badge>
              </div>

              {/* FILA 1: Prefijo y Resolución */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                    Prefijo Autorizado <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => onFieldChange('invoicePrefix', e.target.value.toUpperCase())}
                    placeholder="Ej. POS"
                    className="h-10 text-sm font-mono uppercase font-bold bg-background"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Ejemplo: POS, FAC, REC.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Número de Resolución DIAN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={invoiceResolution}
                    onChange={(e) => onFieldChange('invoiceResolution', e.target.value)}
                    placeholder="Ej. 18764000001 de 2026"
                    className="h-10 text-sm font-mono bg-background"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Número consecutivo otorgado en el formulario 1876.
                  </span>
                </div>
              </div>

              {/* FILA 2: Fecha y Rangos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Fecha de Expedición
                  </Label>
                  <Input
                    type="date"
                    value={invoiceResolutionDate}
                    onChange={(e) => onFieldChange('invoiceResolutionDate', e.target.value)}
                    className="h-10 text-sm bg-background font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Fecha de inicio de vigencia.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Rango Desde <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={invoiceInitialNumber}
                    onChange={(e) => onFieldChange('invoiceInitialNumber', e.target.value)}
                    placeholder="1"
                    className="h-10 text-sm font-mono font-bold bg-background"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Primer consecutivo.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Rango Hasta <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={invoiceFinalNumber}
                    onChange={(e) => onFieldChange('invoiceFinalNumber', e.target.value)}
                    placeholder="50000"
                    className="h-10 text-sm font-mono font-bold bg-background"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Último consecutivo autorizado.
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ======================================================== */}
      {/* COLUMNA DERECHA: SIMULADOR FISCAL EN VIVO (1 col)         */}
      {/* ======================================================== */}
      <div className="w-full min-w-0">
        <div className="lg:sticky lg:top-6 self-start space-y-4">
          <Card className="w-full shadow-sm border-border overflow-hidden bg-card/90 backdrop-blur-xs">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Simulador Fiscal en Vivo
                  </CardTitle>
                </div>

                <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 text-muted-foreground border-border/80">
                  Liquidación Real
                </Badge>
              </div>

              {/* Selector de Pestañas del Simulador */}
              <div className="pt-2">
                <Tabs value={activePreviewTab} onValueChange={(v) => setActivePreviewTab(v as any)} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full h-9 p-0.5 bg-muted/60 rounded-xl">
                    <TabsTrigger
                      value="receipt"
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Factura Fiscal 80mm</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="accounting"
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Desglose Contable</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Selector de Comanda de Prueba (En Dropdown sin textos cortados) */}
              <div className="pt-2.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Probar Comanda de Ejemplo:</span>
                  <span className="font-mono text-primary font-bold">
                    ${sampleBase.toLocaleString()} COP
                  </span>
                </div>
                <Select
                  value={selectedScenario}
                  onValueChange={(val: any) => setSelectedScenario(val)}
                >
                  <SelectTrigger className="h-9 text-xs bg-background font-semibold rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">🍽️ Almuerzo a la Mesa ($50.000 COP)</SelectItem>
                    <SelectItem value="cafe">☕ Cafetería & Pastelería ($18.000 COP)</SelectItem>
                    <SelectItem value="group">🍷 Cena & Banquete ($150.000 COP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-4 flex flex-col justify-center">
              {/* PESTAÑA 1: TICKET FISCAL 80MM */}
              {activePreviewTab === 'receipt' && (
                <div className="relative mx-auto w-full max-w-[285px] my-1">
                  {/* Textura y formato de recibo térmico fiscal */}
                  <div className="relative bg-[#fffdfa] text-slate-800 rounded-t-xl shadow-xl border border-slate-200/90 font-mono text-[11px] p-5 select-none transition-all">
                    {/* Encabezado Fiscal */}
                    <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1 rounded" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                      )}
                      <div className="font-extrabold text-sm uppercase text-slate-950">{companyName}</div>
                      <div className="text-[10px] text-slate-600 font-sans">{legalName}</div>
                      <div className="text-[10px] font-bold text-slate-800">NIT: {taxId || '900.123.456-7'}</div>
                      <div className="text-[9px] text-slate-500 font-sans">{currentRegime.label}</div>
                      <div className="text-[9px] text-slate-500">{venueAddress}</div>
                      <div className="text-[9px] text-slate-500">Tel: {phone}</div>
                    </div>

                    {/* Datos de Resolución DIAN si está activa */}
                    {isInvoiceResolutionEnabled && (
                      <div className="py-2 border-b border-dashed border-slate-300 text-[9px] text-slate-600 space-y-0.5 bg-amber-50/60 p-1.5 my-1.5 rounded font-sans">
                        <div className="font-bold text-slate-800">AUTORIZACIÓN FACTURACIÓN DIAN</div>
                        <div>Res. No: {invoiceResolution || '18764000001'}</div>
                        <div>Vigencia: {invoiceResolutionDate || '2026-01-15'}</div>
                        <div>
                          Rango: {invoicePrefix || 'POS'}-{invoiceInitialNumber || '1'} a {invoicePrefix || 'POS'}-{invoiceFinalNumber || '50000'}
                        </div>
                      </div>
                    )}

                    {/* Factura Metadata */}
                    <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5 text-slate-600">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>
                          Factura: #{invoicePrefix ? `${invoicePrefix}-` : ''}00148
                        </span>
                        <span>Mesa: 04</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fecha: 26/09/2026 21:40</span>
                        <span>Turno: 01</span>
                      </div>
                    </div>

                    {/* Ítems dinámicos de la Comanda según escenario */}
                    <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10.5px]">
                      {currentScenario.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <span>{item.name}</span>
                          <span className="font-bold">${item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Liquidación de Impuestos y Totales */}
                    <div className="pt-2 text-[10px] space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Base Gravable:</span>
                        <span>${sampleBase.toLocaleString()}</span>
                      </div>

                      {/* Discriminación según tipo de impuesto */}
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>
                          {taxType === 'INC_8'
                            ? 'Impoconsumo (INC 8%):'
                            : taxType === 'IVA_19'
                            ? 'IVA Discriminado (19%):'
                            : 'Exento de Impuestos (0%):'}
                        </span>
                        <span>${sampleTax.toLocaleString()}</span>
                      </div>

                      {numTipPct > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>Propina Voluntaria ({numTipPct}%):</span>
                          <span>${sampleTip.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs font-black text-slate-950 pt-2 border-t border-slate-400">
                        <span>TOTAL FACTURA:</span>
                        <span className="text-sm">${sampleTotal.toLocaleString()} {currency}</span>
                      </div>
                    </div>

                    {/* Pie Fiscal */}
                    <div className="text-center pt-3 mt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-500 font-sans space-y-1">
                      <p className="italic">"Gracias por su preferencia"</p>
                      <p className="text-[8px] text-slate-400">
                        Software POS registrado • {isInvoiceResolutionEnabled ? 'Factura Autorizada' : 'Recibo Interno'}
                      </p>
                    </div>
                  </div>

                  {/* Borde dentado inferior en zigzag */}
                  <div
                    className="h-3 w-full bg-[#fffdfa] shadow-lg border-x border-slate-200/90"
                    style={{
                      clipPath:
                        'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)',
                    }}
                  />
                </div>
              )}

              {/* PESTAÑA 2: DESGLOSE CONTABLE */}
              {activePreviewTab === 'accounting' && (
                <div className="space-y-4 py-2 text-xs">
                  <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Fórmula de Liquidación
                    </span>
                    <div className="font-mono text-xs bg-background p-2.5 rounded-lg border border-border/60">
                      Total = Base + (Base × {numTaxRate}%) + (Base × {numTipPct}%)
                    </div>
                  </div>

                  <div className="space-y-2 bg-card p-3 rounded-xl border border-border/80">
                    <div className="flex justify-between items-center pb-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Régimen Legal:</span>
                      <span className="font-bold text-foreground">{currentRegime.badge}</span>
                    </div>

                    <div className="flex justify-between items-center pb-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Grava Impoconsumo:</span>
                      <Badge variant={taxType === 'INC_8' ? 'default' : 'secondary'} className="text-[10px]">
                        {taxType === 'INC_8' ? 'Sí (8%)' : 'No'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pb-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Grava IVA:</span>
                      <Badge variant={taxType === 'IVA_19' ? 'default' : 'secondary'} className="text-[10px]">
                        {taxType === 'IVA_19' ? 'Sí (19%)' : 'No'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pb-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Moneda:</span>
                      <span className="font-bold text-foreground">{currency}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Control de Folios:</span>
                      <span className="font-semibold text-foreground">
                        {isInvoiceResolutionEnabled ? 'Habilitado (DIAN)' : 'Sin Consecutivo Fiscal'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-800 dark:text-emerald-300">
                    Cumple con los requisitos del Estatuto Tributario colombiano para expendio de comidas preparadas.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ficha de Liquidación en Filas Claras (Sin columnas apretadas) */}
          <div className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Base Imponible (Subtotal):</span>
              <span className="font-mono font-semibold text-foreground">${sampleBase.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Impuesto Liquidado ({taxRate}%):</span>
              <span className="font-mono font-semibold text-primary">+${sampleTax.toLocaleString()}</span>
            </div>
            {numTipPct > 0 && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Propina Voluntaria ({numTipPct}%):</span>
                <span className="font-mono font-semibold text-foreground">+${sampleTip.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border/60 font-bold text-sm text-foreground">
              <span>Total a Recaudar:</span>
              <span className="font-mono text-primary">${sampleTotal.toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
