import React from 'react';
import { Shield, KeyRound, Edit2, XCircle, CheckCircle } from 'lucide-react';
import { UserItem } from '../types/users.types';

interface UserCardProps {
  user: UserItem;
  isSelf: boolean;
  onEdit: (user: UserItem) => void;
  onResetPin: (user: UserItem) => void;
  onToggleActive: (user: UserItem) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelf,
  onEdit,
  onResetPin,
  onToggleActive,
}) => {
  const isManager = user.roleHierarchy >= 80;

  return (
    <div
      className={`bg-slate-900 border rounded-3xl p-5 shadow-sm transition flex flex-col justify-between ${
        user.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60 bg-slate-950'
      }`}
    >
      <div>
        {/* Header with Avatar & Role */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black uppercase ${
                isManager
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              {user.name.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{user.name}</span>
                {isSelf && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                    Tú
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>{user.roleLabel}</span>
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              user.isActive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {user.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Details */}
        <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-1.5 text-xs text-slate-400 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Email:</span>
            <span className="font-mono text-slate-300 truncate max-w-[180px]">
              {user.email || '— Sin correo (Solo PIN) —'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Acceso PIN:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>Habilitado (••••)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            title="Editar empleado"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onResetPin(user)}
            title="Restablecer PIN"
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
        </div>

        {!isSelf && (
          <button
            onClick={() => onToggleActive(user)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 text-[11px] ${
              user.isActive
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {user.isActive ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Desactivar</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Reactivar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
