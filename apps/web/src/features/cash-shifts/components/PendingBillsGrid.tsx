import React from 'react';
import { ReceiptText, CheckCircle2, Receipt } from 'lucide-react';
import { PendingBill } from '../types/cash-shifts.types';

interface Props {
  pendingBills: PendingBill[];
  onSelectBill: (bill: PendingBill) => void;
  onRefresh: () => void;
}

export const PendingBillsGrid: React.FC<Props> = ({
  pendingBills,
  onSelectBill,
  onRefresh,
}) => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <ReceiptText className="w-5 h-5 text-orange-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Cuentas Pendientes de Cobro ({pendingBills.length})
        </h4>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
      >
        Actualizar
      </button>
    </div>

    {pendingBills.length === 0 ? (
      <div className="p-8 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
        <span>No hay comandas activas pendientes de cobro en este momento.</span>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingBills.map((bill) => {
          const isCheckRequested = bill.status === 'check_requested';
          const billTotalNum = parseFloat(bill.total || '0');

          return (
            <div
              key={bill.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isCheckRequested
                  ? 'bg-amber-950/20 border-amber-500/70 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white">
                    {bill.table ? bill.table.label : 'Para Llevar'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isCheckRequested
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCheckRequested ? 'Cuenta Pedida' : bill.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Orden #{bill.orderNumber || bill.id.slice(0, 6)}</span>
                  <span>{bill.waiter?.name || 'Mesero'}</span>
                </div>

                {bill.items && bill.items.length > 0 && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80 space-y-1">
                    {bill.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between truncate">
                        <span>
                          {item.quantity}x {item.productName || item.product?.name || 'Ítem'}
                        </span>
                        <span className="font-mono text-slate-300">
                          ${(parseFloat(item.unitPrice || '0') * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {bill.items.length > 3 && (
                      <p className="text-[10px] text-slate-500 italic">
                        +{bill.items.length - 3} ítem(s) más...
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total:</span>
                  <span className="text-base font-black text-orange-400 font-mono">
                    ${billTotalNum.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onSelectBill(bill)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isCheckRequested
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Cobrar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
