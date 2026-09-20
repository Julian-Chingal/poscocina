import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { CustomerSchema, CustomerFormValues } from '../schemas/pos.schemas';
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
  onSubmit: (data: CustomerFormValues) => Promise<void>;
}

export const CreateCustomerModal: React.FC<Props> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: '',
      documentType: 'CC',
      documentNumber: '',
      phone: '',
      email: '',
      address: '',
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
            <UserPlus className="w-5 h-5 text-orange-400" />
            <span>Registrar Nuevo Cliente</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo / Razón Social *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej. Juan Pérez o Restaurante SAS" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Doc.</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="CC">CC</option>
                        <option value="NIT">NIT</option>
                        <option value="CE">CE</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Documento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123456789"
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono / Móvil</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="3001234567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="cliente@ejemplo.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Calle 123 #45-67" />
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
                disabled={isSubmitting || form.formState.isSubmitting}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerModal;
