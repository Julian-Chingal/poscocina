import React from 'react';

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
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Contacto Comercial:</label>
        <input
          type="text"
          placeholder="Ej. Carlos Mendoza"
          value={contact}
          onChange={(e) => onContactChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / WhatsApp:</label>
        <input
          type="text"
          placeholder="3101234567"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico:</label>
        <input
          type="email"
          placeholder="facturacion@proveedor.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección Física:</label>
        <input
          type="text"
          placeholder="Calle 100 # 15-20"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        />
      </div>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">Notas de Despacho / Condiciones:</label>
      <textarea
        rows={2}
        placeholder="Ej. Entregas martes y jueves, crédito a 15 días"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
      />
    </div>
  </div>
);
