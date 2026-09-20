import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import { useAuthStore, UserInfo } from '@/stores/auth.store';
import { PinPadModalProps, AuthMode } from './types/auth.types';
import { UserAvatarSelector } from './components/UserAvatarSelector';
import { PinDisplay } from './components/PinDisplay';
import { PinPadKeypad } from './components/PinPadKeypad';
import { PasswordLoginForm } from './components/PasswordLoginForm';
import { AuthModeSwitcher } from './components/AuthModeSwitcher';
import { PasswordLoginFormValues } from './schemas/auth.schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  isMandatoryLock = false,
}) => {
  const {
    venueUsers,
    currentUser,
    fetchVenueUsers,
    loginWithPin,
    loginWithPassword,
    isLoading,
    unlockScreen,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>('pin');
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(currentUser);
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVenueUsers();
      setPin('');
      setLocalError(null);
    }
  }, [isOpen, fetchVenueUsers]);

  useEffect(() => {
    if (venueUsers.length > 0 && !selectedUser) {
      setSelectedUser(currentUser || venueUsers[0]);
    }
  }, [venueUsers, selectedUser, currentUser]);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setLocalError(null);
      if (nextPin.length === 4 && selectedUser) {
        submitPin(selectedUser.id, nextPin);
      }
    }
  };

  const submitPin = async (userId: string, enteredPin: string) => {
    const success = await loginWithPin(userId, enteredPin);
    if (success) {
      setPin('');
      setLocalError(null);
      if (onClose) onClose();
      else unlockScreen();
    } else {
      setPin('');
      const serverErr = useAuthStore.getState().error;
      setLocalError(serverErr || 'PIN incorrecto. Intente nuevamente.');
    }
  };

  const handlePasswordSubmit = async (values: PasswordLoginFormValues) => {
    const success = await loginWithPassword(values.email, values.password);
    if (success) {
      setLocalError(null);
      if (onClose) onClose();
      else unlockScreen();
    } else {
      const serverErr = useAuthStore.getState().error;
      setLocalError(serverErr || 'Credenciales incorrectas o usuario inactivo');
    }
  };

  const handleClose = () => {
    if (currentUser && !isMandatoryLock) {
      if (onClose) onClose();
      else unlockScreen();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        maxWidth="md"
        onClose={currentUser && !isMandatoryLock ? handleClose : undefined}
      >
        <DialogHeader className="text-center sm:text-center pr-0">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {isMandatoryLock ? 'Terminal de Servicio' : 'Control de Acceso'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Autenticación segura para operadores y administradores
          </DialogDescription>
        </DialogHeader>

        <AuthModeSwitcher
          mode={authMode}
          onModeChange={(m) => {
            setAuthMode(m);
            setLocalError(null);
          }}
        />

        {authMode === 'pin' ? (
          <div>
            <UserAvatarSelector
              users={venueUsers}
              selectedUser={selectedUser}
              onSelectUser={(u) => {
                setSelectedUser(u);
                setPin('');
                setLocalError(null);
              }}
            />

            <PinDisplay pin={pin} error={localError} isLoading={isLoading} />

            <PinPadKeypad
              onDigit={handleDigit}
              onClear={() => {
                setPin('');
                setLocalError(null);
              }}
              onDelete={() => {
                setPin((prev) => prev.slice(0, -1));
                setLocalError(null);
              }}
            />
          </div>
        ) : (
          <PasswordLoginForm
            onSubmit={handlePasswordSubmit}
            isLoading={isLoading}
            error={localError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PinPadModal;
