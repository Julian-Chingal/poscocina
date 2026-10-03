import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Calendar, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import {
  TableItem,
  FloorPlanItem,
  CreateReservationPayload,
  Customer,
} from '../types/reservations.types';
import {
  CreateReservationSchema,
  CreateReservationFormValues,
} from '../schemas/reservations.schemas';
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
  floorPlans?: FloorPlanItem[];
  defaultDate: string;
  submitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateReservationPayload) => Promise<boolean>;
}

const OCCASION_CHIPS = [
  '🎂 Cumpleaños',
  '💍 Aniversario',
  '💼 Reunión de Trabajo',
  '🌿 Mesa en Terraza',
  '🪟 Cerca a la Ventana',
  '👶 Requiere Silla de Bebé',
  '🍷 Degustación Especial',
];

export const CreateReservationModal: React.FC<CreateReservationModalProps> = ({
  isOpen,
  venueId,
  tables,
  floorPlans = [],
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

  const handleAddOccasionChip = (chip: string) => {
    const currentNotes = form.getValues('notes') || '';
    if (currentNotes.includes(chip)) return;
    const newNotes = currentNotes.trim() ? `${currentNotes.trim()} • ${chip}` : chip;
    form.setValue('notes', newNotes);
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

  const selectedTableId = form.watch('tableId');
  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const currentGuestCount = form.watch('guestCount');
  const customerName = form.watch('customerName');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[92vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Nueva Reserva de Mesa
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registra los datos del comensal, fecha, comensales y asigna mesa en el plano visual.
              </p>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 my-3 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Customer Search Autocomplete */}
            <CustomerAutocompleteField
              venueId={venueId}
              onSelectCustomer={handleSelectCustomer}
            />

            {/* Direct Contact Fields */}
            <CustomerContactFields
              customerName={form.watch('customerName')}
              onCustomerNameChange={(name) => form.setValue('customerName', name)}
              customerPhone={form.watch('customerPhone')}
              onCustomerPhoneChange={(phone) => form.setValue('customerPhone', phone)}
            />

            {/* Date, Time, Guest Count & Visual Table Floor Plan Picker */}
            <ReservationDateTimeFields
              formDate={form.watch('formDate')}
              onDateChange={(d) => form.setValue('formDate', d)}
              formTime={form.watch('formTime')}
              onTimeChange={(t) => form.setValue('formTime', t)}
              guestCount={form.watch('guestCount')}
              onGuestCountChange={(c) => form.setValue('guestCount', c)}
              tableId={selectedTableId}
              onTableIdChange={(id) => form.setValue('tableId', id)}
              tables={tables}
              floorPlans={floorPlans}
            />

            {/* Notes / Occasion with Quick Chips */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      <span>Notas Especiales u Ocasión</span>
                    </FormLabel>
                    <span className="text-[11px] text-muted-foreground">Opcional</span>
                  </div>

                  {/* Occasion Quick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pb-1">
                    {OCCASION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleAddOccasionChip(chip)}
                        className="px-2 py-0.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium border border-border/60 transition cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Ej: Aniversario sorpresa, cliente prefiere área tranquila..."
                      className="text-xs rounded-xl bg-card border-border/80 focus-visible:ring-primary/40 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live Summary Bar */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground truncate">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">
                  {customerName ? (
                    <strong className="text-foreground">{customerName}</strong>
                  ) : (
                    'Comensal'
                  )}{' '}
                  • {currentGuestCount} {currentGuestCount === 1 ? 'persona' : 'personas'} •{' '}
                  {selectedTable ? (
                    <span className="text-primary font-bold">Mesa {selectedTable.label}</span>
                  ) : (
                    'Mesa por asignar'
                  )}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={onClose}
                className="rounded-xl text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || form.formState.isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-5 rounded-xl shadow-md transition cursor-pointer"
              >
                {submitting || form.formState.isSubmitting ? (
                  'Registrando...'
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Confirmar Reserva</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReservationModal;
