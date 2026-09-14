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
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

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

export const CashShiftsView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const { user } = useAuthStore();
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

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Fondo Inicial de Caja:</span>
              <span className="text-xl font-black text-white font-mono">
                ${parseFloat(shiftData.shift.openingAmount).toLocaleString()}
              </span>
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
    </div>
  );
};
