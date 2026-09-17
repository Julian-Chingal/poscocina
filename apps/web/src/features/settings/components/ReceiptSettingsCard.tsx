import React from 'react';
import { Printer } from 'lucide-react';
import { PaperWidth } from '../types/settings.types';

interface Props {
  paperWidth: PaperWidth;
  autoPrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
  onFieldChange: (field: any, val: any) => void;
}

export const ReceiptSettingsCard: React.FC<Props> = ({
  paperWidth,
  autoPrintReceipt,
  receiptHeader,
  receiptFooter,
  onFieldChange,
}) => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-5">
    <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-700/60">
      <Printer className="w-5 h-5 text-orange-400" />
      <div>
        <h3 className="font-bold text-white text-base">Configuración de Ticket Térmico</h3>
        <p className="text-xs text-slate-400">Formato compatible con 58mm y 80mm vía USB o Red.</p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Ancho de Papel</label>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {[80, 58].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onFieldChange('paperWidth', w as PaperWidth)}
              className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                paperWidth === w
                  ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <span className="block text-sm">{w} mm</span>
              <span className="text-[10px] text-slate-400">{w === 80 ? '42-48 col' : '32 col'}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center space-x-3 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={autoPrintReceipt}
          onChange={(e) => onFieldChange('autoPrintReceipt', e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
        />
        <div>
          <span className="text-sm font-medium text-white block">Impresión automática al cobrar</span>
          <span className="text-xs text-slate-400 block">Lanza la orden tras registrar el pago exitoso.</span>
        </div>
      </label>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Encabezado de Ticket</label>
        <input
          type="text"
          value={receiptHeader}
          onChange={(e) => onFieldChange('receiptHeader', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pie de Página</label>
        <textarea
          rows={3}
          value={receiptFooter}
          onChange={(e) => onFieldChange('receiptFooter', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>
  </div>
);
