import React, { useState } from 'react';
import { useCashShift } from './hooks/useCashShift';
import { usePendingBills } from './hooks/usePendingBills';
import { CashShiftsHeader } from './components/CashShiftsHeader';
import { OpenShiftCard } from './components/OpenShiftCard';
import { ShiftKpiStrip } from './components/ShiftKpiStrip';
import { SalesBreakdownGrid } from './components/SalesBreakdownGrid';
import { PendingBillsGrid } from './components/PendingBillsGrid';
import { CloseShiftModal } from './components/CloseShiftModal';
import { ClosedShiftReport } from './components/ClosedShiftReport';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptSuccessModal } from './components/ReceiptSuccessModal';
import { OrderDetailsDialog } from './components/OrderDetailsDialog';
import { ShieldCheck, CheckSquare, Banknote, Printer, CreditCard } from 'lucide-react';
import { PendingBill } from './types/cash-shifts.types';

export const CashShiftsView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const [inspectingBill, setInspectingBill] = useState<PendingBill | null>(null);

  const {
    shiftData,
    loading,
    showCloseModal,
    closeReport,
    openCloseModal,
    closeCloseModal,
    clearCloseReport,
    openShift,
    closeShift,
    printSummary,
    openDrawer,
    refreshShift,
  } = useCashShift(venueId);

  const {
    pendingBills,
    selectedBill,
    processingPayment,
    receiptSuccess,
    setSelectedBill,
    clearReceiptSuccess,
    refreshPendingBills,
  } = usePendingBills(venueId, refreshShift);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-6xl mx-auto p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      <CashShiftsHeader
        isShiftOpen={shiftData.open}
        onOpenCloseModal={openCloseModal}
        onOpenDrawer={openDrawer}
        onPrintSummary={printSummary}
      />

      {!shiftData.open && !closeReport && (
        <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <OpenShiftCard onOpenShift={openShift} />
          </div>

          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {/* Protocolo de Arqueo Ciego */}
            <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="size-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Arqueo Ciego Certificado
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                El sistema protege la integridad de tu operación manteniendo los saldos teóricos en efectivo ocultos para el cajero durante el turno y al momento del arqueo de cierre.
              </p>
              <div className="space-y-2 text-xs text-foreground/90 pt-1">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Conteo físico de billetes y monedas sin sesgos contables.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Detección automática de descuadres (sobrantes/faltantes).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>Emisión automática de comprobante Z de auditoría al cerrar.</span>
                </div>
              </div>
            </div>

            {/* Checklist de Apertura de Estación */}
            <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="size-4 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Checklist de Estación
                </h3>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/60">
                  <Banknote className="size-3.5 text-primary shrink-0" />
                  <span>Contar base física y colocar en gaveta.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/60">
                  <Printer className="size-3.5 text-primary shrink-0" />
                  <span>Comprobar papel térmico en impresora.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/60">
                  <CreditCard className="size-3.5 text-primary shrink-0" />
                  <span>Verificar batería y señal de datáfonos.</span>
                </div>
              </div>
            </div>

            {/* Atajos Rápidos */}
            <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-3xl p-5 shadow-xs space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Navegación Rápida
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => { window.location.hash = '#/salon'; }}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-colors cursor-pointer text-left"
                >
                  <span className="font-sans text-[11px] text-foreground font-semibold">Salón / Mesas</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/80 text-[10px] font-bold">F1</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => { window.location.hash = '#/pos'; }}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-colors cursor-pointer text-left"
                >
                  <span className="font-sans text-[11px] text-foreground font-semibold">POS Ventas</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/80 text-[10px] font-bold">F2</kbd>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shiftData.open && shiftData.shift && (() => {
        const openingAmount = parseFloat(shiftData.shift.openingAmount || '0');
        const cashSales = parseFloat(
          shiftData.salesByMethod?.find((m) => m.method === 'cash')?.total || '0'
        );
        const cardSales = (
          shiftData.salesByMethod?.filter((m) => ['card_credit', 'card_debit'].includes(m.method)) || []
        ).reduce((sum, m) => sum + parseFloat(m.total || '0'), 0);
        const transferSales = parseFloat(
          shiftData.salesByMethod?.find((m) => m.method === 'transfer')?.total || '0'
        );
        const totalSales = cashSales + cardSales + transferSales;
        const pendingBillsCount = pendingBills.length;
        const pendingBillsTotal = pendingBills.reduce((acc, b) => {
          const bTotal = parseFloat(b.total || '0');
          const bPaid = parseFloat(b.totalPaid || '0');
          return (
            acc +
            (b.pendingBalance !== undefined
              ? parseFloat(b.pendingBalance)
              : Math.max(0, bTotal - bPaid))
          );
        }, 0);

        return (
          <div className="w-full min-w-0 space-y-5 sm:space-y-6">
            <ShiftKpiStrip
              openingAmount={openingAmount}
              openedAt={shiftData.shift.openedAt}
              cashierName={shiftData.shift.openedByName}
              cashSales={cashSales}
              cardSales={cardSales}
              transferSales={transferSales}
              totalSales={totalSales}
              pendingBillsCount={pendingBillsCount}
              pendingBillsTotal={pendingBillsTotal}
            />

            <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              <div className="lg:col-span-7 xl:col-span-8">
                <PendingBillsGrid
                  pendingBills={pendingBills}
                  onSelectBill={setSelectedBill}
                  onViewDetails={setInspectingBill}
                  onRefresh={refreshPendingBills}
                />
              </div>

              <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                <SalesBreakdownGrid
                  salesByMethod={shiftData.salesByMethod}
                  onOpenDrawer={openDrawer}
                  onPrintSummary={printSummary}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {closeReport && (
        <ClosedShiftReport
          report={closeReport}
          onDismiss={clearCloseReport}
        />
      )}

      <CloseShiftModal
        isOpen={showCloseModal}
        onClose={closeCloseModal}
        onConfirmClose={closeShift}
      />

      <OrderDetailsDialog
        bill={inspectingBill}
        isOpen={Boolean(inspectingBill)}
        onClose={() => setInspectingBill(null)}
        onProceedToCheckout={(bill) => {
          setInspectingBill(null);
          setSelectedBill(bill);
        }}
      />

      {selectedBill && (
        <CheckoutModal
          bill={selectedBill}
          venueId={venueId}
          isProcessing={processingPayment}
          onClose={() => setSelectedBill(null)}
          onSuccess={() => {
            setSelectedBill(null);
            refreshPendingBills();
            refreshShift();
          }}
        />
      )}

      {receiptSuccess && (
        <ReceiptSuccessModal
          receipt={receiptSuccess}
          onDismiss={clearReceiptSuccess}
        />
      )}
    </div>
  );
};

export default CashShiftsView;
