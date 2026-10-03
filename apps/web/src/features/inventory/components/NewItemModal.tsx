import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Boxes } from 'lucide-react';
import { NewItemSchema, NewItemFormValues } from '../schemas/inventory.schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    unit: string;
    currentStock: string;
    alertThreshold: string;
    costPerUnit: string;
  }) => Promise<void>;
}

export const NewItemModal: React.FC<Props> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const form = useForm<NewItemFormValues>({
    resolver: zodResolver(NewItemSchema),
    defaultValues: {
      name: '',
      unit: 'kg',
      currentStock: '10',
      alertThreshold: '2',
      costPerUnit: '5000',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset();
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose} className="rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                Nuevo Insumo de Almacén
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Controla existencias, costo por unidad y alertas de reposición automática.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Nombre del Insumo o Materia Prima *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Lomo de Res, Leche Entera, Coca-Cola 350ml, Café Molido"
                      className="h-10 rounded-xl text-xs"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Unidad de Medida *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                          <SelectValue placeholder="Seleccionar unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                        <SelectItem value="g">Gramos (g)</SelectItem>
                        <SelectItem value="lt">Litros (lt)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="und">Unidades (und)</SelectItem>
                        <SelectItem value="botella">Botella</SelectItem>
                        <SelectItem value="porción">Porción</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Stock Inicial</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className="font-mono h-10 rounded-xl text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="alertThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Umbral Mínimo Alerta</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className="font-mono h-10 rounded-xl text-xs"
                      />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Alerta cuando el stock caiga a este nivel
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Costo Unitario ($ COP)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className="font-mono h-10 rounded-xl text-xs"
                      />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Para cálculo de escandallos
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="ghost" type="button" onClick={onClose} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || form.formState.isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-5"
              >
                {isSubmitting || form.formState.isSubmitting ? 'Guardando...' : 'Crear Insumo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewItemModal;
