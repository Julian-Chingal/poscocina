import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Check, Sparkles, ShieldCheck, AlertCircle, Wand2, Layers, Sliders } from 'lucide-react';
import { ColorPickerPopover } from './ColorPickerPopover';
import { cn } from '@/lib/utils';

export interface GastronomicThemePreset {
  id: string;
  name: string;
  category: string;
  primary: string;
  secondary: string;
  radius: 'subtle' | 'modern' | 'pill';
  slogan: string;
}

export const THEME_PRESETS: GastronomicThemePreset[] = [
  {
    id: 'brasa',
    name: 'Brasa & Fuego',
    category: 'Parrilla, Carnes & Tacos',
    primary: '#ea580c',
    secondary: '#9a3412',
    radius: 'modern',
    slogan: 'Fuego lento, tradición y asados',
  },
  {
    id: 'trattoria',
    name: 'Trattoria & Horno',
    category: 'Pizzería & Cocina Italiana',
    primary: '#dc2626',
    secondary: '#991b1b',
    radius: 'subtle',
    slogan: 'Auténtica masa madre y pasta artesanal',
  },
  {
    id: 'bistro',
    name: 'Bistro & Especialidad',
    category: 'Cafetería, Pastelería & Brunch',
    primary: '#d97706',
    secondary: '#78350f',
    radius: 'modern',
    slogan: 'Café de origen y momentos dulces',
  },
  {
    id: 'huerto',
    name: 'Huerto Orgánico',
    category: 'Cocina Verde & Saludable',
    primary: '#16a34a',
    secondary: '#14532d',
    radius: 'pill',
    slogan: 'Ingredientes frescos de campo a mesa',
  },
  {
    id: 'oceano',
    name: 'Océano & Barra',
    category: 'Mariscos, Sushi & Ceviches',
    primary: '#0284c7',
    secondary: '#075985',
    radius: 'subtle',
    slogan: 'Pescados selectos & cocina marina',
  },
  {
    id: 'lounge',
    name: 'Lounge & Autor',
    category: 'Fine Dining, Vinos & Coctelería',
    primary: '#9333ea',
    secondary: '#581c87',
    radius: 'pill',
    slogan: 'Experiencias sensoriales y autor',
  },
  {
    id: 'dark',
    name: 'Gastrobar Urbano',
    category: 'Pub, Cervecería & Tapas',
    primary: '#334155',
    secondary: '#0f172a',
    radius: 'modern',
    slogan: 'Cerveza artesanal & buena vibra',
  },
];

interface Props {
  primaryColor: string;
  secondaryColor?: string;
  borderRadius?: 'subtle' | 'modern' | 'pill';
  onColorChange: (color: string) => void;
  onSecondaryColorChange?: (color: string) => void;
  onBorderRadiusChange?: (radius: 'subtle' | 'modern' | 'pill') => void;
  onApplyThemePreset?: (preset: GastronomicThemePreset) => void;
}

// Utility for contrast calculation
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export const ColorPickerSection: React.FC<Props> = ({
  primaryColor,
  secondaryColor = '#475569',
  borderRadius = 'modern',
  onColorChange,
  onSecondaryColorChange,
  onBorderRadiusChange,
  onApplyThemePreset,
}) => {
  const handlePrimaryChange = (color: string) => {
    if (color) {
      document.documentElement.style.setProperty('--primary-brand', color);
    }
    onColorChange(color);
  };

  const handleSecondaryChange = (color: string) => {
    if (color) {
      document.documentElement.style.setProperty('--secondary-brand', color);
    }
    if (onSecondaryColorChange) onSecondaryColorChange(color);
  };

  const luminance = useMemo(() => getLuminance(primaryColor || '#ea580c'), [primaryColor]);
  const isAccessibleWithWhite = luminance < 0.65;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Presets */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              Temas Gastronómicos Rápidos (1-Clic)
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aplica al instante una combinación profesional de colores, redondeo y tono gastronómico.
            </p>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto shrink-0',
              isAccessibleWithWhite
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            )}
          >
            {isAccessibleWithWhite ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Contraste Óptimo (AAA)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Contraste Bajo</span>
              </>
            )}
          </div>
        </div>

        {/* Theme presets grid - Spacious, NO text truncation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = primaryColor.toLowerCase() === preset.primary.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  handlePrimaryChange(preset.primary);
                  handleSecondaryChange(preset.secondary);
                  if (onBorderRadiusChange) onBorderRadiusChange(preset.radius);
                  if (onApplyThemePreset) onApplyThemePreset(preset);
                }}
                className={cn(
                  'group p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3',
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/80 bg-card/60 hover:bg-muted/60 hover:border-border'
                )}
              >
                {/* Two-tone color dot */}
                <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden shadow-xs flex items-center justify-center border border-white/20">
                  <div className="absolute inset-0 w-1/2" style={{ backgroundColor: preset.primary }} />
                  <div className="absolute inset-y-0 right-0 w-1/2" style={{ backgroundColor: preset.secondary }} />
                  {isSelected && (
                    <div className="relative z-10 w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-foreground block leading-tight">
                    {preset.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground block leading-snug mt-0.5 truncate">
                    {preset.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Color Adjustments & Geometry */}
      <div className="pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary and Secondary Color Pickers */}
        <div className="space-y-4">
          <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Ajuste Fino de Colores (HEX)
          </Label>

          <div className="space-y-3">
            {/* Primary Brand Color */}
            <ColorPickerPopover
              color={primaryColor}
              onChange={handlePrimaryChange}
              label="Color Primario"
              description="Botones de cobro y acentos principales"
            />

            {/* Secondary / Contrast Color */}
            <ColorPickerPopover
              color={secondaryColor}
              onChange={handleSecondaryChange}
              label="Color Secundario / Acento"
              description="Encabezados secundarios y etiquetas"
            />
          </div>
        </div>

        {/* 3. Component Geometry & Border Radius */}
        <div className="space-y-4">
          <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Estilo y Geometría de Componentes
          </Label>

          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'subtle', name: 'Preciso', radius: '6px', desc: 'Cuadrado / Técnico' },
                { id: 'modern', name: 'Moderno', radius: '12px', desc: 'Equilibrado / POS' },
                { id: 'pill', name: 'Orgánico', radius: '20px', desc: 'Curvo / Cálido' },
              ].map((style) => {
                const isSelected = borderRadius === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      if (onBorderRadiusChange) onBorderRadiusChange(style.id as any);
                    }}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20'
                        : 'border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <div
                      className="w-8 h-5 border-2 border-current mb-1.5 opacity-80"
                      style={{
                        borderRadius: style.id === 'subtle' ? '3px' : style.id === 'modern' ? '7px' : '12px',
                      }}
                    />
                    <span className="text-xs block font-bold leading-tight">{style.name}</span>
                    <span className="text-[10px] text-muted-foreground block font-normal">{style.radius}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Interactive Button Specimen */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Previsualización de Botón:</span>
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-default flex items-center gap-1.5"
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: borderRadius === 'subtle' ? '6px' : borderRadius === 'modern' ? '12px' : '9999px',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Confirmar Orden $45.000</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
