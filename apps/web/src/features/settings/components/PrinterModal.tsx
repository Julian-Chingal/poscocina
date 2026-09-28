import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Printer,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Tablet,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { PrinterDevice, PrinterFormData } from '../types/settings.types';
import { PrinterSchema, PrinterFormValues } from '../schemas/settings.schemas';
import {
  localBridgePrinterService,
  BridgePrinterDevice,
} from '@/services/local-bridge-printer.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sileo';

interface Props {
  isOpen: boolean;
  editingPrinter: PrinterDevice | null;
  onClose: () => void;
  onSave: (data: PrinterFormData & { isTabletDefault?: boolean }) => void;
}

export const PrinterModal: React.FC<Props> = ({
  isOpen,
  editingPrinter,
  onClose,
  onSave,
}) => {
  const [isBridgeOnline, setIsBridgeOnline] = useState<boolean | null>(null);
  const [isCheckingBridge, setIsCheckingBridge] = useState(false);
  const [bridgePrinters, setBridgePrinters] = useState<BridgePrinterDevice[]>([]);
  const [isTestingPrint, setIsTestingPrint] = useState(false);
  const [testMessage, setTestMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Configuración de host/puerto para multidispositivo LAN
  const [showHostSettings, setShowHostSettings] = useState(false);
  const [hostInput, setHostInput] = useState(localBridgePrinterService.host);
  const [portInput, setPortInput] = useState(localBridgePrinterService.port.toString());

  const form = useForm<PrinterFormValues, any, PrinterFormValues>({
    resolver: zodResolver(PrinterSchema) as any,
    defaultValues: {
      name: '',
      station: 'kitchen',
      connectionType: 'zogui_bridge',
      ipAddress: '',
      port: 8080,
      paperWidth: '80',
      autoPrintOnOrder: true,
      autoPrintOnPayment: false,
      openDrawerOnPrint: false,
      isTabletDefault: false,
    },
  });

  const connectionType = form.watch('connectionType');

  // Sincronizar y consultar impresoras desde la APK nativa
  const checkApkConnection = useCallback(async () => {
    setIsCheckingBridge(true);
    setTestMessage(null);
    try {
      const online = await localBridgePrinterService.isOnline(true);
      setIsBridgeOnline(online);
      if (online) {
        const printers = await localBridgePrinterService.getPrinters();
        setBridgePrinters(printers);
      } else {
        setBridgePrinters([]);
      }
    } catch {
      setIsBridgeOnline(false);
      setBridgePrinters([]);
    } finally {
      setIsCheckingBridge(false);
    }
  }, []);

  // Al abrir el modal o cambiar visibilidad
  useEffect(() => {
    if (isOpen) {
      checkApkConnection();
      setTestMessage(null);
      setHostInput(localBridgePrinterService.host);
      setPortInput(localBridgePrinterService.port.toString());

      if (editingPrinter) {
        form.reset({
          name: editingPrinter.name,
          station: editingPrinter.station as any,
          connectionType: editingPrinter.connectionType === 'disabled' ? 'disabled' : 'zogui_bridge',
          ipAddress: editingPrinter.ipAddress || '',
          port: editingPrinter.port || 8080,
          paperWidth: (editingPrinter.paperWidth || '80') as any,
          autoPrintOnOrder: editingPrinter.autoPrintOnOrder ?? true,
          autoPrintOnPayment: editingPrinter.autoPrintOnPayment ?? false,
          openDrawerOnPrint: editingPrinter.openDrawerOnPrint ?? false,
          isTabletDefault: false,
        });
      } else {
        form.reset({
          name: '',
          station: 'kitchen',
          connectionType: 'zogui_bridge',
          ipAddress: '',
          port: 8080,
          paperWidth: '80',
          autoPrintOnOrder: true,
          autoPrintOnPayment: false,
          openDrawerOnPrint: false,
          isTabletDefault: true,
        });
      }
    }
  }, [isOpen, editingPrinter, form, checkApkConnection]);

  // Guardar host personalizado para conexión con la APK
  const handleSaveHostConfig = () => {
    const port = parseInt(portInput, 10) || 8080;
    localBridgePrinterService.setHost(hostInput, port);
    toast.success(`Servidor configurado en http://${hostInput}:${port}`);
    setShowHostSettings(false);
    checkApkConnection();
  };

  // Enviar ticket de prueba a la APK
  const handleTestPrintFromApk = async () => {
    const printerName = form.watch('ipAddress') || form.watch('name');
    setIsTestingPrint(true);
    setTestMessage(null);
    try {
      const res = await localBridgePrinterService.testPrint(printerName);
      if (res.success) {
        setTestMessage({
          success: true,
          text: res.message || '¡Ticket de prueba impreso físicamente por la APK!',
        });
        toast.success(res.message || 'Ticket impreso correctamente');
      } else {
        setTestMessage({
          success: false,
          text: res.error || res.message || 'La impresora no respondió.',
        });
        toast.error(res.error || 'Error al imprimir prueba');
      }
    } catch (err: any) {
      setTestMessage({
        success: false,
        text: err?.message || 'Error de comunicación con la APK en este dispositivo.',
      });
      toast.error('Error al comunicar con la APK');
    } finally {
      setIsTestingPrint(false);
    }
  };

  const onSubmit = (values: PrinterFormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-primary">
            <Printer className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">
              {editingPrinter ? 'Editar Impresora' : 'Nueva Impresora'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Impresora: *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej. Cocina Caliente (Epson TM-T20)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="station"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estación / Área: *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm bg-background font-medium rounded-xl">
                          <SelectValue placeholder="Seleccionar estación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kitchen">Cocina Caliente</SelectItem>
                        <SelectItem value="bar">Barra / Bebidas</SelectItem>
                        <SelectItem value="dessert">Postres / Café</SelectItem>
                        <SelectItem value="cashier">Caja Principal (Recibos)</SelectItem>
                        <SelectItem value="expediter">Expedición / Despacho</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paperWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ancho Papel: *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm bg-background font-medium rounded-xl">
                          <SelectValue placeholder="Ancho de papel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="80">80 mm (Estándar POS)</SelectItem>
                        <SelectItem value="58">58 mm (Compacto)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              {/* Selector de Tipo de Conexión: SOLO APK y Deshabilitada */}
              <FormField
                control={form.control}
                name="connectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Conexión: *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm bg-background font-medium rounded-xl border-primary/30">
                          <SelectValue placeholder="Tipo de conexión" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zogui_bridge">
                          📱 Sincronizar con la APK (Zogui Print Bridge)
                        </SelectItem>
                        <SelectItem value="disabled">
                          ⛔ Deshabilitada
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Panel de Sincronización con la APK */}
              {connectionType === 'zogui_bridge' && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                  {/* Tarjeta de estado de la APK */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          isBridgeOnline
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            Controlador Zogui Print Bridge (APK)
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isBridgeOnline
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isBridgeOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                              }`}
                            />
                            {isBridgeOnline ? 'Conectada' : 'No Detectada'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {isBridgeOnline
                            ? `Comunicando en http://${localBridgePrinterService.host}:${localBridgePrinterService.port}`
                            : 'Abre la app "Zogui Print Bridge" en este dispositivo para imprimir por USB, Bluetooth o Red.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={checkApkConnection}
                      disabled={isCheckingBridge}
                      className="h-8 text-xs font-semibold rounded-xl flex items-center gap-1.5 border-border hover:bg-muted cursor-pointer shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBridge ? 'animate-spin' : ''}`} />
                      <span>{isCheckingBridge ? 'Verificando...' : 'Sincronizar'}</span>
                    </Button>
                  </div>

                  {/* Selector de Impresoras detectadas por la APK */}
                  <div className="space-y-1.5 pt-1">
                    <FormLabel className="text-xs font-bold text-foreground">
                      Impresora Vinculada en la APK: *
                    </FormLabel>
                    <Select
                      value={form.watch('ipAddress') || '__default__'}
                      onValueChange={(val) => {
                        const targetVal = val === '__default__' ? '' : val;
                        form.setValue('ipAddress', targetVal);
                        const matched = bridgePrinters.find(
                          (p) => p.name === targetVal || p.id === targetVal
                        );
                        if (
                          matched &&
                          (!form.getValues('name') ||
                            form.getValues('name').startsWith('Nueva') ||
                            form.getValues('name').includes('Impresora'))
                        ) {
                          form.setValue('name', matched.name);
                        }
                      }}
                    >
                      <SelectTrigger className="h-10 text-xs bg-background font-medium rounded-xl">
                        <SelectValue placeholder="Selecciona la impresora de la APK" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__default__">
                          ⭐ [Predeterminada] Impresora Principal configurada en la APK
                        </SelectItem>
                        {bridgePrinters.map((p) => {
                          const badge =
                            p.connectionType === 'usb'
                              ? '⚡ [USB]'
                              : p.connectionType === 'bluetooth'
                              ? '📶 [Bluetooth]'
                              : p.connectionType === 'tcp'
                              ? '🔌 [Red IP]'
                              : '🖨️ [Sistema]';
                          return (
                            <SelectItem key={p.id || p.name} value={p.name}>
                              {badge} {p.name} {p.portName ? `(${p.portName})` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      {bridgePrinters.length > 0
                        ? `${bridgePrinters.length} impresora(s) disponible(s) en la APK. Elige la correspondiente a esta área.`
                        : 'Si no ves tu impresora aquí, agrégala primero en la app Zogui Print Bridge mediante los selectores de USB/Bluetooth/Red.'}
                    </p>
                  </div>

                  {/* Test de impresión directo con la APK */}
                  <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>¿Quieres comprobar la salida física del papel?</span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      disabled={!isBridgeOnline || isTestingPrint}
                      onClick={handleTestPrintFromApk}
                      className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Printer className={`w-3.5 h-3.5 ${isTestingPrint ? 'animate-pulse' : ''}`} />
                      <span>{isTestingPrint ? 'Imprimiendo...' : 'Probar Impresión Física'}</span>
                    </Button>
                  </div>

                  {/* Resultado del test */}
                  {testMessage && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                        testMessage.success
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-destructive/10 text-destructive border border-destructive/30'
                      }`}
                    >
                      {testMessage.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                      )}
                      <span className="leading-snug">{testMessage.text}</span>
                    </div>
                  )}

                  {/* Opciones avanzadas de Red LAN para la APK */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowHostSettings((prev) => !prev)}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>
                        {showHostSettings
                          ? 'Ocultar configuración de red de la APK'
                          : '¿La APK está instalada en otra tablet o computador de la red?'}
                      </span>
                    </button>

                    {showHostSettings && (
                      <div className="mt-2.5 p-3 rounded-xl border border-border bg-background/80 space-y-2">
                        <span className="text-[11px] font-bold text-foreground block">
                          Dirección de la APK en la Red Local (LAN):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <Input
                              value={hostInput}
                              onChange={(e) => setHostInput(e.target.value)}
                              placeholder="127.0.0.1 o 192.168.1.X"
                              className="text-xs h-8 font-mono"
                            />
                          </div>
                          <div>
                            <Input
                              value={portInput}
                              onChange={(e) => setPortInput(e.target.value)}
                              placeholder="8080"
                              className="text-xs h-8 font-mono"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleSaveHostConfig}
                          className="h-7 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Guardar y Conectar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Switch para fijar como predeterminada de esta tablet */}
            <FormField
              control={form.control}
              name="isTabletDefault"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                      <Tablet className="w-4 h-4 text-primary" />
                      Fijar como Predeterminada de esta Tablet
                    </FormLabel>
                    <FormDescription className="text-[11px] text-muted-foreground">
                      Esta tablet recordará esta impresora para no tener que volver a configurarla.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2.5 pt-2 border-t border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Automatización de Impresión
              </span>
              <FormField
                control={form.control}
                name="autoPrintOnOrder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 p-2 rounded-xl bg-muted/40 border border-border">
                    <FormLabel className="text-xs font-medium cursor-pointer">
                      Imprimir comanda al marchar pedido
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoPrintOnPayment"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 p-2 rounded-xl bg-muted/40 border border-border">
                    <FormLabel className="text-xs font-medium cursor-pointer">
                      Imprimir comprobante al registrar cobro
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openDrawerOnPrint"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 p-2 rounded-xl bg-muted/40 border border-border">
                    <FormLabel className="text-xs font-medium cursor-pointer">
                      Pulso eléctrico de apertura de gaveta monedero
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
              >
                {editingPrinter ? 'Guardar Cambios' : 'Registrar Impresora'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PrinterModal;
