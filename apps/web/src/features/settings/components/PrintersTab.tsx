import React from 'react';
import { Plus, Printer, Store, Smartphone } from 'lucide-react';
import { useHardwarePrinters } from '../hooks/useHardwarePrinters';
import { localBridgePrinterService } from '@/services/local-bridge-printer.service';
import { PrinterCard } from './PrinterCard';
import { PrinterModal } from './PrinterModal';
import { ReceiptSettingsCard } from './ReceiptSettingsCard';
import { ReceiptPreviewCard } from './ReceiptPreviewCard';
import { PaperWidth, TaxType, PrinterDevice, EscPosFontFamily, EscPosFontSize } from '../types/settings.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sileo';
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
  paperWidth?: PaperWidth;
  fontFamily?: EscPosFontFamily;
  fontSize?: EscPosFontSize;
  autoCut?: boolean;
  openDrawer?: boolean;
  beepOnPrint?: boolean;
  autoPrintReceipt?: boolean;
  receiptHeader?: string;
  receiptFooter?: string;
  logoUrl?: string;
  primaryColor?: string;
  companyName?: string;
  legalName?: string;
  taxId?: string;
  venueAddress?: string;
  phone?: string;
  taxType?: TaxType;
  taxRate?: string;
  defaultTipPct?: string;
  currency?: string;
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
  onFieldChange?: (field: any, val: any) => void;
  onSaveFormat?: () => void;
  savingFormat?: boolean;
}

export const PrintersTab: React.FC<Props> = ({
  paperWidth = 80,
  fontFamily = 'font_a',
  fontSize = 'normal',
  autoCut = true,
  openDrawer = false,
  beepOnPrint = false,
  autoPrintReceipt = true,
  receiptHeader = 'Sabor tradicional & Alta cocina',
  receiptFooter = '¡Gracias por su visita! Síguenos en @poscocina',
  logoUrl = '',
  primaryColor = '#ea580c',
  companyName = 'Mi Restaurante',
  legalName = 'poscocina S.A.S.',
  taxId = 'NIT: 900.123.456-7',
  venueAddress = '',
  phone = '',
  taxType = 'INC_8',
  taxRate = '8',
  defaultTipPct = '10',
  currency = 'COP',
  showLogoOnReceipt = true,
  showQrOnReceipt = true,
  showWaiterOnReceipt = true,
  showTaxBreakdown = true,
  showResolutionOnReceipt = true,
  isInvoiceResolutionEnabled = false,
  invoicePrefix = 'POS',
  invoiceResolution = '',
  invoiceInitialNumber = '1',
  invoiceFinalNumber = '50000',
  invoiceResolutionDate = '',
  onFieldChange = () => {},
  onSaveFormat,
  savingFormat = false,
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
    checkUsbConnected,
    connectUsbPrinter,
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
  const [isApkOnline, setIsApkOnline] = React.useState<boolean | null>(null);
  const [isTestingApk, setIsTestingApk] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      const online = await localBridgePrinterService.isOnline();
      if (mounted) setIsApkOnline(online);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

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

  const handleTestFromApk = async () => {
    setIsTestingApk(true);
    try {
      const online = await localBridgePrinterService.isOnline(true);
      setIsApkOnline(online);
      if (online) {
        const res = await localBridgePrinterService.testPrint();
        if (res.success) {
          toast.success(res.message || 'Ticket de prueba impreso físicamente por la APK');
        } else {
          toast.error(res.error || 'Error al imprimir prueba desde la APK');
        }
      } else {
        toast.error('La APK Zogui Print Bridge no está respondiendo en el puerto 8080');
      }
    } finally {
      setIsTestingApk(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-8">
      {/* 1. Gestión de Dispositivos e Impresoras */}
      <Card className="w-full min-w-0 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <Printer className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground text-base">Dispositivos e Impresoras Térmicas</h3>
              {isApkOnline !== null && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                    isApkOnline
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isApkOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <Smartphone className="w-3 h-3 shrink-0" />
                  {isApkOnline ? 'APK Zogui Bridge Conectada' : 'APK no detectada'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sincroniza tus terminales térmicas con la APK nativa (Zogui Print Bridge) para imprimir directamente por USB, Bluetooth o Red sin límites del navegador.
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
              isUsbConnected={printer.connectionType === 'usb_direct' ? checkUsbConnected(printer) : undefined}
              onToggleTabletDefault={(p) => setTabletDefaultPrinter(p.id, p.station === 'cashier' ? 'cashier' : 'kitchen')}
              onConnectUsb={connectUsbPrinter}
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
                  Haz clic en "Nueva Impresora" para sincronizar tus impresoras de cocina o caja directamente con la aplicación local Zogui Print Bridge (APK).
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
                <span className="px-2.5 py-1 rounded-lg bg-card border border-border/70 font-medium">📱 Sincronización APK</span>
                <span className="px-2.5 py-1 rounded-lg bg-card border border-border/70 font-medium">⚡ Conexión USB OTG</span>
                <span className="px-2.5 py-1 rounded-lg bg-card border border-border/70 font-medium">📶 Bluetooth SPP</span>
                <span className="px-2.5 py-1 rounded-lg bg-card border border-border/70 font-medium">🔌 Red IP (TCP)</span>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* 2. Configuración y Simulación de Modelos de Recibo Térmico */}
      <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="w-full min-w-0 lg:col-span-2 space-y-6">
          <ReceiptSettingsCard
            paperWidth={paperWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            autoCut={autoCut}
            openDrawer={openDrawer}
            beepOnPrint={beepOnPrint}
            autoPrintReceipt={autoPrintReceipt}
            receiptHeader={receiptHeader}
            receiptFooter={receiptFooter}
            showLogoOnReceipt={showLogoOnReceipt}
            showQrOnReceipt={showQrOnReceipt}
            showWaiterOnReceipt={showWaiterOnReceipt}
            showTaxBreakdown={showTaxBreakdown}
            showResolutionOnReceipt={showResolutionOnReceipt}
            isApkOnline={isApkOnline}
            onFieldChange={onFieldChange}
            onSaveFormat={onSaveFormat}
            saving={savingFormat}
          />
        </div>

        <div className="w-full min-w-0 space-y-4">
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

          {/* Acceso rápido a test de impresión desde la APK si está conectada */}
          <Card className="p-4 bg-muted/20 border-border/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block">
                Prueba Física Directa
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                Dispara un ticket real por la APK
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTestingApk}
              onClick={handleTestFromApk}
              className="text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer h-9 px-3 border-border hover:bg-primary/5 hover:border-primary/40 shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              <span>{isTestingApk ? 'Enviando...' : 'Test APK'}</span>
            </Button>
          </Card>
        </div>
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
