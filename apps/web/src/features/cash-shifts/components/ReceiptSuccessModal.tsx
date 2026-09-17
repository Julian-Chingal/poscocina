import React from 'react';
import { CheckCircle2, Printer } from 'lucide-react';
import { ReceiptData } from '../types/cash-shifts.types';
import { cashShiftsApi } from '../api/cash-shifts.api';

interface Props {
  receipt: ReceiptData;
  onDismiss: () => void;
}

export const ReceiptSuccessModal: React.FC<Props> = ({ receipt, onDismiss }) => {
  const handleReprint = () => {
    cashShiftsApi.printReceipt(receipt.id).catch(() => {});
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white">Factura Emitida</h3>
          <p className="text-xs text-slate-400 mt-1">
            Comprobante #{receipt.receiptNumber}
          </p>
        </div>

        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs space-y-1.5 text-left">
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
          <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-700">
            <span>Total Pagado:</span>
            <span className="text-emerald-400 font-mono">
              ${parseFloat(receipt.total || '0').toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleReprint}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Reimprimir Comprobante</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-orange-600/20"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
