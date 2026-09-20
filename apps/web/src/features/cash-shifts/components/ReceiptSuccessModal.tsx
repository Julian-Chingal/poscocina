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
          <Card className="p-4 bg-slate-800/80 rounded-2xl border-slate-700/60 text-xs space-y-1.5 text-left">
            <div className="flex justify-between text-slate-400">
              <span>Fecha:</span>
              <span className="text-slate-200">
                {new Date(receipt.issuedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mesa:</span>
              <span className="text-slate-200">
                {receipt.metadata?.tableLabel || 'Para Llevar'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Medio de Pago:</span>
              <span className="text-slate-200 uppercase font-semibold">
                {receipt.payments?.[0]?.method || 'Efectivo'}
              </span>
            </div>
            <Separator className="bg-slate-700 my-1.5" />
            <div className="flex justify-between text-sm font-extrabold text-white">
              <span>Total Pagado:</span>
              <span className="text-emerald-400 font-mono">
                ${parseFloat(receipt.total || '0').toLocaleString()}
              </span>
            </div>
          </Card>
        )}

        <div className="space-y-2 pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={handleReprint}
            className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Reimprimir Comprobante</span>
          </Button>

          <Button
            type="button"
            onClick={onDismiss}
            className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20"
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptSuccessModal;
