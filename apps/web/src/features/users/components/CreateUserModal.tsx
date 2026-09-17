import React, { useState } from 'react';
import { UserPlus, X, AlertCircle } from 'lucide-react';
import { RoleItem, CreateUserPayload } from '../types/users.types';
import { CreateUserFormFields } from './CreateUserFormFields';

interface CreateUserModalProps {
  isOpen: boolean;
  roles: RoleItem[];
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<boolean>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  roles,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: '',
    email: '',
    roleId: roles[0]?.id || '',
    pin: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit({
      ...formData,
      email: formData.email || undefined,
      password: formData.password || undefined,
    });
    if (success) {
      setFormData({
        name: '',
        email: '',
        roleId: roles[0]?.id || '',
        pin: '',
        password: '',
      });
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
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Nuevo Empleado</h2>
            <p className="text-xs text-slate-400">Asigne nombre, rol y clave PIN de acceso</p>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CreateUserFormFields
            formData={formData}
            roles={roles}
            onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
          />

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
              {submitting ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
