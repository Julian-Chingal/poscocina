import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { SupplierDocType } from '../types/inventory.types';
import { SupplierContactFields } from './SupplierContactFields';

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    documentType: SupplierDocType;
    documentNumber: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => Promise<void>;
}

export const NewSupplierModal: React.FC<Props> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [docType, setDocType] = useState<SupplierDocType>('NIT');
  const [docNum, setDocNum] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      documentType: docType,
      documentNumber: docNum,
      contactName: contact,
      phone,
      email,
      address,
      notes,
    });
    setName('');
    setDocNum('');
    setContact('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>Registrar Nuevo Proveedor</span>
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre o Razón Social: *</label>
            <input
              type="text"
              required
              placeholder="Ej. Distribuidora de Carnes La Sabana S.A.S"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo Doc: *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as SupplierDocType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="NIT">NIT</option>
                <option value="RUT">RUT</option>
                <option value="CC">Cédula (CC)</option>
                <option value="CE">Cédula Extranjería</option>
                <option value="Passport">Pasaporte</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número Documento / NIT: *</label>
              <input
                type="text"
                required
                placeholder="901234567-1"
                value={docNum}
                onChange={(e) => setDocNum(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <SupplierContactFields
            contact={contact}
            phone={phone}
            email={email}
            address={address}
            notes={notes}
            onContactChange={setContact}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onAddressChange={setAddress}
            onNotesChange={setNotes}
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
