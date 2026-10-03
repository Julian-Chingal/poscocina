import React from 'react';
import { User, Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-primary" />
          <span>Nombre del Comensal *</span>
        </Label>
        <Input
          type="text"
          required
          placeholder="Ej: Daniel Restrepo"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="h-9 text-xs rounded-xl bg-card border-border/80 focus-visible:ring-primary/40"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-primary" />
          <span>Teléfono de Contacto</span>
        </Label>
        <Input
          type="tel"
          placeholder="Ej: 300 123 4567"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
          className="h-9 text-xs rounded-xl bg-card border-border/80 focus-visible:ring-primary/40 font-mono"
        />
      </div>
    </div>
  );
};

export default CustomerContactFields;
