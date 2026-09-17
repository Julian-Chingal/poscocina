import React from 'react';
import { KeyRound, Mail, Lock } from 'lucide-react';
import { RoleItem, CreateUserPayload } from '../types/users.types';

interface CreateUserFormFieldsProps {
  formData: CreateUserPayload;
  roles: RoleItem[];
  onChange: (updated: Partial<CreateUserPayload>) => void;
}

export const CreateUserFormFields: React.FC<CreateUserFormFieldsProps> = ({
  formData,
  roles,
  onChange,
}) => {
  return (
    <>
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1 block">Nombre Completo *</label>
        <input
          type="text"
          required
          placeholder="ej. Laura Sánchez"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1 block">Rol en el Restaurante *</label>
        <select
          value={formData.roleId || roles[0]?.id || ''}
          onChange={(e) => onChange({ roleId: e.target.value })}
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
        <label className="text-xs font-semibold text-slate-300 mb-1 block">PIN Numérico (4-6 dígitos) *</label>
        <div className="relative">
          <KeyRound className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="password"
            required
            maxLength={6}
            placeholder="ej. 4567"
            value={formData.pin}
            onChange={(e) => onChange({ pin: e.target.value.replace(/\D/g, '') })}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono tracking-widest"
          />
        </div>
        <span className="text-[10px] text-slate-500 mt-1 block">Clave táctil para comandas y terminales</span>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1 block">
          Correo Electrónico <span className="text-slate-500 font-normal">(Opcional para meseros/cocina)</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="email"
            placeholder="laura@poscocina.com"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-300 mb-1 block">
          Contraseña Maestra <span className="text-slate-500 font-normal">(Obligatorio si tiene correo)</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onChange({ password: e.target.value })}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>
    </>
  );
};
