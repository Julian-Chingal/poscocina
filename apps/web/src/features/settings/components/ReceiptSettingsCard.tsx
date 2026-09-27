import React from 'react';
import { Printer, Receipt, Quote, MessageSquare, CheckCircle2, Save, FileText, QrCode, UserCheck, Percent, Hash } from 'lucide-react';
import { PaperWidth } from '../types/settings.types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  paperWidth: PaperWidth;
  autoPrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
  showLogoOnReceipt?: boolean;
  showQrOnReceipt?: boolean;
  showWaiterOnReceipt?: boolean;
  showTaxBreakdown?: boolean;
  showResolutionOnReceipt?: boolean;
  onFieldChange: (field: any, val: any) => void;
  onSaveFormat?: () => void;
  saving?: boolean;
}

const FOOTER_SUGGESTIONS = [
  '¡Gracias por su visita!',
  'Propina voluntaria agradecida',
  'Síguenos en Instagram @poscocina',
  'Software POS registrado • Factura Autorizada',
];

export const ReceiptSettingsCard: React.FC<Props> = ({
  paperWidth,
  autoPrintReceipt,
  receiptHeader,
  receiptFooter,
  showLogoOnReceipt = true,
  showQrOnReceipt = true,
  showWaiterOnReceipt = true,
  showTaxBreakdown = true,
  showResolutionOnReceipt = true,
  onFieldChange,
  onSaveFormat,
  saving = false,
}) => (
  <Card className="shadow-sm border-border bg-card">
    <CardHeader className="pb-4 border-b border-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Configuración de Ticket Térmico
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Parámetros de formato, corte y datos impresos persistentes para esta terminal.
            </CardDescription>
          </div>
        </div>

        {onSaveFormat && (
          <Button
            type="button"
            onClick={onSaveFormat}
            disabled={saving}
            className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-1.5 h-auto rounded-xl shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Guardando...' : 'Guardar Formato'}</span>
          </Button>
        )}
      </div>
    </CardHeader>

    <CardContent className="pt-6 space-y-6">
      {/* 1. Ancho de Papel Térmico (Tarjetas visuales interactivas) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Ancho de Papel Térmico (Rollo)
          </Label>
          <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
            Activo: {paperWidth} mm
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              width: 80 as PaperWidth,
              title: '80 mm (Estándar POS)',
              badge: 'Recomendado',
              desc: '42 a 48 columnas por línea. Formato ideal para servicio a la mesa, facturación detallada y comandas de cocina.',
              icon: Receipt,
            },
            {
              width: 58 as PaperWidth,
              title: '58 mm (Compacto)',
              badge: 'Móvil / Barra',
              desc: '32 columnas por línea. Diseñado para terminales portátiles, datáfonos móviles o barras con espacio reducido.',
              icon: Printer,
            },
          ].map(({ width, title, badge, desc, icon: IconComp }) => {
            const isSelected = paperWidth === width;
            return (
              <div
                key={width}
                onClick={() => onFieldChange('paperWidth', width)}
                className={cn(
                  'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group select-none',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/80 bg-background hover:bg-muted/40 hover:border-border'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                        isSelected ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-foreground block leading-tight">
                        {title}
                      </span>
                      <span className="text-[10px] font-semibold text-primary block mt-0.5">
                        {badge}
                      </span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                </div>

                <p className="text-xs text-muted-foreground leading-normal">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Impresión Automática al Cobrar */}
      <div className="p-4 rounded-2xl border border-border/80 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Label htmlFor="autoPrintReceipt" className="text-sm font-bold text-foreground block cursor-pointer">
            Impresión Automática al Registrar Pago
          </Label>
          <span className="text-xs text-muted-foreground block mt-0.5">
            Lanza la orden de impresión inmediatamente tras registrar el cobro en comandero o punto de pago.
          </span>
        </div>
        <div className="shrink-0">
          <Switch
            id="autoPrintReceipt"
            checked={autoPrintReceipt}
            onCheckedChange={(checked) => onFieldChange('autoPrintReceipt', checked)}
          />
        </div>
      </div>

      {/* 3. Estructura y Elementos Visibles en Factura */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">
          Estructura y Elementos del Comprobante
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Logo del Restaurante
              </span>
              <span className="text-[10.5px] text-muted-foreground block">
                Imprime el logotipo en cabecera
              </span>
            </div>
            <Switch
              checked={showLogoOnReceipt}
              onCheckedChange={(val) => onFieldChange('showLogoOnReceipt', val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-blue-500" />
                Código QR Fiscal / Menú
              </span>
              <span className="text-[10.5px] text-muted-foreground block">
                QR térmico en el pie de factura
              </span>
            </div>
            <Switch
              checked={showQrOnReceipt}
              onCheckedChange={(val) => onFieldChange('showQrOnReceipt', val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                Mesa, Mesero y Turno
              </span>
              <span className="text-[10.5px] text-muted-foreground block">
                Detalla quién atendió la comanda
              </span>
            </div>
            <Switch
              checked={showWaiterOnReceipt}
              onCheckedChange={(val) => onFieldChange('showWaiterOnReceipt', val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-purple-500" />
                Desglose Tributario & Propina
              </span>
              <span className="text-[10.5px] text-muted-foreground block">
                Base gravable, IVA/INC y propina
              </span>
            </div>
            <Switch
              checked={showTaxBreakdown}
              onCheckedChange={(val) => onFieldChange('showTaxBreakdown', val)}
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                Resolución DIAN / Autorización Fiscal
              </span>
              <span className="text-[10.5px] text-muted-foreground block">
                Muestra número de resolución, rango habilitado y fecha de vigencia si está activa.
              </span>
            </div>
            <Switch
              checked={showResolutionOnReceipt}
              onCheckedChange={(val) => onFieldChange('showResolutionOnReceipt', val)}
            />
          </div>
        </div>
      </div>

      {/* 4. Encabezado de Ticket */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Quote className="w-3.5 h-3.5 text-muted-foreground" />
          Lema o Encabezado Impreso en Ticket
        </Label>
        <Input
          type="text"
          value={receiptHeader}
          onChange={(e) => onFieldChange('receiptHeader', e.target.value)}
          placeholder="Ej. Sabor tradicional & Alta cocina"
          className="h-11 text-sm bg-background font-medium italic"
        />
        <span className="text-[11px] text-muted-foreground block">
          Frase distintiva impresa en la parte superior del recibo debajo de los datos fiscales.
        </span>
      </div>

      {/* 5. Pie de Página */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          Mensaje de Despedida (Pie de Ticket)
        </Label>
        <Textarea
          rows={3}
          value={receiptFooter}
          onChange={(e) => onFieldChange('receiptFooter', e.target.value)}
          placeholder="¡Gracias por su visita! Síguenos en @poscocina"
          className="text-sm bg-background leading-relaxed font-sans"
        />

        {/* Sugerencias Rápidas */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10.5px] font-semibold text-muted-foreground mr-1">Sugerencias:</span>
          {FOOTER_SUGGESTIONS.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => onFieldChange('receiptFooter', text)}
              className="text-[10.5px] px-2 py-0.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Botón Guardar Formato en Móvil/Tablet */}
      {onSaveFormat && (
        <div className="pt-2">
          <Button
            type="button"
            onClick={onSaveFormat}
            disabled={saving}
            className="w-full py-2.5 h-auto text-xs font-bold rounded-xl flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando formato...' : 'Guardar Formato de Recibo (Persistir en esta Tablet)'}</span>
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);
