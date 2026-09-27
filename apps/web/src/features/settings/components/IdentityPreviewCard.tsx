import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Receipt,
  Smartphone,
  Sparkles,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  companyName: string;
  legalName?: string;
  slogan?: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor?: string;
  borderRadius?: 'subtle' | 'modern' | 'pill';
  venueAddress: string;
  phone: string;
  taxId?: string;
  currency?: string;
  paperWidth?: 58 | 80;
  receiptHeader?: string;
  receiptFooter?: string;
  showLogoOnReceipt?: boolean;
  showQrOnReceipt?: boolean;
  qrUrl?: string;
}

// Realistic SVG QR Code component
const MockQrCodeSvg: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 25 25"
    fill="currentColor"
    className="mx-auto text-slate-900"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Corner Position Detection Patterns */}
    {/* Top-Left */}
    <rect x="1" y="1" width="7" height="7" fill="black" />
    <rect x="2" y="2" width="5" height="5" fill="white" />
    <rect x="3" y="3" width="3" height="3" fill="black" />

    {/* Top-Right */}
    <rect x="17" y="1" width="7" height="7" fill="black" />
    <rect x="18" y="2" width="5" height="5" fill="white" />
    <rect x="19" y="3" width="3" height="3" fill="black" />

    {/* Bottom-Left */}
    <rect x="1" y="17" width="7" height="7" fill="black" />
    <rect x="2" y="18" width="5" height="5" fill="white" />
    <rect x="3" y="19" width="3" height="3" fill="black" />

    {/* Timing Patterns */}
    <rect x="9" y="3" width="1" height="1" fill="black" />
    <rect x="11" y="3" width="1" height="1" fill="black" />
    <rect x="13" y="3" width="1" height="1" fill="black" />
    <rect x="15" y="3" width="1" height="1" fill="black" />
    <rect x="3" y="9" width="1" height="1" fill="black" />
    <rect x="3" y="11" width="1" height="1" fill="black" />
    <rect x="3" y="13" width="1" height="1" fill="black" />
    <rect x="3" y="15" width="1" height="1" fill="black" />

    {/* Data Matrix Bits */}
    <rect x="9" y="9" width="2" height="2" fill="black" />
    <rect x="13" y="9" width="1" height="2" fill="black" />
    <rect x="16" y="9" width="2" height="1" fill="black" />
    <rect x="10" y="12" width="2" height="1" fill="black" />
    <rect x="14" y="12" width="2" height="2" fill="black" />
    <rect x="9" y="15" width="1" height="2" fill="black" />
    <rect x="11" y="16" width="3" height="1" fill="black" />
    <rect x="16" y="15" width="1" height="3" fill="black" />
    <rect x="10" y="19" width="2" height="2" fill="black" />
    <rect x="14" y="19" width="2" height="1" fill="black" />
    <rect x="18" y="18" width="2" height="2" fill="black" />
    <rect x="21" y="14" width="2" height="2" fill="black" />
    <rect x="19" y="10" width="2" height="2" fill="black" />
    <rect x="10" y="6" width="2" height="1" fill="black" />
    <rect x="14" y="6" width="1" height="2" fill="black" />
  </svg>
);

export const IdentityPreviewCard: React.FC<Props> = ({
  companyName,
  legalName,
  slogan,
  logoUrl,
  primaryColor,
  secondaryColor = '#475569',
  borderRadius = 'modern',
  venueAddress,
  phone,
  taxId = '900.123.456-7',
  currency = 'COP',
  paperWidth = 80,
  receiptHeader = 'Sabor tradicional & Alta cocina',
  receiptFooter = '¡Gracias por su visita! Síguenos en @poscocina',
  showLogoOnReceipt = true,
  showQrOnReceipt = true,
  qrUrl = 'https://poscocina.com/menu',
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'ticket' | 'pos' | 'brand'>('ticket');

  const formattedName = companyName.trim() || 'poscocina Gourmet';
  const formattedLegal = legalName?.trim() || 'poscocina S.A.S.';
  const formattedAddress = venueAddress.trim() || 'Calle 93 # 12-45, Sede Principal';
  const formattedPhone = phone.trim() || '+57 300 123 4567';

  const buttonRadiusClass =
    borderRadius === 'subtle' ? 'rounded-md' : borderRadius === 'modern' ? 'rounded-xl' : 'rounded-full';

  return (
    <Card className="w-full lg:sticky lg:top-6 shadow-sm border-border overflow-hidden bg-card/90 backdrop-blur-xs flex flex-col">
      {/* Header with live indicator */}
      <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
              Simulador de Marca en Vivo
            </CardTitle>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono font-medium px-2 py-0.5 text-muted-foreground border-border/80">
            En Tiempo Real
          </Badge>
        </div>

        {/* Tab switchers */}
        <div className="pt-2">
          <Tabs value={activePreviewTab} onValueChange={(v) => setActivePreviewTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-9 p-0.5 bg-muted/60 rounded-xl">
              <TabsTrigger
                value="ticket"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Ticket ESC/POS</span>
              </TabsTrigger>

              <TabsTrigger
                value="pos"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pantalla POS</span>
              </TabsTrigger>

              <TabsTrigger
                value="brand"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ficha Marca</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-center">
        {/* ======================================================== */}
        {/* PREVIEW 1: TICKET TÉRMICO ESC/POS                        */}
        {/* ======================================================== */}
        {activePreviewTab === 'ticket' && (
          <div
            className={`relative mx-auto w-full my-1 transition-all ${
              paperWidth === 58 ? 'max-w-[240px]' : 'max-w-[285px]'
            }`}
          >
            {/* Paper Texture and Jagged Cut Effect */}
            <div className="relative bg-[#fffdfa] text-slate-800 rounded-t-xl shadow-xl border border-slate-200/90 font-mono text-[11px] p-5 select-none transition-all">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
                {showLogoOnReceipt && (
                  <>
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-12 h-12 object-contain mx-auto mb-1.5 rounded"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                    )}
                  </>
                )}

                <div className="font-extrabold text-sm uppercase tracking-tight text-slate-950">
                  {formattedName}
                </div>
                {slogan && (
                  <div className="text-[9.5px] italic text-slate-600 font-sans leading-tight">
                    "{slogan}"
                  </div>
                )}
                <div className="text-[10px] text-slate-500 font-sans font-medium">{formattedLegal}</div>
                <div className="text-[10px] text-slate-600">NIT: {taxId}</div>
                <div className="text-[9.5px] text-slate-500 leading-tight">{formattedAddress}</div>
                <div className="text-[9.5px] text-slate-500">Tel: {formattedPhone}</div>
                {receiptHeader && (
                  <div className="text-[9px] font-sans font-semibold text-slate-700 pt-1">
                    {receiptHeader}
                  </div>
                )}
              </div>

              {/* Order Metadata */}
              <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5 text-slate-600">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Factura: #POS-00148</span>
                  <span>Mesa: 04</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha: 26/09/2026 21:30</span>
                  <span>Turno: Noche</span>
                </div>
              </div>

              {/* Itemized Order */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5 text-[10.5px]">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold block text-slate-900">1x Bife de Chorizo 350g</span>
                    <span className="text-[9px] text-slate-500 font-sans block">Término medio</span>
                  </div>
                  <span className="font-bold shrink-0">$42.000</span>
                </div>

                <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold block text-slate-900">1x Papas Trufadas</span>
                    <span className="text-[9px] text-slate-500 font-sans block">Queso parmesano</span>
                  </div>
                  <span className="font-bold shrink-0">$16.000</span>
                </div>

                <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold block text-slate-900">1x Cerveza Artesanal</span>
                    <span className="text-[9px] text-slate-500 font-sans block">330ml botella</span>
                  </div>
                  <span className="font-bold shrink-0">$14.000</span>
                </div>
              </div>

              {/* Totals & Tax Calculation */}
              <div className="pt-2 text-[10px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Gravable:</span>
                  <span>$61.016</span>
                </div>
                <div className="flex justify-between">
                  <span>Impoconsumo (8%):</span>
                  <span>$4.884</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Propina Voluntaria (10%):</span>
                  <span>$6.590</span>
                </div>

                <div className="flex justify-between items-center text-xs font-extrabold text-slate-950 pt-1.5 border-t border-slate-400">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-sm font-black">$72.490 {currency}</span>
                </div>
              </div>

              {/* Thermal Receipt Footer & QR */}
              <div className="text-center pt-3 mt-3 border-t border-dashed border-slate-300 space-y-2">
                <p className="text-[9.5px] text-slate-600 font-sans leading-tight">{receiptFooter}</p>

                {/* Optional QR Code for Menu or Digital Payment */}
                {showQrOnReceipt && (
                  <div className="pt-1.5 pb-1 space-y-1 bg-slate-50/80 p-2 rounded border border-slate-200/60">
                    <MockQrCodeSvg size={60} />
                    <span className="text-[8.5px] font-sans text-slate-600 block leading-tight font-medium">
                      Escanea para ver menú o calificar servicio
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-400 block truncate">
                      {qrUrl}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1 text-[8.5px] text-slate-400 font-sans">
                  <span>poscocina Cloud POS • Impreso en {paperWidth}mm</span>
                </div>
              </div>
            </div>

            {/* Jagged / Sawtooth Bottom Edge for Thermal Paper */}
            <div
              className="h-3 w-full bg-[#fffdfa] shadow-lg border-x border-slate-200/90"
              style={{
                clipPath:
                  'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)',
              }}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* PREVIEW 2: PANTALLA POS / COMANDERO TABLET               */}
        {/* ======================================================== */}
        {activePreviewTab === 'pos' && (
          <div className="w-full max-w-[320px] mx-auto rounded-2xl border-2 border-slate-800 bg-slate-900 p-2 shadow-2xl space-y-2">
            {/* Tablet Mockup Camera Notch & Status */}
            <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 font-mono">
              <span>21:30</span>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
              <span>100% ⚡</span>
            </div>

            {/* Virtual POS Header Screen */}
            <div className="rounded-xl overflow-hidden bg-background border border-border shadow-inner">
              {/* App Brand Header */}
              <div
                className="px-3 py-2 text-white flex items-center justify-between transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain rounded bg-white/20 p-0.5" />
                  ) : (
                    <UtensilsCrossed className="w-4 h-4 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs block leading-tight truncate">
                      {formattedName}
                    </span>
                    {slogan ? (
                      <span className="text-[8.5px] opacity-90 block truncate">{slogan}</span>
                    ) : (
                      <span className="text-[8.5px] opacity-80 block truncate">Sede Principal</span>
                    )}
                  </div>
                </div>

                <Badge
                  className="text-white text-[9px] font-mono border-0 shrink-0"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Mesa 04
                </Badge>
              </div>

              {/* POS Active Order Body */}
              <div className="p-3 space-y-2.5 bg-card text-foreground">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/80">
                  <span className="font-bold text-foreground">Comanda en Mesa</span>
                  <span className="text-[10px] text-muted-foreground font-mono">#00148</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-muted/30 p-1.5 rounded-lg">
                    <span className="font-medium text-[11px] truncate">1x Bife de Chorizo</span>
                    <span className="font-bold text-[11px] font-mono">$42.000</span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/30 p-1.5 rounded-lg">
                    <span className="font-medium text-[11px] truncate">1x Papas Trufadas</span>
                    <span className="font-bold text-[11px] font-mono">$16.000</span>
                  </div>
                </div>

                {/* Primary Action Button using Corporate Color and Custom Radius */}
                <div className="pt-2">
                  <button
                    type="button"
                    className={`w-full py-2 px-3 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-default ${buttonRadiusClass}`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Cobrar Cuenta ($58.000)</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-sans">
              Apariencia en Comandero Móvil & Tablet
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* PREVIEW 3: FICHA CORPORATIVA & MARCA                    */}
        {/* ======================================================== */}
        {activePreviewTab === 'brand' && (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-3">
              <div
                className={`w-20 h-20 mx-auto flex items-center justify-center text-white shadow-xl overflow-hidden ring-4 ring-primary/20 transition-all ${buttonRadiusClass}`}
                style={{ backgroundColor: primaryColor }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <UtensilsCrossed className="w-10 h-10" />
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-foreground text-base tracking-tight">{formattedName}</h4>
                {slogan && <p className="text-xs text-muted-foreground italic">"{slogan}"</p>}
                <p className="text-xs font-medium text-primary mt-0.5">{formattedLegal}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[200px]">{formattedAddress}</span>
                </div>
              </div>
            </div>

            {/* Brand Specs Matrix */}
            <div className="bg-muted/40 rounded-xl p-3 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Color Primario:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: primaryColor }} />
                  <span className="font-mono font-bold text-foreground uppercase">{primaryColor}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Color Secundario:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: secondaryColor }} />
                  <span className="font-mono font-bold text-foreground uppercase">{secondaryColor}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Geometría de Bordes:</span>
                <span className="font-semibold text-foreground capitalize">{borderRadius}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">QR en Tickets:</span>
                <span className="font-semibold text-foreground">
                  {showQrOnReceipt ? 'Habilitado' : 'Desactivado'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
