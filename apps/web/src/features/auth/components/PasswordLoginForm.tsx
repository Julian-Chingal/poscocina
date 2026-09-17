import React from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

interface PasswordLoginFormProps {
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}

export const PasswordLoginForm: React.FC<PasswordLoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
  error,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in">
      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1 block">Correo Electrónico</label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="email"
            required
            placeholder="admin@poscocina.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1 block">Contraseña</label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
      >
        <LogIn className="w-4 h-4" />
        <span>{isLoading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
      </button>
    </form>
  );
};
