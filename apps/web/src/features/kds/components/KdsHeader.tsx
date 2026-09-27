import React from 'react';
import { ChefHat, UtensilsCrossed, RotateCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KdsHeaderProps {
  activeCount: number;
  isConnected?: boolean;
  isSyncing?: boolean;
  onRefresh?: () => void;
}

export const KdsHeader: React.FC<KdsHeaderProps> = ({
  activeCount,
  isConnected = true,
  isSyncing = false,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/15 p-2.5 rounded-2xl text-primary shadow-xs">
          <ChefHat className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">KDS — Pantalla de Producción</h2>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isConnected
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-destructive/15 text-destructive border-destructive/30 animate-pulse'
              }`}
            >
              {isConnected ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />
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
          <p className="text-muted-foreground text-xs">
            Pase de comandas y control de tiempos por estación en tiempo real (FIFO).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isSyncing}
            className="text-xs h-9 rounded-xl gap-1.5 font-bold cursor-pointer border-border"
          >
            <RotateCw className={`size-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span>{isSyncing ? 'Sincronizando' : 'Actualizar'}</span>
          </Button>
        )}

        <div className="flex items-center space-x-2 text-xs font-semibold bg-muted/40 px-3.5 py-2 rounded-xl border border-border text-foreground">
          <UtensilsCrossed className="w-4 h-4 text-primary" />
          <span>Comandas:</span>
          <span className="text-primary font-mono font-bold ml-1">{activeCount}</span>
        </div>
      </div>
    </div>
  );
};
