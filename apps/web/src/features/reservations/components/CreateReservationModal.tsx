import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, AlertCircle } from 'lucide-react';
import { TableItem, CreateReservationPayload, Customer } from '../types/reservations.types';
import { CreateReservationSchema, CreateReservationFormValues } from '../schemas/reservations.schemas';
import { CustomerAutocompleteField } from './CustomerAutocompleteField';
import { CustomerContactFields } from './CustomerContactFields';
import { ReservationDateTimeFields } from './ReservationDateTimeFields';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CreateReservationModalProps {
  isOpen: boolean;
  venueId: string;
  tables: TableItem[];
  defaultDate: string;
  submitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateReservationPayload) => Promise<boolean>;
}

export const CreateReservationModal: React.FC<CreateReservationModalProps> = ({
  isOpen,
  venueId,
  tables,
  defaultDate,
  submitting,
  errorMessage,
  onClose,
  onSubmit,
}) => {
  const form = useForm<CreateReservationFormValues>({
    resolver: zodResolver(CreateReservationSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerId: undefined,
      tableId: '',
      formDate: defaultDate,
      formTime: '19:00',
      guestCount: 2,
      notes: '',
    },
  });

  const handleSelectCustomer = (customer: Customer) => {
    form.setValue('customerName', customer.name);
    form.setValue('customerId', customer.id);
    if (customer.phone) form.setValue('customerPhone', customer.phone);
    if (customer.email) form.setValue('customerEmail', customer.email);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const reservationDateTime = new Date(`${values.formDate}T${values.formTime}:00`);
    const success = await onSubmit({
      venueId,
      customerName: values.customerName.trim(),
      customerPhone: values.customerPhone.trim() || undefined,
      customerEmail: values.customerEmail.trim() || undefined,
      customerId: values.customerId,
      tableId: values.tableId || undefined,
      reservationTime: reservationDateTime.toISOString(),
      guestCount: Number(values.guestCount),
      notes: values.notes.trim() || undefined,
    });

    if (success) {
      form.reset();
      onClose();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Nueva Reserva de Mesa</span>
          </DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CustomerAutocompleteField
              venueId={venueId}
              onSelectCustomer={handleSelectCustomer}
            />

            <CustomerContactFields
              customerName={form.watch('customerName')}
              onCustomerNameChange={(name) => form.setValue('customerName', name)}
              customerPhone={form.watch('customerPhone')}
              onCustomerPhoneChange={(phone) => form.setValue('customerPhone', phone)}
            />

            <ReservationDateTimeFields
              formDate={form.watch('formDate')}
              onDateChange={(d) => form.setValue('formDate', d)}
              formTime={form.watch('formTime')}
              onTimeChange={(t) => form.setValue('formTime', t)}
              guestCount={form.watch('guestCount')}
              onGuestCountChange={(c) => form.setValue('guestCount', c)}
              tableId={form.watch('tableId')}
              onTableIdChange={(id) => form.setValue('tableId', id)}
              tables={tables}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas / Ocasión</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Ej: Cumpleaños, aniversario, mesa cerca a la ventana..."
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
                {submitting || form.formState.isSubmitting ? 'Registrando...' : 'Confirmar Reserva'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReservationModal;
