import React from 'react';
import { Plus, Printer } from 'lucide-react';
import { useHardwarePrinters } from '../hooks/useHardwarePrinters';
import { PrinterCard } from './PrinterCard';
import { PrinterModal } from './PrinterModal';
import { ReceiptPreviewCard } from './ReceiptPreviewCard';
import { ReceiptSettingsCard } from './ReceiptSettingsCard';
import { PaperWidth, TaxType } from '../types/settings.types';

interface Props {
  paperWidth: PaperWidth;
  autoPrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
  logoUrl: string;
  primaryColor: string;
  companyName: string;
  taxId: string;
  venueAddress: string;
  phone: string;
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  currency: string;
  onFieldChange: (field: any, val: any) => void;
}

export const PrintersTab: React.FC<Props> = ({
  paperWidth,
  autoPrintReceipt,
  receiptHeader,
  receiptFooter,
  logoUrl,
  primaryColor,
  companyName,
  taxId,
  venueAddress,
  phone,
  taxType,
  taxRate,
  defaultTipPct,
  currency,
  onFieldChange,
}) => {
  const {
    printers,
    isModalOpen,
    editingPrinter,
    testingId,
    testResult,
    openNewPrinter,
    openEditPrinter,
    closeModal,
    savePrinter,
    deletePrinter,
    testPrint,
  } = useHardwarePrinters();

  return (
    <div className="space-y-8">
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/60 gap-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Printer className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-white text-base">Dispositivos e Impresoras Térmicas de la Sede</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ruteo directo por red TCP (puerto 9100) para comandas en cocina/barra y recibos en caja.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewPrinter}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Impresora</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {printers.map((printer) => (
            <PrinterCard
              key={printer.id}
              printer={printer}
              isTesting={testingId === printer.id}
              testResult={testResult}
              onTest={testPrint}
              onEdit={openEditPrinter}
              onDelete={deletePrinter}
            />
          ))}
          {printers.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 text-xs border border-dashed border-slate-700 rounded-2xl">
              No hay impresoras térmicas configuradas para esta sede.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ReceiptSettingsCard
            paperWidth={paperWidth}
            autoPrintReceipt={autoPrintReceipt}
            receiptHeader={receiptHeader}
            receiptFooter={receiptFooter}
            onFieldChange={onFieldChange}
          />
        </div>

        <ReceiptPreviewCard
          paperWidth={paperWidth}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
          companyName={companyName}
          taxId={taxId}
          venueAddress={venueAddress}
          phone={phone}
          receiptHeader={receiptHeader}
          receiptFooter={receiptFooter}
          taxType={taxType}
          taxRate={taxRate}
          defaultTipPct={defaultTipPct}
          currency={currency}
        />
      </div>

      <PrinterModal
        isOpen={isModalOpen}
        editingPrinter={editingPrinter}
        onClose={closeModal}
        onSave={savePrinter}
      />
    </div>
  );
};

export default PrintersTab;
