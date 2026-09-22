import React from 'react';
import { Printer, UtensilsCrossed } from 'lucide-react';
import { PaperWidth, TaxType } from '../types/settings.types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface Props {
  paperWidth: PaperWidth;
  logoUrl: string;
  primaryColor: string;
  companyName: string;
  taxId: string;
  venueAddress: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  currency: string;
}

export const ReceiptPreviewCard: React.FC<Props> = ({
  paperWidth,
  logoUrl,
  primaryColor,
  companyName,
  taxId,
  venueAddress,
  phone,
  receiptHeader,
  receiptFooter,
  taxType,
  taxRate,
  defaultTipPct,
  currency,
}) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-3 border-b border-border">
      <CardTitle className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Printer className="w-4 h-4" />
        <span>Vista Previa {paperWidth}mm</span>
      </CardTitle>
    </CardHeader>

    <CardContent className="pt-4">
      <div
        className={`bg-amber-50 text-slate-900 rounded-2xl p-5 shadow-2xl border border-amber-200/60 font-mono text-xs space-y-3 select-none mx-auto ${
          paperWidth === 58 ? 'max-w-[260px] text-[10px]' : 'max-w-sm'
        }`}
      >
      <div className="text-center border-b border-dashed border-slate-400 pb-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1.5" />
        ) : (
          <div
            className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <UtensilsCrossed className="w-4 h-4" />
          </div>
        )}
        <div className="font-black text-xs uppercase">{companyName || 'MI RESTAURANTE'}</div>
        <div className="text-[10px] text-slate-600">NIT: {taxId}</div>
        <div className="text-[9px] text-slate-500">{venueAddress}</div>
        <div className="text-[9px] text-slate-500">Tel: {phone}</div>
        {receiptHeader && <div className="text-[9px] italic text-slate-600 mt-1">"{receiptHeader}"</div>}
      </div>

      <div className="space-y-0.5 py-1 border-b border-dashed border-slate-400 text-[10px]">
        <div className="flex justify-between">
          <span>Factura: #00452</span>
          <span>Mesa: M-01</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Fecha: 16/09/2026 12:45</span>
          <span>Turno: #12</span>
        </div>
      </div>

      <div className="space-y-1 py-1.5 border-b border-dashed border-slate-400 text-[10px]">
        <div className="flex justify-between">
          <span>1x Lomo al Trapo 300g</span>
          <span>$38.000</span>
        </div>
        <div className="flex justify-between">
          <span>2x Copa de Vino Tinto</span>
          <span>$28.000</span>
        </div>
      </div>

      <div className="space-y-0.5 pt-1 text-[10px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>$61.111</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>{taxType === 'INC_8' ? 'INC (8%)' : `Impuesto (${taxRate}%)`}:</span>
          <span>$4.889</span>
        </div>
        {parseFloat(defaultTipPct) > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Propina Sugerida ({defaultTipPct}%):</span>
            <span>$6.600</span>
          </div>
        )}
        <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-400">
          <span>TOTAL:</span>
          <span>$72.600 {currency}</span>
        </div>
      </div>

      <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[9px] text-slate-600">
        <p>{receiptFooter}</p>
        <p className="mt-1 text-[8px] text-slate-400">poscocina POS • Impreso en {paperWidth}mm</p>
      </div>
    </div>
    </CardContent>
  </Card>
);
