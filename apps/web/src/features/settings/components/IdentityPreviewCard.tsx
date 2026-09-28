import React, { useState } from 'react';
import {
  UtensilsCrossed,
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
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'pos' | 'brand'>('pos');

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
            <TabsList className="grid grid-cols-2 w-full h-9 p-0.5 bg-muted/60 rounded-xl">
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
        {/* PREVIEW 1: PANTALLA POS / COMANDERO TABLET               */}
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

              {/* Sample POS Item Grid */}
              <div className="p-3 space-y-2 bg-muted/10">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="font-bold text-foreground">Comanda Activa</span>
                  <span className="text-muted-foreground font-mono">#1042</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-card border border-border/70 flex justify-between items-center shadow-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                        1
                      </span>
                      <span className="font-semibold text-foreground truncate">Lomo al Trapo 300g</span>
                    </div>
                    <span className="font-mono text-muted-foreground ml-2 shrink-0">$38.000</span>
                  </div>

                  <div className="p-2 rounded-lg bg-card border border-border/70 flex justify-between items-center shadow-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                        2
                      </span>
                      <span className="font-semibold text-foreground truncate">Copa Vino Tinto</span>
                    </div>
                    <span className="font-mono text-muted-foreground ml-2 shrink-0">$28.000</span>
                  </div>
                </div>

                {/* Subtotal & Action Button with Custom Radius */}
                <div className="pt-2 border-t border-border/60">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Total Orden:</span>
                    <span className="font-mono text-primary">$66.000 {currency}</span>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${buttonRadiusClass}`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Cobrar Comanda</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PREVIEW 2: FICHA DE MARCA / BRAND ASSET CARD             */}
        {/* ======================================================== */}
        {activePreviewTab === 'brand' && (
          <div className="w-full max-w-[320px] mx-auto space-y-3">
            {/* Hero Brand Identity Card */}
            <div
              className={`p-5 text-white shadow-xl transition-all relative overflow-hidden ${buttonRadiusClass}`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <div className="relative z-10 space-y-3">
                <div className="flex items-center space-x-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-12 h-12 object-contain rounded-xl bg-white/20 p-1 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                      <UtensilsCrossed className="w-6 h-6 text-white" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-black text-base tracking-tight leading-tight truncate">
                      {formattedName}
                    </h3>
                    <p className="text-[10.5px] opacity-90 truncate">{formattedLegal}</p>
                  </div>
                </div>

                {slogan && (
                  <p className="text-xs italic opacity-95 pt-1 border-t border-white/20 leading-snug">
                    "{slogan}"
                  </p>
                )}

                <div className="pt-2 text-[10px] opacity-85 space-y-0.5 font-mono">
                  <div className="flex items-center space-x-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{formattedAddress}</span>
                  </div>
                  <div>NIT: {taxId}</div>
                  <div>Tel: {formattedPhone}</div>
                </div>
              </div>

              {/* Decorative background shape */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-md pointer-events-none" />
            </div>

            {/* Color Swatch Information Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-border bg-card flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block truncate">Color Primario</span>
                  <span className="font-mono text-xs font-bold text-foreground truncate block">
                    {primaryColor}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-border bg-card flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: secondaryColor }}
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block truncate">Secundario</span>
                  <span className="font-mono text-xs font-bold text-foreground truncate block">
                    {secondaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
