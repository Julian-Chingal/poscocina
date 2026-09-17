import React from 'react';
import { PrinterFormData } from '../types/settings.types';

interface Props {
  formData: PrinterFormData;
  onChange: (patch: Partial<PrinterFormData>) => void;
}

export const PrinterFlagsFields: React.FC<Props> = ({ formData, onChange }) => (
  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
    <label className="flex items-center space-x-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.autoPrintOnOrder}
        onChange={(e) => onChange({ autoPrintOnOrder: e.target.checked })}
        className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
      />
      <span className="text-slate-300 font-medium">Imprimir comanda al marchar pedido</span>
    </label>
    <label className="flex items-center space-x-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.autoPrintOnPayment}
        onChange={(e) => onChange({ autoPrintOnPayment: e.target.checked })}
        className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
      />
      <span className="text-slate-300 font-medium">Imprimir factura al registrar pago</span>
    </label>
    <label className="flex items-center space-x-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.openDrawerOnPrint}
        onChange={(e) => onChange({ openDrawerOnPrint: e.target.checked })}
        className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
      />
      <span className="text-slate-300 font-medium">Pulso eléctrico de apertura de gaveta</span>
    </label>
  </div>
);
