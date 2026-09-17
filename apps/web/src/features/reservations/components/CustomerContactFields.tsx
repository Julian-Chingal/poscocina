import React from 'react';

interface CustomerContactFieldsProps {
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (phone: string) => void;
}

export const CustomerContactFields: React.FC<CustomerContactFieldsProps> = ({
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Nombre *</label>
        <input
          type="text"
          required
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono</label>
        <input
          type="tel"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
        />
      </div>
    </div>
  );
};
