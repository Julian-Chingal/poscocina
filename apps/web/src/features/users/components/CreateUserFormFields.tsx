import React from 'react';
import { KeyRound, Mail, Lock } from 'lucide-react';
import { RoleItem, CreateUserPayload } from '../types/users.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';

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
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-300 block">Nombre Completo *</Label>
        <Input
          type="text"
          required
          placeholder="ej. Laura Sánchez"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-10 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-300 block">Rol en el Restaurante *</Label>
        <Select
          value={formData.roleId || roles[0]?.id || ''}
          onChange={(e) => onChange({ roleId: e.target.value })}
          className="h-10 text-sm"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} ({r.name})
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-300 block">PIN Numérico (4-6 dígitos) *</Label>
        <div className="relative">
          <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
          <Input
            type="password"
            required
            maxLength={6}
            placeholder="ej. 4567"
            value={formData.pin}
            onChange={(e) => onChange({ pin: e.target.value.replace(/\D/g, '') })}
            className="pl-10 font-mono tracking-widest h-10 text-sm"
          />
        </div>
        <span className="text-[10px] text-slate-500 mt-1 block">Clave táctil para comandas y terminales</span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-300 block">
          Correo Electrónico <span className="text-slate-500 font-normal">(Opcional para meseros/cocina)</span>
        </Label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
          <Input
            type="email"
            placeholder="laura@poscocina.com"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="pl-10 h-10 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-300 block">
          Contraseña Maestra <span className="text-slate-500 font-normal">(Obligatorio si tiene correo)</span>
        </Label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onChange({ password: e.target.value })}
            className="pl-10 h-10 text-sm"
          />
        </div>
      </div>
    </>
  );
};
