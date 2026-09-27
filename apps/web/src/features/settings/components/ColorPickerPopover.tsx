import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Pipette, Copy, Check, ChevronDown, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/sileo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (hex: string) => void;
  label: string;
  description?: string;
}

// Convert Hex to HSV
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return { h: 18, s: 85, v: 92 };

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// Convert HSV to Hex
function hsvToHex(h: number, s: number, v: number): string {
  const sDec = s / 100;
  const vDec = v / 100;
  const c = vDec * sDec;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vDec - c;

  let r = 0,
    g = 0,
    b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const val = Math.max(0, Math.min(255, Math.round((n + m) * 255)));
    return val.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convert Hex to RGB object
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (clean.length !== 6) return { r: 234, g: 88, b: 12 };
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

const QUICK_PALETTE = [
  { name: 'Brasa / Fuego', hex: '#EA580C' },
  { name: 'Rojo Pasión', hex: '#DC2626' },
  { name: 'Ámbar Café', hex: '#D97706' },
  { name: 'Huerto Verde', hex: '#16A34A' },
  { name: 'Azul Océano', hex: '#0284C7' },
  { name: 'Púrpura Lounge', hex: '#9333EA' },
  { name: 'Rosa Gourmet', hex: '#E11D48' },
  { name: 'Pizarra Urbano', hex: '#334155' },
];

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  color,
  onChange,
  label,
  description,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'hex' | 'rgb'>('hex');
  const [copied, setCopied] = useState(false);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const [hexInput, setHexInput] = useState(color.replace('#', ''));

  // Parse initial color
  const initialHsv = useMemo(() => hexToHsv(color), [color]);
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);

  // Sync internal state when prop changes from outside
  useEffect(() => {
    const parsed = hexToHsv(color);
    setHue(parsed.h);
    setSat(parsed.s);
    setVal(parsed.v);
    setHexInput(color.replace('#', ''));
  }, [color]);

  // Check EyeDropper support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Handle Saturation & Value dragging
  const handleSatValMove = (clientX: number, clientY: number) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const newSat = Math.round((x / rect.width) * 100);
    const newVal = Math.round((1 - y / rect.height) * 100);

    setSat(newSat);
    setVal(newVal);
    const newHex = hsvToHex(hue, newSat, newVal);
    setHexInput(newHex.replace('#', ''));
    onChange(newHex);
  };

  const handleSatValMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleSatValMove(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSatValMove(moveEvent.clientX, moveEvent.clientY);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle Hue slider dragging
  const handleHueMove = (clientX: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const newHue = Math.min(360, Math.max(0, Math.round((x / rect.width) * 360)));

    setHue(newHue);
    const newHex = hsvToHex(newHue, sat, val);
    setHexInput(newHex.replace('#', ''));
    onChange(newHex);
  };

  const handleHueMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleHueMove(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleHueMove(moveEvent.clientX);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // EyeDropper Tool ("El lápiz / pipeta cuentagotas")
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const pickedHex = result.sRGBHex.toUpperCase();
          const parsed = hexToHsv(pickedHex);
          setHue(parsed.h);
          setSat(parsed.s);
          setVal(parsed.v);
          setHexInput(pickedHex.replace('#', ''));
          onChange(pickedHex);
          toast.success(`Color ${pickedHex} seleccionado`);
        }
      } catch (err) {
        // User cancelled sampling
      }
    } else {
      toast.info('Tu navegador no admite la herramienta cuentagotas');
    }
  };

  // Copy Color HEX to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      toast.success(`Color ${color} copiado al portapapeles`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el color');
    }
  };

  const handlePaletteSelect = (swatchHex: string) => {
    const parsed = hexToHsv(swatchHex);
    setHue(parsed.h);
    setSat(parsed.s);
    setVal(parsed.v);
    setHexInput(swatchHex.replace('#', ''));
    onChange(swatchHex);
  };

  const rgb = hexToRgb(color);

  // Render modal content through Portal to document.body
  const renderModal = () => {
    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="color-picker-title"
          className="relative w-full max-w-[360px] rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title, Target Badge & Close X */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 id="color-picker-title" className="text-sm font-extrabold text-foreground leading-tight">
                  Selector de Color
                </h3>
                <span className="text-[11px] font-semibold text-primary block leading-tight truncate">
                  {label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. 2D Saturation / Brightness Gradient Canvas */}
          <div
            ref={satValRef}
            onMouseDown={handleSatValMouseDown}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              handleSatValMove(touch.clientX, touch.clientY);
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              handleSatValMove(touch.clientX, touch.clientY);
            }}
            className="relative w-full h-[165px] rounded-2xl overflow-hidden cursor-crosshair shadow-inner select-none border border-border/40"
            style={{
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
            }}
          >
            {/* White gradient layer (Horizontal) */}
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />

            {/* Black gradient layer (Vertical) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            {/* Circular Draggable Handle Ring */}
            <div
              className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg pointer-events-none transition-transform ring-1 ring-black/20"
              style={{
                left: `${sat}%`,
                top: `${100 - val}%`,
                backgroundColor: color,
              }}
            />
          </div>

          {/* 2. Hue Rainbow Slider Bar */}
          <div className="space-y-1.5">
            <div
              ref={hueRef}
              onMouseDown={handleHueMouseDown}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                handleHueMove(touch.clientX);
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                handleHueMove(touch.clientX);
              }}
              className="relative w-full h-3.5 rounded-full cursor-pointer shadow-inner select-none border border-border/40"
              style={{
                background:
                  'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
              }}
            >
              {/* Slider Thumb Handle */}
              <div
                className="absolute top-1/2 -mt-2.5 w-5 h-5 -ml-2.5 rounded-full border-2 border-white shadow-md pointer-events-none bg-white transition-transform ring-1 ring-black/20"
                style={{
                  left: `${(hue / 360) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 3. Controls Bar: Swatch + Input + Eyedropper ("el lápiz") + Copy + Format */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Swatch circle */}
              <div
                className="w-8 h-8 rounded-xl shrink-0 shadow-xs border border-black/10 transition-transform"
                style={{ backgroundColor: color }}
              />

              {format === 'hex' ? (
                /* HEX Code Input */
                <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-xl border border-border/80 flex-1 min-w-0 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <span className="text-xs font-mono font-bold text-muted-foreground">#</span>
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                      setHexInput(val);
                      if (val.length === 6) {
                        const newHex = '#' + val.toUpperCase();
                        const parsed = hexToHsv(newHex);
                        setHue(parsed.h);
                        setSat(parsed.s);
                        setVal(parsed.v);
                        onChange(newHex);
                      }
                    }}
                    onBlur={() => {
                      if (hexInput.length !== 6) {
                        setHexInput(color.replace('#', ''));
                      }
                    }}
                    className="w-full text-xs font-mono font-bold uppercase bg-transparent outline-none text-foreground"
                    placeholder="EA580C"
                    maxLength={6}
                  />
                </div>
              ) : (
                /* RGB Input Display */
                <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-xl border border-border/80 flex-1 truncate">
                  <span>{rgb.r},</span>
                  <span>{rgb.g},</span>
                  <span>{rgb.b}</span>
                </div>
              )}
            </div>

            {/* Actions: Eyedropper ("el lápiz") + Copy + Format */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Eyedropper / Pipette button */}
              {hasEyeDropper && (
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  title="Cuentagotas / Lápiz (Muestrear color de pantalla)"
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60 hover:border-primary/50"
                >
                  <Pipette className="w-4 h-4 text-primary" />
                </button>
              )}

              {/* Copy Color button */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copiar código HEX"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60 hover:border-primary/50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Format Toggle Dropdown */}
              <button
                type="button"
                onClick={() => setFormat(format === 'hex' ? 'rgb' : 'hex')}
                className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl border border-border/80 text-[11px] font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              >
                <span className="uppercase">{format}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* 4. Quick Palette Presets */}
          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              Paleta Rápida de Restaurante
            </span>
            <div className="flex items-center justify-between gap-1.5">
              {QUICK_PALETTE.map((swatch) => {
                const isSelected = color.toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    title={swatch.name}
                    onClick={() => handlePaletteSelect(swatch.hex)}
                    className={cn(
                      'w-7 h-7 rounded-lg transition-transform hover:scale-110 cursor-pointer border relative flex items-center justify-center shadow-2xs',
                      isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110 border-white' : 'border-black/10'
                    )}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Footer Confirmation Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsOpen(false);
                toast.success(`Color ${color} aplicado`);
              }}
              className="w-full h-10 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Listo / Aplicar Color
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Trigger Card */}
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none group',
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
            : 'border-border/80 bg-background hover:border-border hover:bg-muted/40 shadow-xs'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Color Preview Swatch */}
          <div
            className="w-10 h-10 rounded-xl shadow-xs shrink-0 border border-black/10 transition-transform group-hover:scale-105"
            style={{ backgroundColor: color }}
          />

          <div className="min-w-0">
            <span className="text-xs font-bold text-foreground block leading-tight truncate">
              {label}
            </span>
            {description && (
              <span className="text-[10.5px] text-muted-foreground block truncate mt-0.5">
                {description}
              </span>
            )}
          </div>
        </div>

        {/* HEX Pill Button */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="text-xs font-mono font-bold text-muted-foreground">#</span>
          <div className="px-3 py-1.5 rounded-xl border border-border/80 bg-card font-mono text-xs font-bold uppercase text-foreground shadow-xs group-hover:border-primary/50 transition-colors">
            {color.replace('#', '')}
          </div>
        </div>
      </div>

      {/* Modal Dialog portal */}
      {renderModal()}
    </>
  );
};
