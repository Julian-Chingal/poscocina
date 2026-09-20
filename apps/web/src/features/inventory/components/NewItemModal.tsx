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
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <span>Nuevo Insumo de Cocina / Barra</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Insumo *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Lomo de Res, Leche Entera, Café en Grano"
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
                    <FormLabel>Unidad de Medida *</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="g">Gramos (g)</option>
                        <option value="lt">Litros (lt)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="und">Unidades (und)</option>
                        <option value="botella">Botella</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Inicial</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="font-mono" />
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
                    <FormLabel>Umbral Alerta Mínima</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Unitario ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="font-mono" />
                    </FormControl>
                    <FormMessage />
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
                disabled={isSubmitting || form.formState.isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
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
