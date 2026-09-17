import React, { useState, useEffect } from 'react';
import { Delete, X, AlertCircle, KeyRound, Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore, UserInfo } from '../stores/auth.store';

interface PinPadModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatoryLock?: boolean;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  isMandatoryLock = false,
}) => {
  const { venueUsers, currentUser, fetchVenueUsers, loginWithPin, loginWithPassword, isLoading, error } = useAuthStore();
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');

  // PIN state
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(currentUser);
  const [pin, setPin] = useState('');

  // Password state
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
      // Auto-submit if 4 digits
      if (nextPin.length === 4 && selectedUser) {
        submitPin(selectedUser.id, nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setLocalError(null);
  };

  const handleClear = () => {
    setPin('');
    setLocalError(null);
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
              if (onClose) {
                onClose();
              } else {
                useAuthStore.setState({ isLocked: false });
              }
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

        {/* Auth Mode Tabs (PIN vs Password) */}
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
            <Lock className="w-3.5 h-3.5" />
            <span>Email & Contraseña</span>
          </button>
        </div>

        {/* Error Alert */}
        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* MODE 1: PIN Rápido */}
        {authMode === 'pin' && (
          <>
            {/* User Selection Chips */}
            <div className="mb-5">
              <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 block">
                Seleccionar Empleado
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {(venueUsers.length > 0 ? venueUsers : [currentUser || { id: 'demo-admin', name: 'Carlos Gerente', roleName: 'manager', roleLabel: 'Gerente' }]).map((u) => {
                  const isSelected = selectedUser?.id === u?.id;
                  return (
                    <button
                      key={u?.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setPin('');
                        setLocalError(null);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {u?.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate leading-tight">{u?.name}</p>
                        <span className="text-[10px] text-slate-400">{u?.roleLabel || u?.roleName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PIN Display Dots */}
            <div className="flex justify-center items-center gap-4 mb-5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    pin.length > idx
                      ? 'bg-amber-400 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                      : 'border-2 border-slate-700 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  disabled={isLoading}
                  onClick={() => handleDigit(num.toString())}
                  className="h-13 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-xl font-bold text-slate-200 border border-slate-700/80 shadow-sm transition active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                disabled={isLoading}
                onClick={handleClear}
                className="h-13 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:bg-slate-700 text-xs font-semibold text-slate-400 border border-slate-800 shadow-sm transition active:scale-95"
              >
                C
              </button>
              <button
                disabled={isLoading}
                onClick={() => handleDigit('0')}
                className="h-13 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-xl font-bold text-slate-200 border border-slate-700/80 shadow-sm transition active:scale-95"
              >
                0
              </button>
              <button
                disabled={isLoading}
                onClick={handleDelete}
                className="h-13 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-800 shadow-sm transition active:scale-95"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* MODE 2: Email & Password */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. gerente@poscocina.com"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Contraseña Maestra
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Autenticando...' : 'Iniciar Sesión'}</span>
            </button>
          </form>
        )}

        {currentUser && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">
              Sesión activa: <strong className="text-slate-200">{currentUser.name}</strong>
            </span>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                if (onClose) onClose();
              }}
              className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition hover:underline"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
