import React from 'react';
import { Printer } from 'lucide-react';
import { PaperWidth } from '../types/settings.types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

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
  <Card className="shadow-sm">
    <CardHeader className="pb-4 border-b border-slate-800">
      <div className="flex items-center space-x-2.5">
        <Printer className="w-5 h-5 text-orange-400" />
        <div>
          <CardTitle className="text-base">Configuración de Ticket Térmico</CardTitle>
          <CardDescription className="text-xs">Formato compatible con 58mm y 80mm vía USB o Red.</CardDescription>
        </div>
      </div>
    </CardHeader>

    <CardContent className="pt-6 space-y-4">
      <div className="space-y-2">
        <Label className="block text-xs font-semibold text-slate-300">Ancho de Papel</Label>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {[80, 58].map((w) => (
            <Button
              key={w}
              variant="ghost"
              type="button"
              onClick={() => onFieldChange('paperWidth', w as PaperWidth)}
              className={`p-3 h-auto rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                paperWidth === w
                  ? 'border-orange-500 bg-orange-500/10 text-white font-bold hover:bg-orange-500/20'
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="block text-sm">{w} mm</span>
              <span className="text-[10px] text-slate-400 font-normal">{w === 80 ? '42-48 col' : '32 col'}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <Switch
          id="autoPrintReceipt"
          checked={autoPrintReceipt}
          onCheckedChange={(checked) => onFieldChange('autoPrintReceipt', checked)}
        />
        <Label htmlFor="autoPrintReceipt" className="cursor-pointer">
          <span className="text-sm font-medium text-white block">Impresión automática al cobrar</span>
          <span className="text-xs text-slate-400 block font-normal">Lanza la orden tras registrar el pago exitoso.</span>
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-slate-300">Encabezado de Ticket</Label>
        <Input
          type="text"
          value={receiptHeader}
          onChange={(e) => onFieldChange('receiptHeader', e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-slate-300">Pie de Página</Label>
        <Textarea
          rows={3}
          value={receiptFooter}
          onChange={(e) => onFieldChange('receiptFooter', e.target.value)}
          className="text-sm"
        />
      </div>
    </CardContent>
  </Card>
);
