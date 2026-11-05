import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldAlert, KeyRound, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore, ContextOption } from '@/stores/auth.store';
import { AuthMode } from './types/auth.types';
import { PinPadKeypad } from './components/PinPadKeypad';
import { PasswordLoginForm } from './components/PasswordLoginForm';
import { AuthModeSwitcher } from './components/AuthModeSwitcher';
import { AccountContextSelector } from './components/AccountContextSelector';
import { PasswordLoginFormValues } from './schemas/auth.schemas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LockScreenProps {
  onUnlocked?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlocked }) => {
  const {
    loginWithDocument,
    selectAuthContext,
    loginWithPassword,
    isLoading,
    unlockScreen,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>('pin');
  const [activeField, setActiveField] = useState<'document' | 'pin'>('document');
  const [documentNumber, setDocumentNumber] = useState('');
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Estado para colaboradores multi-restaurante
  const [selectionToken, setSelectionToken] = useState<string | null>(null);
  const [selectionOptions, setSelectionOptions] = useState<ContextOption[] | null>(null);

  const resetOperativeState = useCallback(() => {
    setDocumentNumber('');
    setPin('');
    setActiveField('document');
    setLocalError(null);
    setSelectionToken(null);
    setSelectionOptions(null);
  }, []);

  const submitDocumentLogin = useCallback(
    async (doc: string, enteredPin: string) => {
      if (!doc || doc.trim().length < 4) {
        setLocalError('Por favor ingrese un número de cédula válido');
        setActiveField('document');
        return;
      }
      if (!enteredPin || enteredPin.length < 4) {
        setLocalError('El PIN debe tener al menos 4 dígitos');
        setActiveField('pin');
        return;
      }

      setLocalError(null);
      const res = await loginWithDocument(doc.trim(), enteredPin);

      if (res.success) {
        if (res.requiresContextSelection && res.options && res.selectionToken) {
          setSelectionToken(res.selectionToken);
          setSelectionOptions(res.options);
        } else {
          resetOperativeState();
          unlockScreen();
          if (onUnlocked) onUnlocked();
        }
      } else {
        setPin('');
        setActiveField('pin');
        setLocalError(res.error || 'Cédula o PIN incorrecto. Intente nuevamente.');
      }
    },
    [loginWithDocument, unlockScreen, onUnlocked, resetOperativeState]
  );

  const handleDigit = useCallback(
    (digit: string) => {
      setLocalError(null);
      if (activeField === 'document') {
        if (documentNumber.length < 15) {
          setDocumentNumber((prev) => prev + digit);
        }
      } else {
        if (pin.length < 6) {
          const nextPin = pin + digit;
          setPin(nextPin);
          // Auto-submit si el PIN llega a 4 dígitos y ya hay cédula
          if (nextPin.length === 4 && documentNumber.length >= 4) {
            submitDocumentLogin(documentNumber, nextPin);
          }
        }
      }
    },
    [activeField, documentNumber, pin, submitDocumentLogin]
  );

  const handleClear = useCallback(() => {
    setLocalError(null);
    if (activeField === 'document') {
      setDocumentNumber('');
    } else {
      setPin('');
    }
  }, [activeField]);

  const handleDelete = useCallback(() => {
    setLocalError(null);
    if (activeField === 'document') {
      setDocumentNumber((prev) => prev.slice(0, -1));
    } else {
      setPin((prev) => prev.slice(0, -1));
    }
  }, [activeField]);

  // Selección de restaurante cuando el colaborador trabaja en múltiples sedes
  const handleSelectOption = async (option: ContextOption) => {
    if (!selectionToken) return;
    const success = await selectAuthContext(
      selectionToken,
      option.userId,
      option.companyId,
      option.venueId
    );
    if (success) {
      resetOperativeState();
      unlockScreen();
      if (onUnlocked) onUnlocked();
    } else {
      setLocalError('No fue posible iniciar turno en el restaurante seleccionado.');
    }
  };

  const handleCancelSelection = () => {
    resetOperativeState();
  };

  // Soporte de teclado físico (números, backspace, enter, tab) y bloqueo de Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (authMode !== 'pin' || selectionOptions !== null || isLoading) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Delete' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeField === 'document' && documentNumber.length >= 4) {
          setActiveField('pin');
        } else if (activeField === 'pin' && pin.length >= 4 && documentNumber.length >= 4) {
          submitDocumentLogin(documentNumber, pin);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveField((prev) => (prev === 'document' ? 'pin' : 'document'));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    authMode,
    selectionOptions,
    isLoading,
    handleDigit,
    handleDelete,
    handleClear,
    activeField,
    documentNumber,
    pin,
    submitDocumentLogin,
  ]);

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

  const handleGoogleLogin = async (idToken: string) => {
    setLocalError(null);
    const success = await useAuthStore.getState().loginWithGoogle(idToken);
    if (success) {
      setLocalError(null);
      unlockScreen();
      if (onUnlocked) onUnlocked();
    } else {
      const serverErr = useAuthStore.getState().error;
      setLocalError(serverErr || 'Error al autenticarse con Google');
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
            <div className="size-11 rounded-2xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center shrink-0 shadow-xs">
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
                Autenticación unificada de estación de trabajo
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-2.5">
            <AuthModeSwitcher
              mode={authMode}
              onModeChange={(m) => {
                setAuthMode(m);
                resetOperativeState();
              }}
            />
          </div>
        </div>

        {/* Contenido según modo y estado */}
        {selectionOptions ? (
          <div className="p-6">
            <AccountContextSelector
              options={selectionOptions}
              onSelect={handleSelectOption}
              onCancel={handleCancelSelection}
              isLoading={isLoading}
            />
          </div>
        ) : authMode === 'pin' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Columna Izquierda: Entradas táctiles de Cédula y PIN */}
            <div className="flex flex-col gap-4">
              <div className="text-left">
                <h3 className="text-sm font-bold text-foreground">
                  Acceso Operativo por Documento
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Digita tu cédula y tu PIN para iniciar turno. El sistema ubicará automáticamente tu restaurante.
                </p>
              </div>

              {localError && (
                <div className="p-3 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-destructive" />
                  <span>{localError}</span>
                </div>
              )}

              {/* Tarjeta de Entrada: Cédula */}
              <button
                type="button"
                onClick={() => {
                  setActiveField('document');
                  setLocalError(null);
                }}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group shadow-xs',
                  activeField === 'document'
                    ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/40'
                    : 'bg-muted/20 border-border/70 hover:bg-muted/40'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'size-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                      activeField === 'document'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border'
                    )}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                      1. Número de Cédula
                    </span>
                    <span
                      className={cn(
                        'text-base font-bold font-mono tracking-wide truncate block',
                        documentNumber ? 'text-foreground' : 'text-muted-foreground/60'
                      )}
                    >
                      {documentNumber || 'Toca para digitar...'}
                    </span>
                  </div>
                </div>

                {activeField === 'document' && (
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>

              {/* Tarjeta de Entrada: PIN */}
              <button
                type="button"
                onClick={() => {
                  setActiveField('pin');
                  setLocalError(null);
                }}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group shadow-xs',
                  activeField === 'pin'
                    ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/40'
                    : 'bg-muted/20 border-border/70 hover:bg-muted/40'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'size-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                      activeField === 'pin'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border'
                    )}
                  >
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                      2. PIN de Seguridad
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'size-3.5 rounded-full border transition-all duration-150',
                            pin.length > idx
                              ? 'bg-primary border-primary scale-110'
                              : 'bg-card border-border/80'
                          )}
                        />
                      ))}
                      {pin.length > 4 && (
                        <span className="text-xs font-mono text-primary font-bold ml-1">
                          +{pin.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {activeField === 'pin' && (
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>

              {/* Botón de acción / alternar */}
              <div className="pt-2">
                {activeField === 'document' ? (
                  <Button
                    type="button"
                    disabled={documentNumber.length < 4}
                    onClick={() => {
                      setActiveField('pin');
                      setLocalError(null);
                    }}
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 cursor-pointer"
                  >
                    Continuar al PIN <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveField('document')}
                      className="h-11 rounded-xl text-xs font-medium gap-1.5 cursor-pointer px-3"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Volver a cédula
                    </Button>
                    <Button
                      type="button"
                      disabled={documentNumber.length < 4 || pin.length < 4 || isLoading}
                      onClick={() => submitDocumentLogin(documentNumber, pin)}
                      className="flex-1 h-11 rounded-xl text-xs font-bold gap-2 cursor-pointer"
                    >
                      {isLoading ? 'Verificando...' : 'Iniciar Turno'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Acceso rápido para administradores */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setLocalError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
                >
                  ¿Eres Administrador o Gerente? Inicia sesión con correo
                </button>
              </div>
            </div>

            {/* Columna Derecha: Teclado táctil Numpad */}
            <div className="flex flex-col items-center justify-center bg-muted/15 border border-border/80 rounded-2xl p-5 shadow-xs">
              <div className="text-center mb-3">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {activeField === 'document'
                    ? 'Digitando Cédula'
                    : 'Digitando PIN de 4 dígitos'}
                </span>
              </div>

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
                <p className="font-semibold text-foreground">Acceso Corporativo para Administradores</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Los roles administrativos y gerenciales deben autenticarse con correo y contraseña.
                </p>
              </div>
            </div>

            <PasswordLoginForm
              onSubmit={handlePasswordSubmit}
              onGoogleSuccess={handleGoogleLogin}
              isLoading={isLoading}
              error={localError}
            />

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin');
                  resetOperativeState();
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 cursor-pointer"
              >
                Volver al acceso operativo por cédula y PIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LockScreen;
