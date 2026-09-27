import React from 'react';
import { Plus, Printer, Store } from 'lucide-react';
import { useHardwarePrinters } from '../hooks/useHardwarePrinters';
import { PrinterCard } from './PrinterCard';
import { PrinterModal } from './PrinterModal';
import { ReceiptPreviewCard } from './ReceiptPreviewCard';
import { ReceiptSettingsCard } from './ReceiptSettingsCard';
import { PaperWidth, TaxType, PrinterDevice } from '../types/settings.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  paperWidth: PaperWidth;
  autoPrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
  logoUrl: string;
  primaryColor: string;
  companyName: string;
  legalName?: string;
  taxId: string;
  venueAddress: string;
  phone: string;
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  currency: string;
  showLogoOnReceipt?: boolean;
  showQrOnReceipt?: boolean;
  showWaiterOnReceipt?: boolean;
  showTaxBreakdown?: boolean;
  showResolutionOnReceipt?: boolean;
  isInvoiceResolutionEnabled?: boolean;
  invoicePrefix?: string;
  invoiceResolution?: string;
  invoiceInitialNumber?: string;
  invoiceFinalNumber?: string;
  invoiceResolutionDate?: string;
  onFieldChange: (field: any, val: any) => void;
  onSaveFormat?: () => void;
  savingFormat?: boolean;
}

export const PrintersTab: React.FC<Props> = ({
  paperWidth,
  autoPrintReceipt,
  receiptHeader,
  receiptFooter,
  logoUrl,
  primaryColor,
  companyName,
  legalName,
  taxId,
  venueAddress,
  phone,
  taxType,
  taxRate,
  defaultTipPct,
  currency,
  showLogoOnReceipt,
  showQrOnReceipt,
  showWaiterOnReceipt,
  showTaxBreakdown,
  showResolutionOnReceipt,
  isInvoiceResolutionEnabled,
  invoicePrefix,
  invoiceResolution,
  invoiceInitialNumber,
  invoiceFinalNumber,
  invoiceResolutionDate,
  onFieldChange,
  onSaveFormat,
  savingFormat,
}) => {
  const {
    venues,
    selectedBranchId,
    setSelectedBranchId,
    printers,
    isModalOpen,
    editingPrinter,
    testingId,
    testResult,
    tabletCashierPrinterId,
    tabletKitchenPrinterId,
    setTabletDefaultPrinter,
    openNewPrinter,
    openEditPrinter,
    closeModal,
    savePrinter,
    deletePrinter,
    testPrint,
  } = useHardwarePrinters();

  const [printerToDelete, setPrinterToDelete] = React.useState<PrinterDevice | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    if (!printerToDelete) return;
    setIsDeleting(true);
    try {
      await deletePrinter(printerToDelete.id);
      setPrinterToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-8">
      <Card className="w-full min-w-0 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Printer className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground text-base">Dispositivos e Impresoras Térmicas</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Cada sede física opera sus propios periféricos en red local TCP (cable UTP puerto 9100), Bluetooth o USB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/80">
              <Store className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sede:</span>
              <Select
                value={selectedBranchId}
                onValueChange={(val) => setSelectedBranchId(val)}
              >
                <SelectTrigger className="h-8 text-xs font-bold bg-background min-w-[190px] rounded-lg border-border/80">
                  <SelectValue placeholder="Seleccionar Sede..." />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} {v.isPrimary ? '⭐ (Principal)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={openNewPrinter}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 h-auto rounded-xl text-xs font-bold transition shadow-lg shadow-primary/20 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Impresora</span>
            </Button>
          </div>
        </div>

        <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {printers.map((printer) => (
            <PrinterCard
              key={printer.id}
              printer={printer}
              isTesting={testingId === printer.id}
              testResult={testResult}
              isTabletDefault={printer.id === tabletCashierPrinterId || printer.id === tabletKitchenPrinterId}
              onToggleTabletDefault={(p) => setTabletDefaultPrinter(p.id, p.station === 'cashier' ? 'cashier' : 'kitchen')}
              onTest={testPrint}
              onEdit={openEditPrinter}
              onDelete={setPrinterToDelete}
            />
          ))}
          {printers.length === 0 && (
            <Card className="col-span-full p-8 text-center border border-dashed border-border/80 bg-muted/10 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Printer className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h4 className="font-bold text-sm text-foreground">Sin impresoras térmicas en esta sede</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Conecta terminales de impresión ESC/POS de 80mm o 58mm por cable de red UTP (puerto 9100), Bluetooth o adaptador USB directo para comandas y facturas.
                </p>
              </div>
              <Button
                type="button"
                onClick={openNewPrinter}
                className="mt-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Primera Impresora</span>
              </Button>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-muted-foreground">
                <span className="px-2.5 py-1 rounded-lg bg-card border border-border/70 font-medium">🔌 Cable UTP (Puerto 9100)</span>
                <span className="px-2.5 py-1 rounded-lg bg-card border border-border/70 font-medium">📶 Bluetooth Inalámbrico</span>
                <span className="px-2.5 py-1 rounded-lg bg-card border border-border/70 font-medium">⚡ Cable USB Directo</span>
              </div>
            </Card>
          )}
        </div>
      </Card>

      <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="w-full min-w-0 lg:col-span-2">
          <ReceiptSettingsCard
            paperWidth={paperWidth}
            autoPrintReceipt={autoPrintReceipt}
            receiptHeader={receiptHeader}
            receiptFooter={receiptFooter}
            showLogoOnReceipt={showLogoOnReceipt}
            showQrOnReceipt={showQrOnReceipt}
            showWaiterOnReceipt={showWaiterOnReceipt}
            showTaxBreakdown={showTaxBreakdown}
            showResolutionOnReceipt={showResolutionOnReceipt}
            onFieldChange={onFieldChange}
            onSaveFormat={onSaveFormat}
            saving={savingFormat}
          />
        </div>

        <ReceiptPreviewCard
          paperWidth={paperWidth}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
          companyName={companyName}
          legalName={legalName}
          taxId={taxId}
          venueAddress={venueAddress}
          phone={phone}
          receiptHeader={receiptHeader}
          receiptFooter={receiptFooter}
          taxType={taxType}
          taxRate={taxRate}
          defaultTipPct={defaultTipPct}
          currency={currency}
          showLogoOnReceipt={showLogoOnReceipt}
          showQrOnReceipt={showQrOnReceipt}
          showWaiterOnReceipt={showWaiterOnReceipt}
          showTaxBreakdown={showTaxBreakdown}
          showResolutionOnReceipt={showResolutionOnReceipt}
          isInvoiceResolutionEnabled={isInvoiceResolutionEnabled}
          invoicePrefix={invoicePrefix}
          invoiceResolution={invoiceResolution}
          invoiceInitialNumber={invoiceInitialNumber}
          invoiceFinalNumber={invoiceFinalNumber}
          invoiceResolutionDate={invoiceResolutionDate}
        />
      </div>

      <PrinterModal
        isOpen={isModalOpen}
        editingPrinter={editingPrinter}
        onClose={closeModal}
        onSave={savePrinter}
      />

      <AlertDialog open={Boolean(printerToDelete)} onOpenChange={(open) => !open && setPrinterToDelete(null)}>
        <AlertDialogContent className="max-w-sm text-center sm:text-center">
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-base font-bold">
              ¿Eliminar Impresora?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Deseas eliminar la impresora <span className="text-foreground font-semibold">"{printerToDelete?.name}"</span>? El terminal dejará de enviar comandas o facturas a este dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleting} onClick={() => setPrinterToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrintersTab;
