import React, { useState, useEffect } from 'react';
import { ChefHat, Flame, Sparkles, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GastronomicLoaderProps {
  /** Mensaje principal. Si se omite, rota dinámicamente entre frases culinarias */
  message?: string;
  /** Subtítulo o detalle contextual */
  submessage?: string;
  /** Modo de visualización */
  variant?: 'fullscreen' | 'card' | 'inline' | 'compact';
  /** Tipo de icono culinario destacado */
  iconType?: 'cloche' | 'chef' | 'flame' | 'utensils';
  /** Muestra la barra de cocción/progreso deslizante */
  showProgressBar?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

const DEFAULT_CULINARY_PHRASES = [
  'Alistando la cocina y encendiendo fogones...',
  'Preparando el salón y organizando comandas...',
  'Sincronizando recetas y puntos de cocción...',
  'Emplatando datos frescos para el servicio...',
];

export const GastronomicLoader: React.FC<GastronomicLoaderProps> = ({
  message,
  submessage = 'PosCocina · Sabor tradicional & Alta cocina',
  variant = 'fullscreen',
  iconType = 'cloche',
  showProgressBar = true,
  className,
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Rotación suave de frases culinarias cuando no se especifica un mensaje estático
  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % DEFAULT_CULINARY_PHRASES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [message]);

  const activeMessage = message || DEFAULT_CULINARY_PHRASES[phraseIndex];

  // Render del icono según el tipo
  const renderIcon = () => {
    if (iconType === 'chef') {
      return (
        <div className="relative flex items-center justify-center size-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10 animate-cloche-float">
          <ChefHat className="size-10 text-primary" strokeWidth={1.8} />
          <Sparkles className="absolute -top-1 -right-1 size-4 text-amber-500 animate-pulse" />
        </div>
      );
    }

    if (iconType === 'flame') {
      return (
        <div className="relative flex items-center justify-center size-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/10 animate-cloche-float">
          <Flame className="size-10 text-orange-500 animate-pulse" strokeWidth={1.8} />
          <Sparkles className="absolute -top-1 -right-1 size-4 text-amber-400 animate-bounce" />
        </div>
      );
    }

    if (iconType === 'utensils') {
      return (
        <div className="relative flex items-center justify-center size-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10 animate-cloche-float">
          <UtensilsCrossed className="size-10 text-primary" strokeWidth={1.8} />
        </div>
      );
    }

    // Default: Campana Gourmet (Cloche) vectorial con vapor aromático
    return (
      <div className="relative flex items-center justify-center select-none" aria-hidden="true">
        {/* Resplandor cálido de fondo */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/15 via-orange-500/20 to-primary/10 rounded-full blur-xl animate-pulse pointer-events-none" />

        <svg
          viewBox="0 0 100 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-24 sm:size-28 text-foreground drop-shadow-md"
        >
          {/* Sombra de la bandeja */}
          <ellipse
            cx="50"
            cy="80"
            rx="36"
            ry="4"
            className="fill-muted-foreground/20 dark:fill-black/50"
          />

          {/* Wisps de Vapor aromático */}
          <g className="motion-reduce:hidden">
            {/* Vapor 1 (Izquierda) */}
            <path
              d="M 42 22 C 39 16, 44 11, 41 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="animate-steam-1 text-primary/80"
            />
            {/* Vapor 2 (Centro) */}
            <path
              d="M 50 19 C 53 13, 47 8, 51 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              className="animate-steam-2 text-primary"
            />
            {/* Vapor 3 (Derecha) */}
            <path
              d="M 58 22 C 55 16, 60 11, 57 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="animate-steam-3 text-primary/70"
            />
          </g>

          {/* Grupo animado de la campana (flota rítmicamente) */}
          <g className="animate-cloche-float motion-reduce:animate-none">
            {/* Bandeja base del cloche */}
            <path
              d="M 12 71 C 12 67, 88 67, 88 71 C 88 75.5, 12 75.5, 12 71 Z"
              className="fill-card stroke-border dark:stroke-border/80"
              strokeWidth="2.5"
            />
            <path
              d="M 18 71.5 L 82 71.5"
              className="stroke-primary/30"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Cúpula / Campana gourmet */}
            <path
              d="M 20 67 C 20 40, 33 28, 50 28 C 67 28, 80 40, 80 67 Z"
              className="fill-card stroke-border dark:fill-card dark:stroke-border"
              strokeWidth="2.5"
            />

            {/* Reflejo / brillo curvo en la cúpula */}
            <path
              d="M 29 63 C 29 46, 38 37, 48 34"
              fill="none"
              className="stroke-primary/35 dark:stroke-primary/45"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Cuello y mango superior */}
            <path
              d="M 48 28 L 48 24 C 48 22.5, 52 22.5, 52 24 L 52 28 Z"
              className="fill-primary stroke-border"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="22"
              r="4.8"
              className="fill-primary stroke-card dark:stroke-card shadow-sm"
              strokeWidth="2"
            />

            {/* Pequeño detalle de fogón/brillo en el plato */}
            <circle
              cx="50"
              cy="67"
              r="1.5"
              className="fill-primary animate-ping"
            />
          </g>
        </svg>
      </div>
    );
  };

  // 1. Variante Compacta (Para badges, botones o dropdowns)
  if (variant === 'compact') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)}
      >
        <span className="relative flex size-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full size-2.5 bg-primary" />
        </span>
        <span className="truncate font-medium">{activeMessage}</span>
      </div>
    );
  }

  // 2. Variante Inline (Horizontal)
  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs',
          className
        )}
      >
        <div className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <ChefHat className="size-4 animate-bounce" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate">{activeMessage}</p>
          {submessage && (
            <p className="text-[10px] text-muted-foreground truncate">{submessage}</p>
          )}
        </div>
      </div>
    );
  }

  // 3. Variante Card / Sección (Para componentes dentro de una vista como KDS o Caja)
  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-card/60 backdrop-blur-xs border border-border/80 shadow-xs',
          className
        )}
      >
        {renderIcon()}

        <div className="mt-4 space-y-1.5 max-w-sm">
          <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight transition-all duration-300">
            {activeMessage}
          </h3>
          {submessage && (
            <p className="text-xs text-muted-foreground font-medium">
              {submessage}
            </p>
          )}
        </div>

        {showProgressBar && (
          <div className="mt-5 w-48 sm:w-56 h-1.5 bg-muted/80 border border-border/60 rounded-full overflow-hidden relative shadow-inner">
            <div className="h-full w-20 bg-gradient-to-r from-transparent via-primary to-transparent animate-simmer-slide rounded-full motion-reduce:hidden" />
          </div>
        )}
      </div>
    );
  }

  // 4. Variante Fullscreen / ViewFallback (Por defecto, pantalla completa o vista de módulo)
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'w-full min-w-0 flex-1 min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 sm:p-10 text-center animate-in fade-in duration-300',
        className
      )}
    >
      <span className="sr-only">Cargando aplicación gastronómica PosCocina...</span>

      {/* Ilustración Culinaria Central */}
      <div className="relative mb-6">
        {renderIcon()}
      </div>

      {/* Tipografía Gastronómica */}
      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight transition-all duration-300">
          {activeMessage}
        </h2>
        {submessage && (
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {submessage}
          </p>
        )}
      </div>

      {/* Barra de Fuego / Cocción Deslizante (Simmer Bar) */}
      {showProgressBar && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="w-56 sm:w-64 h-1.5 bg-muted/90 dark:bg-muted/40 border border-border/70 rounded-full overflow-hidden relative shadow-inner">
            <div className="h-full w-24 bg-gradient-to-r from-transparent via-primary to-transparent animate-simmer-slide rounded-full motion-reduce:hidden" />
          </div>
          <span className="text-[10px] text-muted-foreground/80 tracking-wide font-medium flex items-center gap-1.5 pt-1">
            <Sparkles className="size-3 text-amber-500 inline-block" />
            <span>Optimizando experiencia de servicio</span>
          </span>
        </div>
      )}
    </div>
  );
};
