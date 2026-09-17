import { useState } from 'react';
import { reservationsApi } from '../api/reservations.api';
import {
  Reservation,
  CreateReservationPayload,
  TableItem,
} from '../types/reservations.types';

export const useReservationMutations = (onSuccess: () => void) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateReservation = async (
    payload: CreateReservationPayload
  ): Promise<boolean> => {
    if (!payload.customerName.trim()) {
      setErrorMessage('El nombre del comensal es obligatorio');
      return false;
    }
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await reservationsApi.createReservation(payload);
      onSuccess();
      return true;
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar reserva');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    reservationId: string,
    status: 'confirmed' | 'cancelled' | 'no_show'
  ): Promise<void> => {
    try {
      await reservationsApi.updateStatus(reservationId, status);
      onSuccess();
    } catch (err) {
      console.error('Error updating reservation status:', err);
    }
  };

  const handleSeatReservation = async (
    reservation: Reservation,
    waiterId?: string,
    onNavigateToTable?: (table: TableItem) => void
  ): Promise<void> => {
    try {
      await reservationsApi.seatReservation(reservation.id, waiterId);
      onSuccess();
      if (reservation.table && onNavigateToTable) {
        onNavigateToTable(reservation.table);
      }
    } catch (err) {
      console.error('Error seating reservation:', err);
    }
  };

  return {
    submitting,
    errorMessage,
    setErrorMessage,
    handleCreateReservation,
    handleUpdateStatus,
    handleSeatReservation,
  };
};
