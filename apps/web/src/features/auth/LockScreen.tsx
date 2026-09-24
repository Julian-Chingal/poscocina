import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuthStore, UserInfo } from '@/stores/auth.store';
import { AuthMode } from './types/auth.types';
import { UserAvatarSelector } from './components/UserAvatarSelector';
import { PinDisplay } from './components/PinDisplay';
import { PinPadKeypad } from './components/PinPadKeypad';
import { PasswordLoginForm } from './components/PasswordLoginForm';
import { AuthModeSwitcher } from './components/AuthModeSwitcher';
import { PasswordLoginFormValues } from './schemas/auth.schemas';
import { PIN_RESTRICTED_HIERARCHY } from '@poscocina/shared';
import { VenueSelector } from './components/VenueSelector';

interface LockScreenProps {
  onUnlocked?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlocked }) => {
  const {
    venueUsers,
    fetchVenueUsers,
    availableVenues,
    selectedVenueId,
    setSelectedVenueId,
    fetchPublicVenues,
    loginWithPin,
    loginWithPassword,
    isLoading,
    unlockScreen,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>('pin');
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const currentVenueName = availableVenues.find((v) => v.id === selectedVenueId)?.name;

  // Cargar sedes públicas al montar
  useEffect(() => {
    fetchPublicVenues();
    setPin('');
    setLocalError(null);
  }, [fetchPublicVenues]);

  // Sincronizar usuarios cuando la sede seleccionada cambie
  useEffect(() => {
    if (selectedVenueId) {
      fetchVenueUsers(selectedVenueId);
      setSelectedUser(null);
      setPin('');
      setLocalError(null);
    }
  }, [selectedVenueId, fetchVenueUsers]);

  const handleVenueChange = useCallback(
    (newVenueId: string) => {
      setSelectedVenueId(newVenueId);
      setSelectedUser(null);
      setPin('');
      setLocalError(null);
    },
    [setSelectedVenueId]
  );

  // Filtrar usuarios operativos disponibles para PIN (Defense in Depth)
  const operativeUsers = venueUsers.filter((u) => {
    const isRestrictedByRole =
      u.roleName === 'manager' ||
      u.roleName === 'super_admin' ||
      u.role === 'manager' ||
      u.role === 'super_admin';
    const isRestrictedByHierarchy =
      u.hierarchy !== undefined && u.hierarchy >= PIN_RESTRICTED_HIERARCHY && u.hierarchy > 10;
    return !isRestrictedByRole && !isRestrictedByHierarchy;
  });

  // Preseleccionar el primer usuario operativo si no hay seleccionado
  useEffect(() => {
    if (operativeUsers.length > 0) {
      const isSelectedValid = selectedUser && operativeUsers.some((u) => u.id === selectedUser.id);
      if (!isSelectedValid) {
        setSelectedUser(operativeUsers[0]);
      }
    }
  }, [operativeUsers, selectedUser]);

  const submitPin = useCallback(
    async (userId: string, enteredPin: string) => {
      const userVenueId = selectedUser?.venueId || selectedVenueId || undefined;
      const success = await loginWithPin(userId, enteredPin, userVenueId);
      if (success) {
        setPin('');
        setLocalError(null);
        unlockScreen();
        if (onUnlocked) onUnlocked();
      } else {
        setPin('');
        const serverErr = useAuthStore.getState().error;
        setLocalError(serverErr || 'PIN incorrecto. Intente nuevamente.');
      }
    },
    [loginWithPin, unlockScreen, onUnlocked, selectedUser, selectedVenueId]
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length < 6) {
        const nextPin = pin + digit;
        setPin(nextPin);
        setLocalError(null);
        if (nextPin.length === 4 && selectedUser) {
          submitPin(selectedUser.id, nextPin);
        }
      }
    },
    [pin, selectedUser, submitPin]
  );

  const handleClear = useCallback(() => {
    setPin('');
    setLocalError(null);
  }, []);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setLocalError(null);
  }, []);

  // Soporte de teclado físico (números, backspace) y bloqueo estricto de Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear cierre de modal con tecla Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (authMode !== 'pin' || isLoading) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Delete' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [authMode, isLoading, handleDigit, handleDelete, handleClear]);

  const handlePasswordSubmit = async (values: PasswordLoginFormValues) => {
    const success = await loginWithPassword(values.email, values.password);
    if (success) {
      setLocalError(null);
      unlockScreen();
      if (onUnlocked) onUnlocked();
    } else {
      const serverErr = useAuthStore.getState().error;
      setLocalError(serverErr || 'Credenciales incorrectas o usuario inactivo');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lockscreen-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Cabecera común */}
        <div className="px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="lockscreen-title"
                className="text-lg font-bold text-foreground leading-tight"
              >
                Terminal de Servicio
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Autenticación y reanudación de estación de trabajo
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <VenueSelector
              venues={availableVenues}
              selectedVenueId={selectedVenueId}
              onVenueChange={handleVenueChange}
              disabled={isLoading}
            />
            <AuthModeSwitcher
              mode={authMode}
              onModeChange={(m) => {
                setAuthMode(m);
                setLocalError(null);
                setPin('');
              }}
            />
          </div>
        </div>

        {/* Contenido según modo de autenticación */}
        {authMode === 'pin' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Columna Izquierda: Selector de usuarios con scroll vertical contenido */}
            <div className="bg-muted/15 border border-border/60 rounded-2xl p-4 flex flex-col min-h-[360px]">
              <UserAvatarSelector
                users={venueUsers}
                selectedUser={selectedUser}
                venueName={currentVenueName}
                onSelectUser={(u) => {
                  setSelectedUser(u);
                  setPin('');
                  setLocalError(null);
                }}
                onSwitchToPasswordLogin={() => {
                  setAuthMode('password');
                  setLocalError(null);
                }}
              />
            </div>

            {/* Columna Derecha: Indicador de usuario seleccionado + PIN Display + Numpad */}
            <div className="flex flex-col items-center justify-center bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
              {selectedUser ? (
                <div className="w-full max-w-xs mb-3 flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shrink-0">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-foreground">
                      {selectedUser.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                      {selectedUser.roleLabel || selectedUser.roleName}
                    </p>
                  </div>
                  <KeyRound className="w-4 h-4 text-primary shrink-0 opacity-70" />
                </div>
              ) : (
                <div className="w-full max-w-xs mb-3 p-2 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                  Selecciona tu usuario a la izquierda para digitar el PIN
                </div>
              )}

              <PinDisplay
                pin={pin}
                error={localError}
                isLoading={isLoading}
              />

              <div className="w-full">
                <PinPadKeypad
                  onDigit={handleDigit}
                  onClear={handleClear}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 max-w-md mx-auto w-full">
            <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Acceso de Seguridad para Administradores</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Por políticas de seguridad RBAC, los roles administrativos y gerenciales deben autenticarse con correo y contraseña.
                </p>
              </div>
            </div>

            <PasswordLoginForm
              onSubmit={handlePasswordSubmit}
              isLoading={isLoading}
              error={localError}
            />

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin');
                  setLocalError(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 cursor-pointer"
              >
                Volver a la selección de PIN rápido para operadores
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LockScreen;
