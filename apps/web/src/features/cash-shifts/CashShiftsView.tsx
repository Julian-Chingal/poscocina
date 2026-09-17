import React from 'react';
import { useCashShift } from './hooks/useCashShift';
import { usePendingBills } from './hooks/usePendingBills';
import { CashShiftsHeader } from './components/CashShiftsHeader';
import { OpenShiftCard } from './components/OpenShiftCard';
import { ShiftStatusBanner } from './components/ShiftStatusBanner';
import { SalesBreakdownGrid } from './components/SalesBreakdownGrid';
import { PendingBillsGrid } from './components/PendingBillsGrid';
import { CloseShiftModal } from './components/CloseShiftModal';
import { ClosedShiftReport } from './components/ClosedShiftReport';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptSuccessModal } from './components/ReceiptSuccessModal';

export const CashShiftsView: React.FC<{ venueId: string }> = ({ venueId }) => {
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
    refreshShift,
  } = useCashShift(venueId);

  const {
    pendingBills,
    selectedBill,
    processingPayment,
    receiptSuccess,
    setSelectedBill,
    clearReceiptSuccess,
    confirmPayment,
    refreshPendingBills,
  } = usePendingBills(venueId, refreshShift);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10">
      <CashShiftsHeader
        isShiftOpen={shiftData.open}
        onOpenCloseModal={openCloseModal}
      />

      {!shiftData.open && !closeReport && (
        <OpenShiftCard onOpenShift={openShift} />
      )}

      {shiftData.open && shiftData.shift && (
        <div className="space-y-6">
          <ShiftStatusBanner
            shift={shiftData.shift}
            onPrintSummary={printSummary}
          />
          <SalesBreakdownGrid salesByMethod={shiftData.salesByMethod} />
          <PendingBillsGrid
            pendingBills={pendingBills}
            onSelectBill={setSelectedBill}
            onRefresh={refreshPendingBills}
          />
        </div>
      )}

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

      {selectedBill && (
        <CheckoutModal
          bill={selectedBill}
          isProcessing={processingPayment}
          onClose={() => setSelectedBill(null)}
          onConfirmPayment={confirmPayment}
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
