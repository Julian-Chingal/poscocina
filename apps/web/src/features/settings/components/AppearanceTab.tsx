import React from 'react';
import {
  Type,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  CheckCircle2,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import {
  useTypographyStore,
  PRESET_INFO,
  type FontSizePreset,
} from '@/stores/typography.store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';

export const AppearanceTab: React.FC = () => {
  const {
    fontSize,
    preset,
    highContrast,
    setFontSize,
    setPreset,
    setHighContrast,
    resetToDefault,
  } = useTypographyStore();

  const handleSelectPreset = (p: FontSizePreset) => {
    setPreset(p);
    const info = PRESET_INFO[p];
    toast.success(`Escala cambiada a ${info.label} (${info.px}px)`, {
      description: `Guardado en localStorage de este terminal (${info.scale}).`,
    });
  };

  const handleAdjust = (delta: number) => {
    const next = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(next);
    toast.success(`Tipografía: ${next}px`, {
      description: 'Preferencia guardada localmente.',
    });
  };

  const handleReset = () => {
    resetToDefault();
    toast.info('Tipografía restablecida a 16px (Estándar)');
  };

  const presetIcons: Record<FontSizePreset, React.ReactNode> = {
    compact: <Smartphone className="w-5 h-5" />,
    normal: <Monitor className="w-5 h-5" />,
    large: <Tablet className="w-5 h-5" />,
    xlarge: <Eye className="w-5 h-5" />,
  };

  const scalePercent = Math.round((fontSize / 16) * 100);

  return (
    <div className="w-full min-w-0 space-y-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>Tipografía & Escala de Pantalla</span>
                <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/30">
                  Preferencia Local
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Personaliza el tamaño de los textos y elementos del sistema para esta pantalla específica. 
                Los cambios se guardan en el <strong>localStorage</strong> de este navegador y se mantienen persistentes entre sesiones.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl text-xs gap-1.5 shrink-0"
            title="Restablecer tamaño predeterminado (16px)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Escalas Preestablecidas</span>
              </label>
              <span className="text-xs font-mono text-primary font-bold">
                Activo: {fontSize}px ({scalePercent}%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(PRESET_INFO) as FontSizePreset[]).map((key) => {
                const info = PRESET_INFO[key];
                const isSelected = preset === key && fontSize === info.px;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[105px] ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30'
                        : 'border-border bg-card/60 hover:bg-card hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {presetIcons[key]}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground block">
                            {info.label}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {info.px}px · {info.scale}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {info.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine Tuning Slider & Buttons */}
          <Card className="p-5 bg-card border-border rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">Ajuste Fino de Escala</h4>
                <p className="text-xs text-muted-foreground">
                  Aumenta o disminuye píxel por píxel para calibrar con precisión tu monitor o tablet.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
                <span className="text-sm font-black font-mono text-foreground">{fontSize}</span>
                <span className="text-xs font-mono text-muted-foreground">px</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAdjust(-1)}
                disabled={fontSize <= 12}
                className="h-10 w-10 rounded-xl shrink-0 cursor-pointer"
                title="Reducir 1px"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min="12"
                  max="22"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  aria-label="Escala de tipografía en píxeles"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAdjust(1)}
                disabled={fontSize >= 22}
                className="h-10 w-10 rounded-xl shrink-0 cursor-pointer"
                title="Aumentar 1px"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-between text-[11px] text-muted-foreground font-mono px-1">
              <span>12px (Min)</span>
              <span>14px</span>
              <span className="text-foreground font-bold">16px (Normal)</span>
              <span>18px</span>
              <span>22px (Max)</span>
            </div>
          </Card>

          {/* High Contrast Option */}
          <Card className="p-5 bg-card border-border rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-0.5 pr-4">
              <label htmlFor="high-contrast-toggle" className="text-sm font-bold text-foreground cursor-pointer">
                Texto Reforzado (Mayor Nitidez)
              </label>
              <p className="text-xs text-muted-foreground">
                Aumenta el peso y legibilidad tipográfica para pantallas táctiles con reflejos o iluminación intensa.
              </p>
            </div>
            <Switch
              id="high-contrast-toggle"
              checked={highContrast}
              onCheckedChange={setHighContrast}
              aria-label="Alternar texto reforzado"
            />
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>Vista Previa en Tiempo Real</span>
          </label>

          <Card className="p-6 bg-card border-border rounded-3xl shadow-md space-y-5">
            {/* Header simulated */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-black">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Mesa 8 — Terraza</h4>
                  <p className="text-xs text-muted-foreground">Mesero: Carlos Ruiz · 3 Personas</p>
                </div>
              </div>

              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-xs">
                Ocupada
              </Badge>
            </div>

            {/* Simulated order lines */}
            <div className="space-y-2.5 bg-muted/30 p-3.5 rounded-2xl border border-border/60">
              <div className="flex items-start justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">1x Hamburguesa Premium Roble</span>
                  <p className="text-muted-foreground text-[11px]">Término medio · Papas rústicas</p>
                </div>
                <span className="font-mono font-bold text-foreground">$38.000</span>
              </div>

              <div className="flex items-start justify-between gap-2 text-xs pt-2 border-t border-border/40">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">2x Limonada de Coco Natural</span>
                  <p className="text-muted-foreground text-[11px]">Sin azúcar añadida</p>
                </div>
                <span className="font-mono font-bold text-foreground">$24.000</span>
              </div>
            </div>

            {/* Total Section */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal Comanda</span>
                <span className="font-mono">$62.000</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Impoconsumo (8%)</span>
                <span className="font-mono">$4.960</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                <span>Total a Pagar</span>
                <span className="font-mono text-primary text-base font-black">$66.960</span>
              </div>
            </div>

            {/* Action buttons simulated */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Agregar Ítem</span>
              </Button>
              <Button size="sm" className="rounded-xl text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cobrar Cuenta</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;
