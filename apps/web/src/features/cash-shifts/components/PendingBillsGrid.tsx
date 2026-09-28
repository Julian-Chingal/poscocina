import React from 'react';
import { ReceiptText, CheckCircle2, Receipt, Eye } from 'lucide-react';
import { PendingBill } from '../types/cash-shifts.types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  pendingBills: PendingBill[];
  onSelectBill: (bill: PendingBill) => void;
  onViewDetails?: (bill: PendingBill) => void;
  onRefresh: () => void;
}

export const PendingBillsGrid: React.FC<Props> = ({
  pendingBills,
  onSelectBill,
  onViewDetails,
  onRefresh,
}) => (
  <Card className="w-full min-w-0 rounded-2xl shadow-sm">
    <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
      <div className="flex items-center space-x-2">
        <ReceiptText className="w-5 h-5 text-primary" />
        <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
          Cuentas Pendientes de Cobro ({pendingBills.length})
        </CardTitle>
      </div>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={onRefresh}
        className="h-8 text-xs px-2.5 py-1 shrink-0 cursor-pointer"
      >
        Actualizar
      </Button>
    </CardHeader>

    <CardContent className="p-6 pt-0 space-y-4">
      {pendingBills.length === 0 ? (
        <div className="p-8 bg-muted/40 rounded-xl border border-border text-center text-muted-foreground text-xs">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
          <span>No hay comandas activas pendientes de cobro en este momento.</span>
        </div>
      ) : (
        <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {pendingBills.map((bill) => {
            const isCheckRequested = bill.status === 'check_requested';
            const billTotalNum = parseFloat(bill.total || '0');
            const totalPaidNum = parseFloat(bill.totalPaid || '0');
            const pendingBalanceNum =
              bill.pendingBalance !== undefined
                ? parseFloat(bill.pendingBalance)
                : Math.max(0, billTotalNum - totalPaidNum);
            const hasPartialPayments = totalPaidNum > 0.009;

            const destinationLabel = bill.table
              ? bill.table.label
              : bill.guestName
              ? `Para Llevar (${bill.guestName})`
              : 'Para Llevar';

            return (
              <Card
                key={bill.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCheckRequested
                    ? 'bg-amber-500/10 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-card border-border hover:border-foreground/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-foreground truncate max-w-[65%]" title={destinationLabel}>
                      {destinationLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasPartialPayments && (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold">
                          Abonado
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isCheckRequested
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 animate-pulse'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {isCheckRequested ? 'Cuenta Pedida' : bill.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Orden #{bill.orderNumber || bill.id.slice(0, 6)}</span>
                    <span>{bill.waiter?.name || 'Mesero'}</span>
                  </div>

                  {bill.items && bill.items.length > 0 && (
                    <div className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border space-y-1">
                      {bill.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between truncate">
                          <span>
                            {item.quantity}x {item.productName || item.product?.name || 'Ítem'}
                          </span>
                          <span className="font-mono text-foreground">
                            ${(parseFloat(item.unitPrice || '0') * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {bill.items.length > 3 && (
                        <p className="text-[10px] text-muted-foreground/80 italic">
                          +{bill.items.length - 3} ítem(s) más...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div>
                    {hasPartialPayments ? (
                      <>
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 block uppercase font-bold">
                          Saldo Pendiente:
                        </span>
                        <span className="text-base font-black text-primary font-mono leading-none">
                          ${pendingBalanceNum.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          Tot: ${billTotalNum.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold">Total:</span>
                        <span className="text-base font-black text-primary font-mono">
                          ${billTotalNum.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => onViewDetails(bill)}
                        title="Ver Detalle de Cuenta"
                        className="px-2.5 py-2 h-auto rounded-xl text-xs font-semibold cursor-pointer border-border hover:bg-muted text-foreground"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline ml-1">Detalle</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      type="button"
                      onClick={() => onSelectBill(bill)}
                      className={`px-3.5 py-2 h-auto rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isCheckRequested
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Cobrar</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);
