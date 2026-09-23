import { useState } from 'react';
import { usersApi } from '../api/users.api';
import { UserItem, CreateUserPayload, UpdateUserPayload } from '../types/users.types';

export const useUserMutations = (venueId: string, onSuccess: () => void) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleCreateUser = async (payload: CreateUserPayload): Promise<boolean> => {
    setActionError(null);
    setSubmitting(true);
    try {
      await usersApi.createUser(venueId, payload);
      setActionSuccess('Empleado registrado exitosamente');
      onSuccess();
      return true;
    } catch (err: any) {
      setActionError(err.message || 'Error al registrar el empleado');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (userId: string, payload: UpdateUserPayload): Promise<boolean> => {
    setActionError(null);
    setSubmitting(true);
    try {
      await usersApi.updateUser(venueId, userId, payload);
      setActionSuccess('Datos de empleado actualizados');
      onSuccess();
      return true;
    } catch (err: any) {
      setActionError(err.message || 'Error al actualizar el empleado');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPin = async (userId: string, newPin: string, userName: string): Promise<boolean> => {
    setActionError(null);
    setSubmitting(true);
    try {
      await usersApi.resetPin(venueId, userId, newPin);
      setActionSuccess(`PIN de ${userName} restablecido correctamente`);
      return true;
    } catch (err: any) {
      setActionError(err.message || 'Error al restablecer el PIN');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: UserItem): Promise<void> => {
    try {
      if (user.isActive) {
        await usersApi.deleteUser(venueId, user.id);
      } else {
        await usersApi.reactivateUser(venueId, user.id);
      }
      onSuccess();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  return {
    submitting,
    actionError,
    actionSuccess,
    setActionError,
    setActionSuccess,
    handleCreateUser,
    handleUpdateUser,
    handleResetPin,
    handleToggleActive,
  };
};
