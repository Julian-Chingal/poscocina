import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck } from 'lucide-react';
import { SupplierDocType } from '../types/inventory.types';
import { NewSupplierSchema, NewSupplierFormValues } from '../schemas/inventory.schemas';
import { SupplierContactFields } from './SupplierContactFields';
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
    documentType: SupplierDocType;
    documentNumber: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => Promise<void>;
}

export const NewSupplierModal: React.FC<Props> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const form = useForm<NewSupplierFormValues>({
    resolver: zodResolver(NewSupplierSchema),
    defaultValues: {
      name: '',
      documentType: 'NIT',
      documentNumber: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      documentType: values.documentType as SupplierDocType,
      documentNumber: values.documentNumber,
      contactName: values.contactName || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
      notes: values.notes || undefined,
    });
    form.reset();
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>Registrar Nuevo Proveedor</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre o Razón Social *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Distribuidora de Carnes La Sabana S.A.S"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Doc *</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="NIT">NIT</option>
                        <option value="RUT">RUT</option>
                        <option value="CC">Cédula (CC)</option>
                        <option value="CE">Cédula Extranjería</option>
                        <option value="Passport">Pasaporte</option>
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
                      <FormLabel>Número Documento / NIT *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="901234567-1"
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <SupplierContactFields
              contact={form.watch('contactName')}
              phone={form.watch('phone')}
              email={form.watch('email')}
              address={form.watch('address')}
              notes={form.watch('notes')}
              onContactChange={(c) => form.setValue('contactName', c)}
              onPhoneChange={(p) => form.setValue('phone', p)}
              onEmailChange={(e) => form.setValue('email', e)}
              onAddressChange={(a) => form.setValue('address', a)}
              onNotesChange={(n) => form.setValue('notes', n)}
            />

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || form.formState.isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                {isSubmitting || form.formState.isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSupplierModal;
