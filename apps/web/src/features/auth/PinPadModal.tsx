import React, { useState, useEffect } from 'react';
import { X, KeyRound, Mail } from 'lucide-react';
import { useAuthStore, UserInfo } from '@/stores/auth.store';
import { PinPadModalProps, AuthMode } from './types/auth.types';
import { UserAvatarSelector } from './components/UserAvatarSelector';
import { PinDisplay } from './components/PinDisplay';
import { PinPadKeypad } from './components/PinPadKeypad';
import { PasswordLoginForm } from './components/PasswordLoginForm';

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
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>('pin');
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(currentUser);
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVenueUsers();
      setPin('');
      setPassword('');
      setLocalError(null);
    }
  }, [isOpen, fetchVenueUsers]);

  useEffect(() => {
    if (venueUsers.length > 0 && !selectedUser) {
      setSelectedUser(currentUser || venueUsers[0]);
    }
  }, [venueUsers, selectedUser, currentUser]);

  if (!isOpen) return null;

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
    } else {
      setPin('');
      const serverErr = useAuthStore.getState().error;
      setLocalError(serverErr || 'PIN incorrecto. Intente nuevamente.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Por favor complete su correo y contraseña');
      return;
    }
    const success = await loginWithPassword(email, password);
    if (success) {
      setEmail('');
      setPassword('');
      setLocalError(null);
      if (onClose) onClose();
    } else {
      const serverErr = useAuthStore.getState().error;
      setLocalError(serverErr || 'Credenciales incorrectas o usuario inactivo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        {currentUser && !isMandatoryLock && (
          <button
            onClick={() => {
              if (onClose) onClose();
              else useAuthStore.setState({ isLocked: false });
            }}
            title="Cerrar modal"
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            {isMandatoryLock ? 'Terminal de Servicio' : 'Control de Acceso'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Autenticación segura para operadores y administradores
          </p>
        </div>

        {/* Mode switcher */}
        <div className="flex p-1 bg-slate-800/80 border border-slate-700/80 rounded-2xl mb-5 text-xs font-semibold">
          <button
            onClick={() => {
              setAuthMode('pin');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'pin'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Rápido</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('password');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'password'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Correo / Clave</span>
          </button>
        </div>

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
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handlePasswordSubmit}
            isLoading={isLoading}
            error={localError}
          />
        )}
      </div>
    </div>
  );
};

export default PinPadModal;
