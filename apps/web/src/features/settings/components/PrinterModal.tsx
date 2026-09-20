import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer } from 'lucide-react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  editingPrinter: PrinterDevice | null;
  onClose: () => void;
  onSave: (data: PrinterFormData) => void;
}

export const PrinterModal: React.FC<Props> = ({
  isOpen,
  editingPrinter,
  onClose,
  onSave,
}) => {
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(PrinterSchema),
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
      });
    }
  }, [editingPrinter, isOpen, form]);

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
    });
  });

  const connectionType = form.watch('connectionType');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-orange-400" />
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
                  <FormLabel>Nombre: *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej. Epson Cocina o Xprinter Barra" />
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
                    <FormLabel>Estación: *</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="kitchen">Cocina Caliente</option>
                        <option value="bar">Barra / Bebidas</option>
                        <option value="dessert">Postres / Café</option>
                        <option value="cashier">Caja Principal (Recibos)</option>
                        <option value="expediter">Expedición</option>
                      </Select>
                    </FormControl>
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
                    <FormControl>
                      <Select {...field}>
                        <option value="80">80 mm (Estándar POS)</option>
                        <option value="58">58 mm (Compacto)</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="connectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conexión: *</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="network_tcp">Red LAN TCP (Socket)</option>
                        <option value="browser_raw">Navegador Web / USB</option>
                        <option value="disabled">Deshabilitada</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {connectionType === 'network_tcp' ? (
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP en Red:</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="192.168.1.100" className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puerto RAW:</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 9100)}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <FormField
                control={form.control}
                name="autoPrintOnOrder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <FormLabel className="font-medium cursor-pointer">
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
                  <FormItem className="flex items-center justify-between space-y-0 p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <FormLabel className="font-medium cursor-pointer">
                      Imprimir factura al registrar pago
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
                  <FormItem className="flex items-center justify-between space-y-0 p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <FormLabel className="font-medium cursor-pointer">
                      Pulso eléctrico de apertura de gaveta
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
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold"
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
