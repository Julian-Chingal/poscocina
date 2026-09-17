import React, { useState } from 'react';
import { KeyRound, X, AlertCircle } from 'lucide-react';
import { UserItem } from '../types/users.types';

interface ResetPinModalProps {
  user: UserItem | null;
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (userId: string, pin: string, userName: string) => Promise<boolean>;
}

export const ResetPinModal: React.FC<ResetPinModalProps> = ({
  user,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const [pin, setPin] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    const success = await onSubmit(user.id, pin, user.name);
    if (success) {
      setPin('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold">Cambiar PIN</h2>
          <p className="text-xs text-slate-400">
            Nuevo código PIN de 4 a 6 dígitos para <strong>{user.name}</strong>
          </p>
        </div>

        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              required
              maxLength={6}
              autoFocus
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 text-center text-xl text-white font-mono tracking-widest focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || pin.length < 4}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Asignar PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
