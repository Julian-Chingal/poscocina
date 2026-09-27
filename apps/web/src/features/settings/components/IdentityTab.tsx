import React, { ChangeEvent, useRef, useState } from 'react';
import {
  Building2,
  Image as ImageIcon,
  UtensilsCrossed,
  X,
  Upload,
  Link2,
  Store,
  MapPin,
  Phone,
  Mail,
  Palette,
  Receipt,
  QrCode,
  FileCheck2,
  Quote,
  Sparkles
} from 'lucide-react';
import { IdentityPreviewCard } from './IdentityPreviewCard';
import { ColorPickerSection, GastronomicThemePreset } from './ColorPickerSection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Props {
  legalName?: string;
  companyName: string;
  slogan?: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor?: string;
  borderRadius?: 'subtle' | 'modern' | 'pill';
  venueAddress: string;
  phone: string;
  email?: string;
  taxId?: string;
  currency?: string;
  paperWidth?: 58 | 80;
  receiptHeader?: string;
  receiptFooter?: string;
  showLogoOnReceipt?: boolean;
  showQrOnReceipt?: boolean;
  qrUrl?: string;
  onFieldChange: (field: any, val: any) => void;
}

export const IdentityTab: React.FC<Props> = ({
  legalName = '',
  companyName,
  slogan = 'Sabor tradicional & Alta cocina',
  logoUrl,
  primaryColor,
  secondaryColor = '#475569',
  borderRadius = 'modern',
  venueAddress,
  phone,
  email = '',
  taxId = '900.123.456-7',
  currency = 'COP',
  paperWidth = 80,
  receiptHeader = 'Sabor tradicional & Alta cocina',
  receiptFooter = '¡Gracias por su visita! Síguenos en @poscocina',
  showLogoOnReceipt = true,
  showQrOnReceipt = true,
  qrUrl = 'https://poscocina.com/menu',
  onFieldChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState<string>('business');

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onFieldChange('logoUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => onFieldChange('logoUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleApplyThemePreset = (preset: GastronomicThemePreset) => {
    onFieldChange('primaryColor', preset.primary);
    onFieldChange('secondaryColor', preset.secondary);
    onFieldChange('borderRadius', preset.radius);
    if (preset.slogan) {
      onFieldChange('slogan', preset.slogan);
      onFieldChange('receiptHeader', preset.slogan);
    }
  };

  return (
    <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Columna Izquierda: Estudio de Personalización Unificado */}
      <div className="w-full min-w-0 lg:col-span-2">
        <Card className="w-full min-w-0 bg-card border-border shadow-xs">
          {/* Navegación Superior del Estudio de Marca */}
          <div className="p-4 pb-0 bg-muted/20 border-b border-border">
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Estudio de Identidad & Marca Blanca
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Máxima personalización visual, fiscal, cromática y de impresión para tu negocio.
                </p>
              </div>
            </div>

            <Tabs value={activeStudioTab} onValueChange={setActiveStudioTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full h-10 p-1 bg-muted/60 rounded-xl mb-3">
                <TabsTrigger
                  value="business"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Negocio & Datos</span>
                  <span className="sm:hidden">Negocio</span>
                </TabsTrigger>

                <TabsTrigger
                  value="style"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paleta & Estilo</span>
                  <span className="sm:hidden">Estilo</span>
                </TabsTrigger>

                <TabsTrigger
                  value="logo"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logotipo & Medios</span>
                  <span className="sm:hidden">Logo</span>
                </TabsTrigger>

                <TabsTrigger
                  value="receipt"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ticket & QR</span>
                  <span className="sm:hidden">Ticket</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="p-6">
            {/* ======================================================== */}
            {/* SUB-PANEL 1: NEGOCIO, MARCA Y CONTACTO                   */}
            {/* ======================================================== */}
            {activeStudioTab === 'business' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                    Identidad Comercial de la Marca
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Nombre público, lema distintivo y datos comerciales visibles para tus comensales y comanderos.
                  </p>
                </div>

                {/* Fila 1: Nombre Comercial & Slogan Gastronómico */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-primary" />
                      Nombre Comercial / Marca (Fantasía)
                    </Label>
                    <Input
                      type="text"
                      value={companyName}
                      onChange={(e) => onFieldChange('companyName', e.target.value)}
                      placeholder="Ej. La Brasa Gourmet"
                      className="h-10 text-sm font-semibold bg-background"
                    />
                    <span className="text-[10.5px] text-muted-foreground block truncate">
                      Visible en pantalla táctil, comandero y ticket de venta.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-primary" />
                      Slogan o Lema del Restaurante
                    </Label>
                    <Input
                      type="text"
                      value={slogan}
                      onChange={(e) => onFieldChange('slogan', e.target.value)}
                      placeholder="Ej. Fuego lento, sabor de origen"
                      className="h-10 text-sm bg-background italic"
                    />
                    <span className="text-[10.5px] text-muted-foreground block truncate">
                      Frase distintiva impresa bajo el nombre comercial.
                    </span>
                  </div>
                </div>

                {/* Nota Fiscal Centralizada: Informa al usuario dónde se configura el NIT y Razón Social sin duplicarlo */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block truncate">
                        Identificación Fiscal & Tributaria (NIT)
                      </span>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        Razón Social: <span className="font-semibold text-foreground">{legalName || 'poscocina S.A.S.'}</span> • NIT: <span className="font-mono font-semibold text-foreground">{taxId || '900.123.456-7'}</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 shrink-0 hidden sm:inline-block">
                    Configurable en Facturación & Impuestos
                  </span>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                    Canales de Contacto y Ubicación Principal
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Información de atención directa impresa en los tickets y visible para los comensales.
                  </p>

                  {/* Fila 3: 3 Columnas con altura uniforme y sin wrapping en labels */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        Dirección Principal
                      </Label>
                      <Input
                        type="text"
                        value={venueAddress}
                        onChange={(e) => onFieldChange('venueAddress', e.target.value)}
                        placeholder="Calle 93 # 12-45"
                        className="h-10 text-sm bg-background"
                      />
                      <span className="text-[10px] text-muted-foreground block truncate">
                        Sede central del negocio.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        Teléfono de Contacto
                      </Label>
                      <Input
                        type="text"
                        value={phone}
                        onChange={(e) => onFieldChange('phone', e.target.value)}
                        placeholder="+57 300 123 4567"
                        className="h-10 text-sm bg-background"
                      />
                      <span className="text-[10px] text-muted-foreground block truncate">
                        Reservas y atención.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        Email de Facturación
                      </Label>
                      <Input
                        type="email"
                        value={email}
                        placeholder="contacto@restaurante.com"
                        onChange={(e) => onFieldChange('email', e.target.value)}
                        className="h-10 text-sm bg-background"
                      />
                      <span className="text-[10px] text-muted-foreground block truncate">
                        Envío de facturas y soporte.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SUB-PANEL 2: PALETA DE COLOR Y ESTILO VISUAL             */}
            {/* ======================================================== */}
            {activeStudioTab === 'style' && (
              <ColorPickerSection
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                borderRadius={borderRadius}
                onColorChange={(color) => onFieldChange('primaryColor', color)}
                onSecondaryColorChange={(color) => onFieldChange('secondaryColor', color)}
                onBorderRadiusChange={(radius) => onFieldChange('borderRadius', radius)}
                onApplyThemePreset={handleApplyThemePreset}
              />
            )}

            {/* ======================================================== */}
            {/* SUB-PANEL 3: LOGOTIPO Y GESTIÓN DE MEDIOS                 */}
            {/* ======================================================== */}
            {activeStudioTab === 'logo' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                    Logotipo Corporativo
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Sube la identidad gráfica de tu marca para tickets térmicos y pantalla táctil.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl border border-border/80 bg-background">
                  {/* Visual Logo Tile */}
                  <div className="relative group shrink-0">
                    {logoUrl ? (
                      <div className="w-24 h-24 rounded-2xl border-2 border-border/80 bg-muted/20 p-2 flex items-center justify-center relative shadow-sm overflow-hidden group-hover:border-primary/40 transition-all">
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => onFieldChange('logoUrl', '')}
                          className="absolute inset-0 bg-black/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold gap-1"
                        >
                          <X className="w-5 h-5 text-red-400" />
                          <span>Quitar Logo</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <UtensilsCrossed className="w-10 h-10" />
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-90">Por defecto</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center gap-4 border-b border-border/60 pb-2">
                      <button
                        type="button"
                        onClick={() => setLogoInputMode('upload')}
                        className={cn(
                          'text-xs font-semibold pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                          logoInputMode === 'upload'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir archivo de imagen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLogoInputMode('url')}
                        className={cn(
                          'text-xs font-semibold pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                          logoInputMode === 'url'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Enlace URL público</span>
                      </button>
                    </div>

                    {logoInputMode === 'upload' ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={cn(
                          'border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex items-center justify-center gap-3',
                          isDragging
                            ? 'border-primary bg-primary/10'
                            : 'border-border/80 hover:border-primary/50 hover:bg-muted/30'
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-xs font-bold text-foreground block">
                            Arrastra tu logotipo aquí o haz clic para buscar
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            Formatos PNG, SVG, WebP o JPG (Recomendado 512×512px con fondo transparente).
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Input
                            type="url"
                            value={logoUrl}
                            onChange={(e) => onFieldChange('logoUrl', e.target.value)}
                            placeholder="https://ejemplo.com/imagenes/mi-logo.png"
                            className="h-10 text-xs bg-background font-mono"
                          />
                          {logoUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => onFieldChange('logoUrl', '')}
                              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <span className="text-[10.5px] text-muted-foreground block">
                          Ingresa una URL segura con protocolo HTTPS.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Printing Rules for Logo */}
                <div className="pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background">
                    <div className="space-y-0.5">
                      <Label htmlFor="showLogoOnReceipt" className="text-xs font-bold text-foreground cursor-pointer block">
                        Imprimir logotipo en tickets de caja
                      </Label>
                      <span className="text-[11px] text-muted-foreground block">
                        Convierte el logotipo a mapa de bits monocromático de alta densidad para impresoras térmicas.
                      </span>
                    </div>
                    <Switch
                      id="showLogoOnReceipt"
                      checked={showLogoOnReceipt}
                      onCheckedChange={(checked) => onFieldChange('showLogoOnReceipt', checked)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SUB-PANEL 4: TICKETS, CÓDIGO QR Y FORMATOS               */}
            {/* ======================================================== */}
            {activeStudioTab === 'receipt' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                    Personalización de Tickets ESC/POS
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Modifica los mensajes de bienvenida, despedida y códigos QR impresos en las comandas.
                  </p>
                </div>

                {/* Ancho de papel */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">Ancho de Impresora Térmica</Label>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    {[
                      { width: 80, label: '80 mm (Estándar)', desc: '48 columnas' },
                      { width: 58, label: '58 mm (Compacto)', desc: '32 columnas' },
                    ].map((w) => (
                      <button
                        key={w.width}
                        type="button"
                        onClick={() => onFieldChange('paperWidth', w.width)}
                        className={cn(
                          'p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                          paperWidth === w.width
                            ? 'border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20'
                            : 'border-border/80 bg-background text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span className="text-xs block font-bold">{w.label}</span>
                        <span className="text-[10px] text-muted-foreground block">{w.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Encabezado y Pie */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Encabezado del Ticket</Label>
                    <Input
                      type="text"
                      value={receiptHeader}
                      onChange={(e) => onFieldChange('receiptHeader', e.target.value)}
                      placeholder="Ej. ¡Bienvenidos a la mejor mesa!"
                      className="h-10 text-sm bg-background"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Aparece justo debajo del logotipo.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Pie de Página del Ticket</Label>
                    <Input
                      type="text"
                      value={receiptFooter}
                      onChange={(e) => onFieldChange('receiptFooter', e.target.value)}
                      placeholder="Ej. ¡Gracias por su visita! Síguenos en @poscocina"
                      className="h-10 text-sm bg-background"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Mensaje de agradecimiento o redes sociales.
                    </span>
                  </div>
                </div>

                {/* Generador de Código QR en Ticket */}
                <div className="pt-4 border-t border-border/60 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background">
                    <div className="space-y-0.5">
                      <Label htmlFor="showQrOnReceipt" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-primary" />
                        Imprimir Código QR al pie del ticket
                      </Label>
                      <span className="text-[11px] text-muted-foreground block">
                        Permite a los comensales escanear con su teléfono para ver menú, calificar o pagar digitalmente.
                      </span>
                    </div>
                    <Switch
                      id="showQrOnReceipt"
                      checked={showQrOnReceipt}
                      onCheckedChange={(checked) => onFieldChange('showQrOnReceipt', checked)}
                    />
                  </div>

                  {showQrOnReceipt && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                      <Label className="text-xs font-semibold text-foreground">
                        Enlace o URL de Destino del Código QR
                      </Label>
                      <Input
                        type="url"
                        value={qrUrl}
                        onChange={(e) => onFieldChange('qrUrl', e.target.value)}
                        placeholder="https://poscocina.com/menu-digital"
                        className="h-10 text-xs font-mono bg-background"
                      />
                      <p className="text-[10.5px] text-muted-foreground">
                        Se generará automáticamente una matriz QR nítida al pie de cada recibo impreso.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Columna Derecha: Simulador Multi-Entorno en Tiempo Real */}
      <div className="w-full min-w-0">
        <IdentityPreviewCard
          companyName={companyName}
          legalName={legalName}
          slogan={slogan}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          borderRadius={borderRadius}
          venueAddress={venueAddress}
          phone={phone}
          taxId={taxId}
          currency={currency}
          paperWidth={paperWidth}
          receiptHeader={receiptHeader}
          receiptFooter={receiptFooter}
          showLogoOnReceipt={showLogoOnReceipt}
          showQrOnReceipt={showQrOnReceipt}
          qrUrl={qrUrl}
        />
      </div>
    </div>
  );
};
