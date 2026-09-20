import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  contact: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  onContactChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onAddressChange: (val: string) => void;
  onNotesChange: (val: string) => void;
}

export const SupplierContactFields: React.FC<Props> = ({
  contact,
  phone,
  email,
  address,
  notes,
  onContactChange,
  onPhoneChange,
  onEmailChange,
  onAddressChange,
  onNotesChange,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-slate-300">Contacto Comercial:</Label>
        <Input
          type="text"
          placeholder="Ej. Carlos Mendoza"
          value={contact}
          onChange={(e) => onContactChange(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-slate-300">Teléfono / WhatsApp:</Label>
        <Input
          type="text"
          placeholder="3101234567"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="h-8 text-xs font-mono"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-slate-300">Correo Electrónico:</Label>
        <Input
          type="email"
          placeholder="facturacion@proveedor.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-slate-300">Dirección Física:</Label>
        <Input
          type="text"
          placeholder="Calle 100 # 15-20"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
    </div>

    <div className="space-y-1.5">
      <Label className="block text-xs font-semibold text-slate-300">Notas de Despacho / Condiciones:</Label>
      <Textarea
        rows={2}
        placeholder="Ej. Entregas martes y jueves, crédito a 15 días"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="text-xs"
      />
    </div>
  </div>
);
