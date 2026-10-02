import React from 'react';
import {
  Printer,
  Receipt,
  Quote,
  MessageSquare,
  CheckCircle2,
  Save,
  FileText,
  QrCode,
  UserCheck,
  Percent,
  Hash,
  Smartphone,
  Scissors,
  Volume2,
  Coins,
  Type,
} from 'lucide-react';
import { PaperWidth, EscPosFontFamily, EscPosFontSize } from '../types/settings.types';
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
  fontFamily?: EscPosFontFamily;
  fontSize?: EscPosFontSize;
  autoCut?: boolean;
  openDrawer?: boolean;
  beepOnPrint?: boolean;
  autoPrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
  showLogoOnReceipt?: boolean;
  showQrOnReceipt?: boolean;
  showWaiterOnReceipt?: boolean;
  showTaxBreakdown?: boolean;
  showResolutionOnReceipt?: boolean;
  isApkOnline?: boolean | null;
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
  fontFamily = 'font_a',
  fontSize = 'normal',
  autoCut = true,
  openDrawer = false,
  beepOnPrint = false,
  autoPrintReceipt,
  receiptHeader,
  receiptFooter,
  showLogoOnReceipt = true,
  showQrOnReceipt = true,
  showWaiterOnReceipt = true,
  showTaxBreakdown = true,
  showResolutionOnReceipt = true,
  isApkOnline = null,
  onFieldChange,
  onSaveFormat,
  saving = false,
}) => (
  <Card className="shadow-sm border-border bg-card">
    <CardHeader className="pb-4 border-b border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base font-bold text-foreground">
                Configuración de Modelos y Tickets Térmicos
              </CardTitle>
              {isApkOnline !== null && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                    isApkOnline
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isApkOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <Smartphone className="w-3 h-3 shrink-0" />
                  {isApkOnline ? 'Sincronizado con APK Bridge' : 'APK Bridge desconectada'}
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Personaliza el ancho de papel (58mm/80mm), tipografía ESC/POS, hardware (corte y cajón) y textos impresos.
            </CardDescription>
          </div>
        </div>

        {onSaveFormat && (
          <Button
            type="button"
            onClick={onSaveFormat}
            disabled={saving}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 h-auto rounded-xl shadow-sm cursor-pointer shrink-0"
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
            1. Ancho de Papel Térmico (Rollo)
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

      {/* 2. Tipografía y Estilo de Fuente ESC/POS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-primary" />
            2. Tipografía ESC/POS (Fuente Térmica)
          </Label>
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
            {fontFamily === 'font_b' ? 'Fuente B (Condensada)' : 'Fuente A (Estándar)'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'font_a' as EscPosFontFamily,
              title: 'Fuente A (12×24 Estándar)',
              badge: paperWidth === 58 ? '32 caracteres/línea' : '42 caracteres/línea',
              desc: 'Texto de tamaño estándar nítido, fácil de leer a distancia. Recomendado para comandas y facturas clásicas.',
            },
            {
              id: 'font_b' as EscPosFontFamily,
              title: 'Fuente B (9×17 Condensada)',
              badge: paperWidth === 58 ? '42 caracteres/línea' : '56 caracteres/línea',
              desc: 'Texto compacto de mayor densidad. Permite nombres de platos más largos y descripciones detalladas sin saltos de línea.',
            },
          ].map(({ id, title, badge, desc }) => {
            const isSelected = fontFamily === id;
            return (
              <div
                key={id}
                onClick={() => onFieldChange('fontFamily', id)}
                className={cn(
                  'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 group select-none',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/80 bg-background hover:bg-muted/40 hover:border-border'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-foreground block leading-tight">
                      {title}
                    </span>
                    <span className="text-[10px] font-semibold text-primary block mt-0.5">
                      {badge}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Escala de Tamaño de Fuente */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Escala de impresión base:
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'normal' as EscPosFontSize, label: 'Normal (1×)' },
              { id: 'double_height' as EscPosFontSize, label: 'Doble Alto (2×)' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onFieldChange('fontSize', s.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer',
                  fontSize === s.id
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Control de Hardware: Corte, Cajón y Pitido */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">
          3. Control de Hardware y Periféricos
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5 min-w-0 pr-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                <Scissors className="w-3.5 h-3.5 text-primary shrink-0" />
                Auto-corte
              </span>
              <span className="text-[10.5px] text-muted-foreground block truncate">
                Corta el papel al finalizar
              </span>
            </div>
            <Switch
              checked={autoCut}
              onCheckedChange={(val) => onFieldChange('autoCut', val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5 min-w-0 pr-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                <Coins className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Cajón Monedero
              </span>
              <span className="text-[10.5px] text-muted-foreground block truncate">
                Abre el cajón al cobrar
              </span>
            </div>
            <Switch
              checked={openDrawer}
              onCheckedChange={(val) => onFieldChange('openDrawer', val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div className="space-y-0.5 min-w-0 pr-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                <Volume2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Pitido / Buzzer
              </span>
              <span className="text-[10.5px] text-muted-foreground block truncate">
                Alerta sonora al imprimir
              </span>
            </div>
            <Switch
              checked={beepOnPrint}
              onCheckedChange={(val) => onFieldChange('beepOnPrint', val)}
            />
          </div>
        </div>
      </div>

      {/* 4. Impresión Automática al Cobrar */}
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

      {/* 5. Estructura y Elementos Visibles en Factura */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">
          4. Estructura y Elementos del Comprobante
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

      {/* 6. Encabezado de Ticket */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Quote className="w-3.5 h-3.5 text-muted-foreground" />
          5. Lema o Encabezado Impreso en Ticket
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

      {/* 7. Pie de Página */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          6. Mensaje de Despedida (Pie de Ticket)
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
            <span>{saving ? 'Guardando formato...' : 'Guardar Formato de Recibo (Persistir y Sincronizar)'}</span>
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default ReceiptSettingsCard;
