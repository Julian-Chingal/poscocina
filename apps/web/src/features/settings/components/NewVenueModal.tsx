import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, AlertCircle } from 'lucide-react';
import { NewVenuePayload } from '../types/settings.types';
import { NewVenueSchema, NewVenueFormValues } from '../schemas/settings.schemas';
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
  isCreating: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: NewVenuePayload) => void;
}

export const NewVenueModal: React.FC<Props> = ({
  isOpen,
  isCreating,
  error,
  onClose,
  onSubmit,
}) => {
  const form = useForm<NewVenueFormValues>({
    resolver: zodResolver(NewVenueSchema),
    defaultValues: {
      name: '',
      slug: '',
      address: '',
      phone: '',
    },
  });

  const handleNameChange = (val: string) => {
    form.setValue('name', val);
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug.trim() === '') {
      form.setValue(
        'slug',
        val
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      );
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim(),
      address: values.address.trim(),
      phone: values.phone.trim(),
    });
    form.reset();
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-orange-400" />
            <span>Crear Nueva Sucursal</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Sede *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Sede El Poblado"
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug URL Identificador *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ej. sede-el-poblado"
                      className="font-mono"
                      onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cra. 43A # 1-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+57 300 987 6543" />
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
                disabled={isCreating || form.formState.isSubmitting}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold"
              >
                {isCreating ? 'Creando Sede...' : 'Crear Sede'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewVenueModal;
