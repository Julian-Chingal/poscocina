import React, { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { TableItem, CreateReservationPayload, Customer } from '../types/reservations.types';
import { CustomerAutocompleteField } from './CustomerAutocompleteField';
import { CustomerContactFields } from './CustomerContactFields';
import { ReservationDateTimeFields } from './ReservationDateTimeFields';

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
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [tableId, setTableId] = useState('');
  const [formDate, setFormDate] = useState(defaultDate);
  const [formTime, setFormTime] = useState('19:00');
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerId(customer.id);
    if (customer.phone) setCustomerPhone(customer.phone);
    if (customer.email) setCustomerEmail(customer.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reservationDateTime = new Date(`${formDate}T${formTime}:00`);
    const success = await onSubmit({
      venueId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      customerId,
      tableId: tableId || undefined,
      reservationTime: reservationDateTime.toISOString(),
      guestCount: Number(guestCount),
      notes: notes.trim() || undefined,
    });

    if (success) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerId(undefined);
      setTableId('');
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-pink-500" />
            <span>Nueva Reserva de Mesa</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomerAutocompleteField
            venueId={venueId}
            onSelectCustomer={handleSelectCustomer}
          />

          <CustomerContactFields
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
          />

          <ReservationDateTimeFields
            formDate={formDate}
            onDateChange={setFormDate}
            formTime={formTime}
            onTimeChange={setFormTime}
            guestCount={guestCount}
            onGuestCountChange={setGuestCount}
            tableId={tableId}
            onTableIdChange={setTableId}
            tables={tables}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notas / Ocasión</label>
            <textarea
              rows={2}
              placeholder="Ej: Cumpleaños, aniversario..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Registrando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
