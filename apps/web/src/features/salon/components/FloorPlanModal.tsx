import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers } from 'lucide-react';
import { FloorPlanSchema, FloorPlanFormValues } from '../schemas/salon.schemas';
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
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  submitting: boolean;
  formError?: string | null;
  onClose: () => void;
  onSubmit: (name: string) => Promise<any>;
}

export const FloorPlanModal: React.FC<Props> = ({
  isOpen,
  submitting,
  formError,
  onClose,
  onSubmit,
}) => {
  const form = useForm<FloorPlanFormValues>({
    resolver: zodResolver(FloorPlanSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: '' });
    }
  }, [isOpen, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values.name);
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Nueva Zona o Salón</span>
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Área / Salón *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Terraza Exterior, Segundo Piso, Zona VIP..."
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
                disabled={submitting || form.formState.isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {submitting ? 'Creando...' : 'Crear Zona'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FloorPlanModal;
