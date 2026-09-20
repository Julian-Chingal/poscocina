import React from 'react';
import { PrinterFormData } from '../types/settings.types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Props {
  formData: PrinterFormData;
  onChange: (patch: Partial<PrinterFormData>) => void;
}

export const PrinterFlagsFields: React.FC<Props> = ({ formData, onChange }) => (
  <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
    <div className="flex items-center space-x-2.5">
      <Switch
        id="autoPrintOnOrder"
        checked={formData.autoPrintOnOrder}
        onCheckedChange={(checked) => onChange({ autoPrintOnOrder: checked })}
      />
      <Label htmlFor="autoPrintOnOrder" className="text-slate-300 font-medium cursor-pointer">
        Imprimir comanda al marchar pedido
      </Label>
    </div>
    <div className="flex items-center space-x-2.5">
      <Switch
        id="autoPrintOnPayment"
        checked={formData.autoPrintOnPayment}
        onCheckedChange={(checked) => onChange({ autoPrintOnPayment: checked })}
      />
      <Label htmlFor="autoPrintOnPayment" className="text-slate-300 font-medium cursor-pointer">
        Imprimir factura al registrar pago
      </Label>
    </div>
    <div className="flex items-center space-x-2.5">
      <Switch
        id="openDrawerOnPrint"
        checked={formData.openDrawerOnPrint}
        onCheckedChange={(checked) => onChange({ openDrawerOnPrint: checked })}
      />
      <Label htmlFor="openDrawerOnPrint" className="text-slate-300 font-medium cursor-pointer">
        Pulso eléctrico de apertura de gaveta
      </Label>
    </div>
  </div>
);
