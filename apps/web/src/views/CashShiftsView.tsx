import React, { useEffect, useState } from 'react';
import {
  ReceiptText,
  DollarSign,
  CreditCard,
  Send,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  Receipt,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';
import { io } from 'socket.io-client';

interface ActiveShiftInfo {
  open: boolean;
  shift?: {
    id: string;
    openedAt: string;
    openingAmount: string;
    notes?: string;
  };
  salesByMethod?: Array<{
    method: string;
    total: string;
    tips: string;
  }>;
}

interface PendingBill {
  id: string;
  orderNumber?: number;
  table?: { id: string; label: string } | null;
  waiter?: { id: string; name: string } | null;
  status: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  openedAt: string;
  items?: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    productName?: string;
    product?: { name: string };
    notes?: string;
  }>;
}

export const CashShiftsView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const { user } = useAuthStore();
  const { settings } = useBrandingStore();
  const [shiftData, setShiftData] = useState<ActiveShiftInfo>({ open: false });
  const [loading, setLoading] = useState(true);

  // Open Shift Form
  const [openingAmount, setOpeningAmount] = useState('100000');
  const [openingNotes, setOpeningNotes] = useState('');

  // Close Shift Modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingCashCount, setClosingCashCount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [closeReport, setCloseReport] = useState<any>(null);

  // Pending Bills & Checkout Modal
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<PendingBill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_credit' | 'transfer'>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [cardReference, setCardReference] = useState<string>('');
  const [tipPct, setTipPct] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<any>(null);

  const taxRate = typeof settings.taxRate === 'number' ? settings.taxRate : 0.08;
  const taxLabel = `${settings.taxRate === 0.19 ? 'IVA' : 'INC'} (${Math.round(taxRate * 100)}%):`;

  const billSubtotal = selectedBill ? parseFloat(selectedBill.subtotal || '0') : 0;
  const billTax = selectedBill ? parseFloat(selectedBill.taxTotal || '0') : 0;
  const tipAmount = (billSubtotal * tipPct) / 100;
  const billTotal = billSubtotal + billTax + tipAmount;

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - billTotal);

  const fetchPendingBills = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/venues/${venueId}/pending-bills`);
      if (res.ok) {
        const data = await res.json();
        setPendingBills(data);
      }
    } catch (err) {
      console.error('Error fetching pending bills:', err);
    }
  };

  const fetchShift = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/cash-shifts/current/${venueId}`);
      if (res.ok) {
        const data = await res.json();
        setShiftData(data);
      }
    } catch (err) {
      console.error('Error fetching cash shift:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
    fetchPendingBills();

    const socket = io();
    const handleRefresh = () => {
      fetchShift();
      fetchPendingBills();
    };

    socket.on('order:created', handleRefresh);
    socket.on('order:items_appended', handleRefresh);
    socket.on('order:status_updated', handleRefresh);
    socket.on('table:status_changed', handleRefresh);

    return () => {
      socket.off('order:created', handleRefresh);
      socket.off('order:items_appended', handleRefresh);
      socket.off('order:status_updated', handleRefresh);
      socket.off('table:status_changed', handleRefresh);
      socket.disconnect();
    };
  }, [venueId]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cash-shifts/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          cashierId: user?.id,
          openingAmount: parseFloat(openingAmount) || 0,
          notes: openingNotes,
        }),
      });

      if (res.ok) {
        fetchShift();
      }
    } catch (err) {
      console.error('Error opening shift:', err);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftData.shift?.id) return;

    try {
      const res = await fetch(`/api/cash-shifts/${shiftData.shift.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingAmount: parseFloat(closingCashCount) || 0,
          notes: closingNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCloseReport(data);
        fetchShift();
      }
    } catch (err) {
      console.error('Error closing shift:', err);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedBill) return;
    setProcessingPayment(true);

    const billSubtotal = parseFloat(selectedBill.subtotal || '0');
    const billTax = parseFloat(selectedBill.taxTotal || '0');
    const tipAmount = (billSubtotal * tipPct) / 100;
    const finalTotal = billSubtotal + billTax + tipAmount;

    try {
      const paymentPayload = {
        orderId: selectedBill.id,
        payments: [
          {
            method: paymentMethod,
            amount: finalTotal,
            reference: cardReference || undefined,
            tipAmount,
          },
        ],
      };

      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setReceiptSuccess(data.receipt);
        setSelectedBill(null);
        setCashTendered('');
        setCardReference('');
        setTipPct(0);
        fetchShift();
        fetchPendingBills();

        // Print receipt
        fetch('/api/hardware/print-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptId: data.receipt.id }),
        }).catch(() => {});

        // Open drawer if cash
        if (paymentMethod === 'cash') {
          fetch('/api/hardware/open-drawer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ venueId }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400 animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Fase 2: Finanzas & Turnos</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Control de Caja y Arqueo de Turnos
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Apertura de turno, auditoría ciega y conciliación de medios de pago.
          </p>
        </div>

        {shiftData.open && (
          <button
            onClick={() => setShowCloseModal(true)}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
          >
            <Lock className="w-4 h-4" />
            <span>Cerrar Turno (Arqueo Ciego)</span>
          </button>
        )}
      </div>

      {/* State A: No open shift */}
      {!shiftData.open && !closeReport && (
        <div className="max-w-md mx-auto bg-slate-800/60 border border-slate-700/60 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
            <Unlock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Apertura de Turno de Caja</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Inicia el turno ingresando el fondo de caja inicial en efectivo (base de cambio).
          </p>

          <form onSubmit={handleOpenShift} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fondo Inicial en Efectivo:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  required
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Observaciones de Apertura:
              </label>
              <input
                type="text"
                placeholder="Ej. Billetes de baja denominación para cambio"
                value={openingNotes}
                onChange={(e) => setOpeningNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              Abrir Turno de Caja
            </button>
          </form>
        </div>
      )}

      {/* State B: Active open shift */}
      {shiftData.open && shiftData.shift && (
        <div className="space-y-6">
          {/* Shift Status Banner */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black text-white">Turno de Caja Activo</span>
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full uppercase">
                    Abierto
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Iniciado: {new Date(shiftData.shift.openedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={async () => {
                  if (!shiftData?.shift?.id) return;
                  try {
                    const res = await fetch('/api/hardware/print-shift-summary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ shiftId: shiftData.shift.id }),
                    });
                    if (res.ok) {
                      alert('Resumen térmico de turno enviado a la impresora');
                    } else {
                      const err = await res.json();
                      alert(err.message || 'Error al imprimir resumen');
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" />
                <span>Imprimir Resumen Z</span>
              </button>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Fondo Inicial de Caja:</span>
                <span className="text-xl font-black text-white font-mono">
                  ${parseFloat(shiftData.shift.openingAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Sales Breakdown by Payment Method */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Recaudación Acumulada en el Turno Actual:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cash Card */}
              {(() => {
                const cashData = shiftData.salesByMethod?.find((m) => m.method === 'cash');
                const cashTotal = parseFloat(cashData?.total || '0');
                return (
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Efectivo Recaudado</span>
                      <span className="text-lg font-bold text-white font-mono">
                        ${cashTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Cards */}
              {(() => {
                const cardData = shiftData.salesByMethod?.filter((m) =>
                  ['card_credit', 'card_debit'].includes(m.method)
                );
                const cardTotal = cardData?.reduce((sum, c) => sum + parseFloat(c.total), 0) || 0;
                return (
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Tarjetas (Datáfono)</span>
                      <span className="text-lg font-bold text-white font-mono">
                        ${cardTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Transfers */}
              {(() => {
                const transferData = shiftData.salesByMethod?.find((m) => m.method === 'transfer');
                const transferTotal = parseFloat(transferData?.total || '0');
                return (
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Transferencias</span>
                      <span className="text-lg font-bold text-white font-mono">
                        ${transferTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Cuentas Pendientes de Cobro */}
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
                onClick={fetchPendingBills}
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
                                <span>{item.quantity}x {item.productName || item.product?.name || 'Ítem'}</span>
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
                          onClick={() => setSelectedBill(bill)}
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
        </div>
      )}

      {/* State C: Just Closed Shift Report */}
      {closeReport && (
        <div className="max-w-xl mx-auto bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Arqueo de Turno Finalizado</h3>
            <p className="text-xs text-slate-400 mt-0.5">El turno de caja ha sido cerrado con éxito.</p>
          </div>

          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Efectivo Esperado (Fondo + Ventas):</span>
              <span className="font-mono text-white">${closeReport.expected?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Efectivo Físico Contado (Arqueo ciego):</span>
              <span className="font-mono text-white">${closeReport.actual?.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span>Diferencia de Caja:</span>
              <span
                className={`font-mono ${
                  closeReport.difference === 0
                    ? 'text-emerald-400'
                    : closeReport.difference > 0
                    ? 'text-cyan-400'
                    : 'text-rose-400'
                }`}
              >
                {closeReport.difference === 0
                  ? '$0 (Caja Cuadrada)'
                  : closeReport.difference > 0
                  ? `+$${closeReport.difference.toLocaleString()} (Sobrante)`
                  : `-$${Math.abs(closeReport.difference).toLocaleString()} (Faltante)`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCloseReport(null)}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Entendido / Continuar
          </button>
        </div>
      )}

      {/* Modal: Blind Count Close */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Auditoría de Cierre</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Arqueo Ciego de Caja</h3>
            <p className="text-xs text-slate-400 mb-5">
              Ingresa el total de dinero en efectivo físico contado en la gaveta. Por seguridad, el
              sistema no muestra el total recaudado hasta confirmar el conteo.
            </p>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Efectivo Físico Contado:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={closingCashCount}
                    onChange={(e) => setClosingCashCount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notas de Cierre:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Billetes desgastados o cambio exacto"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirmar y Cerrar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Checkout & Multi-payment from Cash Register */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedBill(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Caja & Facturación Directa</span>
            </div>
            <h3 className="text-xl font-black text-white">Cobro de Cuenta</h3>
            <p className="text-xs text-slate-400 mb-5">
              {selectedBill.table ? selectedBill.table.label : 'Para Llevar'} • Orden #{selectedBill.orderNumber || selectedBill.id.slice(0, 6)}
            </p>

            {/* Breakdown */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal alimentos y bebidas:</span>
                <span className="font-mono text-slate-200">${billSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{taxLabel}</span>
                <span className="font-mono text-slate-200">${billTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 items-center pt-1 border-t border-slate-700/60">
                <span className="flex items-center space-x-2">
                  <span>Propina Voluntaria:</span>
                  <div className="flex space-x-1">
                    {[0, 5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPct(pct)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          tipPct === pct
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </span>
                <span className="font-mono text-slate-200">${tipAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-700">
                <span>Total a Cobrar:</span>
                <span className="font-mono text-orange-400">${billTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Medio de Pago:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span className="text-xs font-bold">Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card_credit')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'card_credit'
                      ? 'bg-blue-950/60 border-blue-500 text-blue-400 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-400 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  <span className="text-xs font-bold">Transferencia</span>
                </button>
              </div>
            </div>

            {/* Cash details */}
            {paymentMethod === 'cash' && (
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 mb-5 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Efectivo Entregado por el Cliente:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={billTotal.toString()}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {[billTotal, Math.ceil(billTotal / 10000) * 10000, Math.ceil(billTotal / 50000) * 50000].map(
                    (val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashTendered(val.toString())}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-700 cursor-pointer"
                      >
                        ${val.toLocaleString()}
                      </button>
                    )
                  )}
                </div>

                {tenderedNum > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/60 text-xs">
                    <span className="text-slate-400">Cambio / Vueltas:</span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      ${changeDue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Electronic payment reference */}
            {paymentMethod !== 'cash' && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Número de Aprobación / Referencia:
                </label>
                <input
                  type="text"
                  placeholder="Ej. 987452 o Nequi M1234"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processingPayment || (paymentMethod === 'cash' && tenderedNum > 0 && tenderedNum < billTotal)}
                onClick={handleConfirmPayment}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-600/20 cursor-pointer flex items-center space-x-2 disabled:bg-slate-800 disabled:text-slate-600"
              >
                <Receipt className="w-4 h-4" />
                <span>{processingPayment ? 'Emitiendo...' : 'Confirmar y Facturar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Receipt Confirmation */}
      {receiptSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Factura Emitida</h3>
              <p className="text-xs text-slate-400 mt-1">Comprobante #{receiptSuccess.receiptNumber}</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs space-y-1.5 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Fecha:</span>
                <span className="text-slate-200">{new Date(receiptSuccess.issuedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mesa:</span>
                <span className="text-slate-200">
                  {receiptSuccess.metadata?.tableLabel || 'Para Llevar'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Medio de Pago:</span>
                <span className="text-slate-200 uppercase font-semibold">
                  {receiptSuccess.payments?.[0]?.method || 'Efectivo'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-700">
                <span>Total Pagado:</span>
                <span className="text-emerald-400 font-mono">
                  ${parseFloat(receiptSuccess.total).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  fetch('/api/hardware/print-receipt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ receiptId: receiptSuccess.id }),
                  }).catch(() => {});
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Reimprimir Comprobante</span>
              </button>

              <button
                onClick={() => setReceiptSuccess(null)}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-orange-600/20"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
