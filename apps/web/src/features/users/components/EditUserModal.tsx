import React, { useState, useEffect } from 'react';
import { Edit2, X, AlertCircle } from 'lucide-react';
import { UserItem, RoleItem, UpdateUserPayload } from '../types/users.types';

interface EditUserModalProps {
  user: UserItem | null;
  roles: RoleItem[];
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (userId: string, payload: UpdateUserPayload) => Promise<boolean>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  roles,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email || '',
        roleId: user.roleId,
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(user.id, {
      name: formData.name,
      email: formData.email || undefined,
      roleId: formData.roleId,
      isActive: user.isActive,
    });
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Edit2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Editar Empleado</h2>
            <p className="text-xs text-slate-400">{user.name}</p>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Nombre Completo *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Rol Asignado *</label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} ({r.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
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
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
            >
              {submitting ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
