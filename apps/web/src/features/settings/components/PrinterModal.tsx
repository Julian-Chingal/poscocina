import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer, Bluetooth, Cable, Usb, Globe, Tablet, Search } from 'lucide-react';
import { PrinterDevice, PrinterFormData } from '../types/settings.types';
import { PrinterSchema, PrinterFormValues } from '../schemas/settings.schemas';
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

  useEffect(() => {
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

  const connectionType = form.watch('connectionType');

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
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-start gap-2">
                    <Usb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Cable USB Directo / Adaptador OTG
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-snug block">
                        Impresora conectada físicamente al puerto USB o USB-C de la tablet mediante adaptador OTG.
                      </span>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="ipAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Identificador o Puerto USB:</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej. USB001 o Impresora POS USB" className="text-xs h-9 bg-background" />
                        </FormControl>
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
