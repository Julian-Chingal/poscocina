import React, { useState, useEffect } from 'react';
import { ChefHat, Flame, AlertCircle, RotateCw, WifiOff, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KdsHeaderProps {
  activeCount: number;
  cookingCount?: number;
  delayedCount?: number;
  isConnected?: boolean;
  isSyncing?: boolean;
  onRefresh?: () => void;
}

export const KdsHeader: React.FC<KdsHeaderProps> = ({
  activeCount,
  cookingCount = 0,
  delayedCount = 0,
  isConnected = true,
  isSyncing = false,
  onRefresh,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );

  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border/70 pb-4">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 text-primary p-2.5 rounded-2xl border border-primary/20 shrink-0">
          <ChefHat className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              KDS — Pantalla de Producción
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                  : 'bg-destructive/10 text-destructive border-destructive/25 animate-pulse'
              }`}
            >
              {isConnected ? (
                <>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>En Vivo</span>
                </>
              ) : (
                <>
                  <WifiOff className="size-3 shrink-0" />
                  <span>Reconectando...</span>
                </>
              )}
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            Pase de comandas por estación y control de tiempos en tiempo real (FIFO)
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
        {/* Quick KPI pills */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border/80 px-3 py-1.5 rounded-xl">
            <span className="text-muted-foreground">Comandas:</span>
            <span className="font-bold text-foreground font-mono">{activeCount}</span>
          </div>

          {cookingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl text-amber-700 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{cookingCount} en fuego</span>
            </div>
          )}

          {delayedCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-xl text-rose-700 dark:text-rose-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{delayedCount} demoradas</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="text-xs h-9 px-3 rounded-xl gap-1.5 font-semibold cursor-pointer border-border/80 text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Ventana' : 'Pantalla Completa'}</span>
          </Button>

          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isSyncing}
              className="text-xs h-9 px-3 rounded-xl gap-1.5 font-semibold cursor-pointer border-border/80 text-muted-foreground hover:text-foreground"
            >
              <RotateCw className={`size-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Sincronizando' : 'Actualizar'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

