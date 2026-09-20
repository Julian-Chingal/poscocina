import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { CloseShiftSchema, CloseShiftFormValues } from '../schemas/cash-shifts.schemas';
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
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClose: (amount: number, notes?: string) => Promise<void>;
}

export const CloseShiftModal: React.FC<Props> = ({ isOpen, onClose, onConfirmClose }) => {
  const form = useForm<CloseShiftFormValues>({
    resolver: zodResolver(CloseShiftSchema),
    defaultValues: {
      closingAmount: '',
      closingNotes: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onConfirmClose(parseFloat(values.closingAmount) || 0, values.closingNotes);
    form.reset();
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Auditoría de Cierre</span>
          </div>
          <DialogTitle className="text-lg font-bold">Arqueo Ciego de Caja</DialogTitle>
          <DialogDescription>
            Ingresa el total de dinero en efectivo físico contado en la gaveta. Por seguridad, el sistema no muestra el total recaudado hasta confirmar el conteo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="closingAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Efectivo Físico Contado *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold pointer-events-none">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        className="pl-8 font-mono text-sm h-10 rounded-xl"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Cierre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Billetes desgastados o cambio exacto"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                {form.formState.isSubmitting ? 'Cerrando...' : 'Confirmar y Cerrar Turno'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CloseShiftModal;
