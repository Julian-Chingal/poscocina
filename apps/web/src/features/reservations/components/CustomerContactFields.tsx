import React from 'react';
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
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="block text-xs font-medium text-muted-foreground">Nombre *</Label>
        <Input
          type="text"
          required
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="h-9 text-xs"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="block text-xs font-medium text-muted-foreground">Teléfono</Label>
        <Input
          type="tel"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
          className="h-9 text-xs font-mono"
        />
      </div>
    </div>
  );
};
