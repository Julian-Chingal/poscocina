import React from 'react';
import { CheckCircle2, Printer } from 'lucide-react';
import { ReceiptData } from '../types/cash-shifts.types';
import { cashShiftsApi } from '../api/cash-shifts.api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
  receipt: ReceiptData | null;
  onDismiss: () => void;
}

export const ReceiptSuccessModal: React.FC<Props> = ({ receipt, onDismiss }) => {
  const handleReprint = () => {
    if (receipt?.id) {
      cashShiftsApi.printReceipt(receipt.id).catch(() => {});
    }
  };

  return (
    <Dialog open={Boolean(receipt)} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent maxWidth="sm" onClose={onDismiss} className="text-center sm:text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <DialogHeader className="text-center sm:text-center pr-0">
          <DialogTitle className="text-xl font-black">Factura Emitida</DialogTitle>
          <DialogDescription className="text-xs">
            Comprobante #{receipt?.receiptNumber}
          </DialogDescription>
        </DialogHeader>

        {receipt && (
          <Card className="p-4 bg-muted/40 rounded-2xl border-border text-xs space-y-1.5 text-left">
            <div className="flex justify-between text-muted-foreground">
              <span>Fecha:</span>
              <span className="text-foreground">
                {new Date(receipt.issuedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Mesa:</span>
              <span className="text-foreground">
                {receipt.metadata?.tableLabel || 'Para Llevar'}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Medio de Pago:</span>
              <span className="text-foreground uppercase font-semibold">
                {receipt.payments?.[0]?.method || 'Efectivo'}
              </span>
            </div>
            <Separator className="my-1.5" />
            <div className="flex justify-between text-sm font-extrabold text-foreground">
              <span>Total Pagado:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                ${parseFloat(receipt.total || '0').toLocaleString()}
              </span>
            </div>
          </Card>
        )}

        <div className="space-y-2 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleReprint}
            className="w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Reimprimir Comprobante</span>
          </Button>

          <Button
            type="button"
            onClick={onDismiss}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-md"
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptSuccessModal;
