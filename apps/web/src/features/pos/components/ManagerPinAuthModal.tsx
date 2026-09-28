import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Delete, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';
import { posApi } from '../api/pos.api';
import { toast } from '@/components/ui/sonner';

interface ManagerPinAuthModalProps {
  isOpen: boolean;
  item: any | null;
  venueId: string;
  onClose: () => void;
  onSuccess: (authorizedBy: { managerId: string; managerName: string; reason: string }) => void;
}

const COMMON_REASONS = [
  'Error de digitación',
  'Cliente cambió de orden',
  'Demora en cocina',
  'Problema de calidad / Merma',
];

export const ManagerPinAuthModal: React.FC<ManagerPinAuthModalProps> = ({
  isOpen,
  item,
  venueId,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setSelectedReason(COMMON_REASONS[0]);
      setCustomReason('');
      setErrorMessage(null);
      setIsVerifying(false);
    }
  }, [isOpen]);

  if (!item) return null;

  const isAdvanced = ['in_preparation', 'ready', 'delivered'].includes(item.status);
  const effectiveReason = customReason.trim() ? customReason.trim() : selectedReason;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setErrorMessage(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const handleAuthorize = async () => {
    if (pin.length < 4) {
      setErrorMessage('El PIN debe tener al menos 4 dígitos');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result = await posApi.managerOverride({
        venueId,
        managerPin: pin,
        action: 'order_item:delete',
        reason: effectiveReason,
      });

      toast.success(`Autorizado por: ${result.managerName}`);
      onSuccess({
        managerId: result.managerId,
        managerName: result.managerName,
        reason: effectiveReason,
      });
      onClose();
    } catch (err: any) {
      const msg =
        err.statusCode === 401 || err.response?.status === 401
          ? 'PIN inválido o permisos insuficientes (Se requiere Gerente o Administrador)'
          : err.message || 'Error al validar autorización';
      setErrorMessage(msg);
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isVerifying && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose} className="p-0 gap-0 overflow-hidden sm:max-w-md">
        {/* Header */}
        <div className="p-5 pb-4 bg-muted/30 border-b border-border">
          <DialogHeader className="space-y-1">
            <div className="flex items-center space-x-2 text-destructive">
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold">
                Autorización de Anulación
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Se requiere el PIN de un <strong>Gerente</strong> o <strong>Administrador</strong> para retirar este producto de la comanda.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Item Summary */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <div className="font-extrabold text-foreground truncate">
                {item.quantity}x {item.product?.name || 'Producto'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Estado cocina:{' '}
                <span className="font-semibold uppercase text-foreground">
                  {item.status}
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-bold shrink-0 ${
                isAdvanced
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {isAdvanced ? 'En Marcha' : 'Pendiente'}
            </Badge>
          </div>

          {/* Warning for Advanced Status */}
          {isAdvanced && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Atención:</strong> Este ítem ya fue enviado a cocina. Anularlo puede implicar merma o desperdicio de preparación.
              </span>
            </div>
          )}

          {/* Quick Reason Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Motivo de Anulación:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {COMMON_REASONS.map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant={selectedReason === r && !customReason ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedReason(r);
                    setCustomReason('');
                  }}
                  className={`text-[11px] h-8 justify-start truncate cursor-pointer transition-all ${
                    selectedReason === r && !customReason
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r}
                </Button>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Otro motivo específico..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="h-8 text-xs font-sans mt-1"
            />
          </div>

          {/* PIN Input & Visualizer */}
          <div className="space-y-2 pt-1 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-primary" />
                PIN de Gerente / Administrador:
              </label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {pin.length}/6 dígitos
              </span>
            </div>

            {/* Display Dots */}
            <div className="flex items-center justify-center gap-2 py-2 bg-muted/30 rounded-xl border border-border">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`size-3 rounded-full border transition-all ${
                    idx < pin.length
                      ? 'bg-primary border-primary scale-110 shadow-xs'
                      : 'bg-muted border-border/80'
                  }`}
                />
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-[11px] text-center font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Touch Numpad */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleKeyPress(n.toString())}
                  disabled={isVerifying}
                  className="h-10 text-sm font-bold font-mono bg-card hover:bg-muted active:scale-95 transition-all cursor-pointer border-border"
                >
                  {n}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isVerifying || pin.length === 0}
                className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                C
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleKeyPress('0')}
                disabled={isVerifying}
                className="h-10 text-sm font-bold font-mono bg-card hover:bg-muted active:scale-95 transition-all cursor-pointer border-border"
              >
                0
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackspace}
                disabled={isVerifying || pin.length === 0}
                className="h-10 text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center"
              >
                <Delete className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between">
          <Button
            variant="ghost"
            type="button"
            disabled={isVerifying}
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={pin.length < 4 || isVerifying}
            onClick={handleAuthorize}
            className="text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer flex items-center space-x-1.5 shadow-md"
          >
            {isVerifying ? (
              <span>Validando...</span>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>Autorizar Anulación</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
