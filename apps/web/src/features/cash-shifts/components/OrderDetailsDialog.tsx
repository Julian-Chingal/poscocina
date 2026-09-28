import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ReceiptText,
  UtensilsCrossed,
  Clock,
  User,
  CreditCard,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { PendingBill } from '../types/cash-shifts.types';

interface Props {
  bill: PendingBill | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout?: (bill: PendingBill) => void;
}

export const OrderDetailsDialog: React.FC<Props> = ({
  bill,
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  if (!bill) return null;

  const orderTotal = parseFloat(bill.total || '0');
  const subtotal = parseFloat(bill.subtotal || '0');
  const taxTotal = parseFloat(bill.taxTotal || '0');
  const totalPaid = parseFloat(bill.totalPaid || '0');
  const pendingBalance =
    bill.pendingBalance !== undefined
      ? parseFloat(bill.pendingBalance)
      : Math.max(0, orderTotal - totalPaid);

  const hasPriorPayments = totalPaid > 0.009;
  const destinationLabel = bill.table
    ? bill.table.label
    : bill.guestName
    ? `Para Llevar (${bill.guestName})`
    : 'Para Llevar';

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const getKitchenStatusBadge = (status?: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/40 text-[10px]">Listo</Badge>;
      case 'in_preparation':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/40 text-[10px]">En Cocina</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/40 text-[10px]">Entregado</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">En Cola</Badge>;
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/40 text-[10px]">Pagado</Badge>;
      case 'partially_paid':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/40 text-[10px]">Abono Parcial</Badge>;
      default:
        return <Badge variant="outline" className="text-rose-500 border-rose-500/30 text-[10px]">Sin Pagar</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="2xl" onClose={onClose} className="max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border bg-muted/20">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ReceiptText className="w-5 h-5 text-primary" />
                <DialogTitle className="text-xl font-black">
                  Detalle de Cuenta: {destinationLabel}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-1.5">
                {getKitchenStatusBadge(bill.kitchenStatus)}
                {getPaymentStatusBadge(bill.paymentStatus)}
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground flex flex-wrap gap-4 pt-1">
              <span className="flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                Orden #{bill.orderNumber || bill.id.slice(0, 6)}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Atendido por: {bill.waiter?.name || 'Mesero'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(bill.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Consumos / Ítems */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
                  Consumos Registrados ({bill.items?.length || 0})
                </h4>
              </div>

              <div className="border border-border rounded-xl divide-y divide-border overflow-hidden bg-card">
                {(!bill.items || bill.items.length === 0) ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No se registran productos en esta orden.
                  </div>
                ) : (
                  bill.items.map((item) => {
                    const unitPrice = parseFloat(item.unitPrice || '0');
                    let itemTotal = unitPrice * item.quantity;
                    if (item.modifiers && item.modifiers.length > 0) {
                      for (const mod of item.modifiers) {
                        itemTotal += parseFloat(mod.priceDelta || '0') * item.quantity;
                      }
                    }

                    return (
                      <div key={item.id} className="p-3 text-xs flex flex-col gap-1 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <span className="font-extrabold text-foreground px-1.5 py-0.5 rounded bg-muted border border-border text-[11px] font-mono">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="font-bold text-foreground">
                                {item.productName || item.product?.name || 'Producto'}
                              </span>
                              {(item.course || item.seatNumber) && (
                                <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                                  {item.course ? `[Tiempo ${item.course}]` : ''} {item.seatNumber ? `[Puesto ${item.seatNumber}]` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-foreground">
                            {formatCurrency(itemTotal)}
                          </span>
                        </div>

                        {/* Modificadores */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="pl-8 flex flex-wrap gap-1 mt-0.5">
                            {item.modifiers.map((m, idx) => {
                              const delta = parseFloat(m.priceDelta || '0');
                              return (
                                <span
                                  key={idx}
                                  className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border"
                                >
                                  +{m.modifier?.name || 'Modificador'} {delta > 0 && `(${formatCurrency(delta)})`}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Notas del ítem */}
                        {item.notes && (
                          <p className="pl-8 text-[11px] text-amber-500/90 italic">
                            Nota: &quot;{item.notes}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Historial de Pagos / Recibos Emitidos */}
            {hasPriorPayments && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                  Historial de Recibos y Abonos Previos
                </h4>

                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden bg-emerald-500/5 border-emerald-500/20">
                  {bill.receipts && bill.receipts.length > 0 ? (
                    bill.receipts.map((rcpt) => (
                      <div key={rcpt.id} className="p-3 text-xs flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              Recibo #{rcpt.receiptNumber}
                            </span>
                            {rcpt.issuedAt && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {new Date(rcpt.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {rcpt.payments && rcpt.payments.length > 0 && (
                            <div className="text-[10px] text-muted-foreground flex gap-2">
                              {rcpt.payments.map((p, pIdx) => (
                                <span key={pIdx}>
                                  {p.method === 'cash' ? 'Efectivo' : p.method === 'card_credit' ? 'Tarjeta' : 'Transf.'}: {formatCurrency(Number(p.amount))}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(parseFloat(rcpt.total))}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs flex justify-between items-center">
                      <span className="text-muted-foreground">Abonos registrados en el sistema</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desglose de Totales */}
            <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal Consumos:</span>
                <span className="font-mono text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Impuestos:</span>
                <span className="font-mono text-foreground">{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border">
                <span>Total Consumido:</span>
                <span className="font-mono">{formatCurrency(orderTotal)}</span>
              </div>

              {hasPriorPayments && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>(-) Total Ya Abonado:</span>
                  <span className="font-mono">-{formatCurrency(totalPaid)}</span>
                </div>
              )}

              <Separator className="my-1.5" />

              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-foreground uppercase tracking-wide">
                  {hasPriorPayments ? 'Saldo Pendiente a Cobrar:' : 'Total a Pagar:'}
                </span>
                <span className="font-mono text-lg text-primary">
                  {formatCurrency(pendingBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between">
          <Button variant="ghost" type="button" onClick={onClose} className="cursor-pointer">
            Cerrar
          </Button>

          {onProceedToCheckout && pendingBalance > 0 && (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onProceedToCheckout(bill);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Receipt className="w-4 h-4" />
              <span>Cobrar Saldo ({formatCurrency(pendingBalance)})</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
