import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Printer,
  Bluetooth,
  Cable,
  Usb,
  Globe,
  Tablet,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Check,
  Sparkles,
} from 'lucide-react';
import { PrinterDevice, PrinterFormData } from '../types/settings.types';
import { PrinterSchema, PrinterFormValues } from '../schemas/settings.schemas';
import { usbPrinterService, UsbDeviceItem, UsbTestResult } from '@/services/usb-printer.service';
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
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [usbDevices, setUsbDevices] = useState<UsbDeviceItem[]>([]);
  const [isScanningUsb, setIsScanningUsb] = useState(false);
  const [isTestingUsb, setIsTestingUsb] = useState(false);
  const [isPrintingUsbTest, setIsPrintingUsbTest] = useState(false);
  const [usbTestResult, setUsbTestResult] = useState<UsbTestResult | null>(null);
  const [selectedUsbId, setSelectedUsbId] = useState<string | null>(null);

  const usbSupportInfo = usbPrinterService.isSupported();

  const form = useForm<PrinterFormValues, any, PrinterFormValues>({
    resolver: zodResolver(PrinterSchema) as any,
    defaultValues: {
      name: '',
      station: 'kitchen',
      connectionType: 'network_tcp',
      ipAddress: '',
      port: 9100,
      paperWidth: '80',
      autoPrintOnOrder: true,
      autoPrintOnPayment: false,
      openDrawerOnPrint: false,
      isTabletDefault: false,
    },
  });

  const connectionType = form.watch('connectionType');

  // Cargar lista de dispositivos USB vinculados y autorizados
  const loadUsbDevices = useCallback(async () => {
    try {
      const list = await usbPrinterService.getPairedDevices();
      setUsbDevices(list);

      const currentIp = form.getValues('ipAddress') || '';
      if (currentIp && list.length > 0) {
        const matched =
          list.find(
            (d) =>
              currentIp.toLowerCase().includes(d.vendorIdHex.toLowerCase()) &&
              currentIp.toLowerCase().includes(d.productIdHex.toLowerCase())
          ) ||
          list.find((d) => d.name && currentIp.toLowerCase().includes(d.name.toLowerCase()));
        if (matched) {
          setSelectedUsbId(matched.id);
        }
      }
    } catch (err) {
      console.warn('Error al cargar dispositivos USB vinculados:', err);
    }
  }, [form]);

  // Monitorear conexión y desconexión en tiempo real del cable USB
  useEffect(() => {
    if (isOpen && connectionType === 'usb_direct') {
      loadUsbDevices();
      const unsub = usbPrinterService.subscribe(() => {
        loadUsbDevices();
      });
      return unsub;
    }
  }, [isOpen, connectionType, loadUsbDevices]);

  useEffect(() => {
    setUsbTestResult(null);
    if (editingPrinter) {
      form.reset({
        name: editingPrinter.name,
        station: editingPrinter.station as any,
        connectionType: editingPrinter.connectionType as any,
        ipAddress: editingPrinter.ipAddress || '',
        port: editingPrinter.port || 9100,
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
        connectionType: 'network_tcp',
        ipAddress: '',
        port: 9100,
        paperWidth: '80',
        autoPrintOnOrder: true,
        autoPrintOnPayment: false,
        openDrawerOnPrint: false,
        isTabletDefault: true,
      });
      setSelectedUsbId(null);
    }
  }, [editingPrinter, isOpen, form]);

  const handleScanBluetooth = async () => {
    if (!('bluetooth' in navigator)) {
      toast.error('Tu dispositivo no soporta la API Web Bluetooth. Puedes ingresar el nombre de la impresora manualmente.');
      return;
    }

    try {
      setIsScanningBt(true);
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2'],
      });

      if (device?.name) {
        form.setValue('name', form.getValues('name') || device.name);
        form.setValue('ipAddress', device.name);
        toast.success(`Dispositivo Bluetooth "${device.name}" seleccionado`);
      }
    } catch (err: any) {
      if (err?.name !== 'NotFoundError') {
        toast.info('Búsqueda cancelada o no se seleccionó dispositivo');
      }
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleScanUsb = async () => {
    try {
      setIsScanningUsb(true);
      const device = await usbPrinterService.requestUsbDevice();
      setUsbDevices((prev) => {
        const exists = prev.some((d) => d.id === device.id);
        return exists ? prev.map((d) => (d.id === device.id ? device : d)) : [device, ...prev];
      });
      setSelectedUsbId(device.id);

      const identifier = usbPrinterService.formatIdentifier(device);
      form.setValue('ipAddress', identifier);

      const currentName = form.getValues('name');
      if (!currentName || currentName.startsWith('Nueva') || currentName.includes('POS USB')) {
        form.setValue('name', device.name);
      }

      toast.success(`Dispositivo USB "${device.name}" vinculado`);

      // Verificar conectividad de inmediato
      setIsTestingUsb(true);
      const testRes = await usbPrinterService.testConnection(device);
      setUsbTestResult(testRes);
    } catch (err: any) {
      if (err?.name !== 'NotFoundError' && !err?.message?.includes('No device selected')) {
        toast.error(err?.message || 'Error al conectar con dispositivo USB');
      } else {
        toast.info('Búsqueda cancelada o no se seleccionó dispositivo');
      }
    } finally {
      setIsScanningUsb(false);
      setIsTestingUsb(false);
    }
  };

  const handleScanSerial = async () => {
    try {
      setIsScanningUsb(true);
      const device = await usbPrinterService.requestSerialDevice();
      setUsbDevices((prev) => [device, ...prev.filter((d) => d.id !== device.id)]);
      setSelectedUsbId(device.id);
      const identifier = usbPrinterService.formatIdentifier(device);
      form.setValue('ipAddress', identifier);
      if (!form.getValues('name')) {
        form.setValue('name', device.name);
      }
      toast.success(`Puerto serie USB "${device.name}" seleccionado`);
    } catch (err: any) {
      if (err?.name !== 'NotFoundError') {
        toast.error(err?.message || 'Error al seleccionar puerto serie USB');
      }
    } finally {
      setIsScanningUsb(false);
    }
  };

  const handleSelectUsbDevice = (device: UsbDeviceItem) => {
    setSelectedUsbId(device.id);
    const identifier = usbPrinterService.formatIdentifier(device);
    form.setValue('ipAddress', identifier);
    if (!form.getValues('name')) {
      form.setValue('name', device.name);
    }
    setUsbTestResult(null);
  };

  const handleTestUsbConnection = async () => {
    const currentIp = form.getValues('ipAddress');
    if (!currentIp && !selectedUsbId) {
      toast.error('Primero selecciona o detecta una impresora USB');
      return;
    }
    setIsTestingUsb(true);
    const selectedDevice = usbDevices.find((d) => d.id === selectedUsbId);
    const res = await usbPrinterService.testConnection(selectedDevice || currentIp || '');
    setUsbTestResult(res);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsTestingUsb(false);
  };

  const handlePrintUsbTestTicket = async () => {
    const currentIp = form.getValues('ipAddress');
    if (!currentIp && !selectedUsbId) {
      toast.error('Primero selecciona o detecta una impresora USB');
      return;
    }
    setIsPrintingUsbTest(true);
    const selectedDevice = usbDevices.find((d) => d.id === selectedUsbId);
    const printerName = form.getValues('name') || 'Impresora Térmica USB';
    const paperWidth = (form.getValues('paperWidth') as any) || '80';
    const res = await usbPrinterService.printTestTicket(
      selectedDevice || currentIp || '',
      printerName,
      paperWidth
    );
    setUsbTestResult(res);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsPrintingUsbTest(false);
  };

  const handleSubmit = form.handleSubmit((values: PrinterFormValues) => {
    onSave({
      name: values.name,
      station: values.station,
      connectionType: values.connectionType,
      ipAddress: values.ipAddress || undefined,
      port: values.port,
      paperWidth: values.paperWidth,
      autoPrintOnOrder: values.autoPrintOnOrder,
      autoPrintOnPayment: values.autoPrintOnPayment,
      openDrawerOnPrint: values.openDrawerOnPrint,
      isTabletDefault: values.isTabletDefault,
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-primary" />
            <span>{editingPrinter ? 'Editar Impresora' : 'Nueva Impresora'}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <FormField
                control={form.control}
                name="connectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Conexión: *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm bg-background font-medium rounded-xl">
                          <SelectValue placeholder="Tipo de conexión" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="network_tcp">
                          🔌 Cable UTP / Red Ethernet (TCP/IP 9100)
                        </SelectItem>
                        <SelectItem value="bluetooth">
                          📶 Bluetooth Inalámbrico (Tablet / Móvil)
                        </SelectItem>
                        <SelectItem value="usb_direct">
                          ⚡ Cable USB Directo / Adaptador OTG
                        </SelectItem>
                        <SelectItem value="browser_raw">
                          🖥️ Navegador Web / Controlador del Sistema
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

              {connectionType === 'network_tcp' && (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex items-start gap-2">
                    <Cable className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Conexión por Cable de Red (UTP / LAN)
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-snug block">
                        Impresora conectada por cable UTP al router o switch, o mediante adaptador Ethernet a la tablet. Protocolo RAW ESC/POS.
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="ipAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Dirección IP en Red: *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej. 192.168.1.100" className="font-mono text-xs h-9 bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Puerto TCP:</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 9100)}
                                className="font-mono text-xs h-9 bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {connectionType === 'bluetooth' && (
                <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                  <div className="flex items-start gap-2">
                    <Bluetooth className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Conexión Inalámbrica Bluetooth
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-snug block">
                        Para impresoras térmicas portátiles o de mostrador emparejadas con la tablet.
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="ipAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Nombre o MAC del Dispositivo:</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej. POS-58-BT o MTP-II" className="text-xs h-9 bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="sm:self-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleScanBluetooth}
                        disabled={isScanningBt}
                        className="w-full sm:w-auto h-9 text-xs font-semibold flex items-center gap-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{isScanningBt ? 'Buscando...' : 'Buscar Bluetooth'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {connectionType === 'usb_direct' && (
                <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                        <Usb className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          Cable USB Directo / Adaptador OTG
                        </span>
                        <span className="text-[11px] text-muted-foreground leading-snug block">
                          Impresora conectada físicamente al puerto USB o USB-C de la tablet / computador.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={loadUsbDevices}
                        title="Refrescar lista de dispositivos conectados"
                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleScanUsb}
                        disabled={isScanningUsb}
                        className="h-7 px-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{isScanningUsb ? 'Buscando...' : 'Detectar Impresora USB'}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Advertencia si el entorno no soporta WebUSB directamente */}
                  {!usbSupportInfo.webUsb && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Detección WebUSB no disponible en este entorno:</span>
                        <span>
                          Para detección automática nativa, utiliza Google Chrome o Microsoft Edge en Android o PC con HTTPS o localhost. Puedes ingresar el identificador manualmente abajo.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Listado de dispositivos USB detectados / conectados */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Dispositivos USB Conectados ({usbDevices.length})
                      </span>
                      {usbSupportInfo.webSerial && (
                        <button
                          type="button"
                          onClick={handleScanSerial}
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Buscar por Puerto Serie (CH340/COM)</span>
                        </button>
                      )}
                    </div>

                    {usbDevices.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {usbDevices.map((dev) => {
                          const isSelected =
                            selectedUsbId === dev.id ||
                            (form.watch('ipAddress')?.toLowerCase().includes(dev.vendorIdHex.toLowerCase()) &&
                              form.watch('ipAddress')?.toLowerCase().includes(dev.productIdHex.toLowerCase()));

                          return (
                            <div
                              key={dev.id}
                              onClick={() => handleSelectUsbDevice(dev)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/30 shadow-xs'
                                  : 'border-border/80 bg-background/80 hover:bg-muted/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  <Printer className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground truncate block">
                                      {dev.name}
                                    </span>
                                    {dev.isConnected ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Conectado
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-semibold shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                        Desconectado
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                                    <span>{dev.manufacturer}</span>
                                    <span>•</span>
                                    <span>VID: {dev.vendorIdHex}</span>
                                    <span>PID: {dev.productIdHex}</span>
                                    {dev.type === 'webserial' && (
                                      <span className="text-primary font-semibold">[Serie COM]</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {isSelected ? (
                                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Seleccionada
                                  </span>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs px-2 rounded-lg cursor-pointer"
                                  >
                                    Seleccionar
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl border border-dashed border-border/80 bg-background/50 text-center space-y-2">
                        <p className="text-xs text-muted-foreground">
                          No se han detectado impresoras USB vinculadas todavía en este navegador.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleScanUsb}
                          disabled={isScanningUsb}
                          className="text-xs font-semibold h-8 rounded-lg border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5 mr-1.5" />
                          <span>Buscar y Conectar Impresora USB</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Panel de Confirmación y Prueba de Conexión en Tiempo Real */}
                  <div className="p-3 rounded-xl bg-background border border-border/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Confirmación de Conexión USB
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isTestingUsb || !form.watch('ipAddress')}
                          onClick={handleTestUsbConnection}
                          className="h-7 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer border-border hover:bg-muted"
                        >
                          <RefreshCw className={`w-3 h-3 ${isTestingUsb ? 'animate-spin' : ''}`} />
                          <span>{isTestingUsb ? 'Verificando...' : 'Probar Conexión'}</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isPrintingUsbTest || !form.watch('ipAddress')}
                          onClick={handlePrintUsbTestTicket}
                          className="h-7 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Printer className={`w-3 h-3 ${isPrintingUsbTest ? 'animate-pulse' : ''}`} />
                          <span>{isPrintingUsbTest ? 'Imprimiendo...' : 'Imprimir Test Físico'}</span>
                        </Button>
                      </div>
                    </div>

                    {usbTestResult ? (
                      <div
                        className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                          usbTestResult.success
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-destructive/10 text-destructive border border-destructive/30'
                        }`}
                      >
                        {usbTestResult.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                        )}
                        <span className="leading-snug">{usbTestResult.message}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500/60 shrink-0" />
                        <span>
                          Haz clic en "Probar Conexión" o "Imprimir Test Físico" para confirmar que la impresora responde al cable USB / OTG.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Campo de identificador USB editable / autogenerado */}
                  <FormField
                    control={form.control}
                    name="ipAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Identificador o Puerto USB:</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej. USB: Xprinter POS-80 (VID:0x0416 PID:0x5011)"
                            className="text-xs h-9 bg-background font-mono"
                          />
                        </FormControl>
                        <FormDescription className="text-[10px] text-muted-foreground">
                          Se autocompleta al seleccionar la impresora USB. Puedes editarlo si requieres un alias personalizado.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {connectionType === 'browser_raw' && (
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Impresora del Sistema / Navegador Web
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-snug block">
                        Abre el diálogo nativo de impresión del sistema operativo para imprimir en cualquier impresora instalada.
                      </span>
                    </div>
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
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
