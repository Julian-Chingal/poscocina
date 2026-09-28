import React from 'react';
import { Plus, Printer, Store, Smartphone, Receipt, CheckCircle2 } from 'lucide-react';
import { useHardwarePrinters } from '../hooks/useHardwarePrinters';
import { localBridgePrinterService } from '@/services/local-bridge-printer.service';
import { PrinterCard } from './PrinterCard';
import { PrinterModal } from './PrinterModal';
import { PaperWidth, TaxType, PrinterDevice } from '../types/settings.types';
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

export const PrintersTab: React.FC<Props> = () => {
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

      {/* 2. Centralización Exclusiva de Recibos en la APK */}
      <Card className="w-full min-w-0 p-6 shadow-sm border-border bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-foreground">
                  Configuración de Recibos Centralizada en la APK
                </h4>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Control Exclusivo por Dispositivo
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                El <strong className="text-foreground">ancho de papel (58mm / 80mm)</strong>, la <strong className="text-foreground">familia de fuentes ESC/POS (Fuente A / Fuente B)</strong>, el <strong className="text-foreground">tamaño del texto</strong>, el <strong className="text-foreground">logotipo o ícono monocromático</strong>, el corte automático y los textos de encabezado/pie de ticket son gestionados de manera 100% autónoma y exclusiva por la aplicación nativa <strong className="text-foreground">Zogui Print Bridge (APK)</strong> instalada en este terminal.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-muted-foreground">
                <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60 font-medium">📄 Papel Térmico (58mm / 80mm)</span>
                <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60 font-medium">🔤 Fuentes ESC/POS (Fuente A / B)</span>
                <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60 font-medium">🖼️ Ícono / Logo Raster Monocromático</span>
                <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60 font-medium">✂️ Auto-corte & Cajón Monedero</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isTestingApk}
              onClick={handleTestFromApk}
              className="text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer h-10 px-4 border-border/80 hover:bg-primary/5 hover:border-primary/40 transition"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>{isTestingApk ? 'Enviando prueba...' : 'Imprimir Prueba desde APK'}</span>
            </Button>
          </div>
        </div>
      </Card>

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
