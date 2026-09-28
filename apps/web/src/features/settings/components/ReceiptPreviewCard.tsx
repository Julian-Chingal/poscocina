import React, { useState } from 'react';
import { Printer, UtensilsCrossed, Play, QrCode, FileText, ChefHat, Receipt } from 'lucide-react';
import { PaperWidth, TaxType } from '../types/settings.types';
import { usbPrinterService } from '@/services/usb-printer.service';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sileo';
import { cn } from '@/lib/utils';

interface Props {
  paperWidth: PaperWidth;
  logoUrl: string;
  primaryColor: string;
  companyName: string;
  legalName?: string;
  taxId: string;
  venueAddress: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  currency: string;
  showLogoOnReceipt?: boolean;
  showQrOnReceipt?: boolean;
  showWaiterOnReceipt?: boolean;
  showTaxBreakdown?: boolean;
  showResolutionOnReceipt?: boolean;
  isInvoiceResolutionEnabled?: boolean;
  invoicePrefix?: string;
  invoiceResolution?: string;
  invoiceInitialNumber?: string;
  invoiceFinalNumber?: string;
  invoiceResolutionDate?: string;
}

type PreviewMode = 'invoice' | 'precheck' | 'kitchen';

export const ReceiptPreviewCard: React.FC<Props> = ({
  paperWidth,
  logoUrl,
  primaryColor,
  companyName,
  legalName = 'poscocina S.A.S.',
  taxId,
  venueAddress,
  phone,
  receiptHeader,
  receiptFooter,
  taxType,
  taxRate,
  defaultTipPct,
  currency,
  showLogoOnReceipt = true,
  showQrOnReceipt = true,
  showWaiterOnReceipt = true,
  showTaxBreakdown = true,
  showResolutionOnReceipt = true,
  isInvoiceResolutionEnabled = false,
  invoicePrefix = 'POS',
  invoiceResolution = '18764000123',
  invoiceInitialNumber = '1',
  invoiceFinalNumber = '50000',
  invoiceResolutionDate = '2026-01-15',
}) => {
  const [mode, setMode] = useState<PreviewMode>('invoice');
  const [isPrintingSim, setIsPrintingSim] = useState(false);

  const is58 = paperWidth === 58;

  const handleTestPrint = async () => {
    const modeLabel =
      mode === 'invoice'
        ? 'Factura de Venta'
        : mode === 'precheck'
        ? 'Pre-cuenta de Mesa'
        : 'Comanda de Cocina';

    setIsPrintingSim(true);
    try {
      const res = await usbPrinterService.printSimulationReceipt({
        mode,
        paperWidth: is58 ? '58' : '80',
        companyName,
        taxId,
        venueAddress,
        phone,
        receiptHeader,
        receiptFooter,
      });

      if (res.success) {
        toast.success(`¡${modeLabel} impresa físicamente con éxito por cable USB!`);
      } else {
        toast.info(`${res.message} Mostrando diálogo nativo del sistema...`);
        window.print();
      }
    } catch (err: any) {
      toast.error(`Error al imprimir simulación: ${err?.message || 'Error general'}`);
    } finally {
      setIsPrintingSim(false);
    }
  };

  return (
    <Card className="shadow-sm border-border bg-card flex flex-col justify-between">
      <div>
        <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Printer className="w-4 h-4 text-primary" />
              <span>Simulación Térmica</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 text-primary border-primary/30 font-bold">
              {is58 ? '58mm (32 Col)' : '80mm (48 Col)'}
            </Badge>
          </div>

          {/* Selector de Modo de Comprobante */}
          <div className="flex items-center gap-1 mt-3 p-1 rounded-xl bg-muted/60 border border-border/80">
            <button
              type="button"
              onClick={() => setMode('invoice')}
              className={cn(
                'flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer',
                mode === 'invoice'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Receipt className="w-3 h-3" />
              <span>Factura</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('precheck')}
              className={cn(
                'flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer',
                mode === 'precheck'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="w-3 h-3" />
              <span>Pre-Cuenta</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('kitchen')}
              className={cn(
                'flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer',
                mode === 'kitchen'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ChefHat className="w-3 h-3" />
              <span>Cocina</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Contenedor del Papel Térmico */}
          <div
            className={cn(
              'relative mx-auto my-1 transition-all duration-300',
              is58 ? 'max-w-[250px]' : 'max-w-[315px]'
            )}
          >
            {/* Cuerpo del Recibo */}
            <div className="bg-[#fffefb] text-zinc-900 rounded-t-xl shadow-xl border border-zinc-200/90 font-mono text-[10.5px] p-4 select-none space-y-2.5">
              
              {/* =========================================
                  MODO 1: FACTURA DE VENTA OFICIAL
                  ========================================= */}
              {mode === 'invoice' && (
                <>
                  {/* Encabezado */}
                  <div className="text-center pb-2 space-y-1">
                    {showLogoOnReceipt && (
                      logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain mx-auto mb-1 rounded" />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-lg mx-auto mb-1 flex items-center justify-center text-white shadow-xs"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                        </div>
                      )
                    )}
                    <div className="font-black text-sm uppercase tracking-wide text-zinc-950">
                      {companyName || 'MI RESTAURANTE'}
                    </div>
                    <div className="text-[9.5px] text-zinc-600 font-sans">{legalName}</div>
                    <div className="text-[10px] font-bold text-zinc-800">
                      NIT: {taxId || '900.123.456-7'}
                    </div>
                    <div className="text-[8.5px] text-zinc-500 uppercase tracking-tight">
                      Régimen: {taxType === 'INC_8' ? 'Impuesto al Consumo' : 'Responsable de IVA'}
                    </div>

                    {showResolutionOnReceipt && (isInvoiceResolutionEnabled || Boolean(invoiceResolution)) && (
                      <div className="text-[8px] text-zinc-500 font-sans leading-tight border-y border-zinc-200 py-1 my-1">
                        Res. DIAN No. {invoiceResolution || '18764000123'} del {invoiceResolutionDate || '2026-01-15'}<br />
                        Habilitada del {invoicePrefix || 'POS'}-{invoiceInitialNumber || '1'} al {invoicePrefix || 'POS'}-{invoiceFinalNumber || '50000'}
                      </div>
                    )}

                    <div className="text-[9px] text-zinc-500 font-sans">{venueAddress || 'Dirección de la Sede'}</div>
                    <div className="text-[9px] text-zinc-500">Tel: {phone || '+57 300 000 0000'}</div>
                    {receiptHeader && (
                      <div className="text-[9px] italic text-zinc-600 pt-0.5 font-serif">
                        "{receiptHeader}"
                      </div>
                    )}
                  </div>

                  {/* Separador Térmico */}
                  <div className="text-[9px] text-center text-zinc-400 font-mono tracking-tighter">
                    - - - - - - - - - - - - - - - - - - - - -
                  </div>

                  {/* Metadatos de Factura */}
                  <div className="space-y-0.5 text-[9.5px]">
                    <div className="flex justify-between font-black text-zinc-950">
                      <span>FACTURA: #{invoicePrefix}-00452</span>
                      <span>MESA: M-04</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Fecha: 26/09/2026 21:40</span>
                      <span>Caja: 01</span>
                    </div>
                    {showWaiterOnReceipt && (
                      <div className="flex justify-between text-zinc-600">
                        <span>Mesero: Carlos M.</span>
                        <span>Turno: #01</span>
                      </div>
                    )}
                    <div className="text-zinc-600 pt-0.5 border-t border-zinc-200/80">
                      <span>Cliente: Consumidor Final (222222222222)</span>
                    </div>
                  </div>

                  {/* Encabezado de Columnas */}
                  <div className="border-t border-b border-zinc-400 py-0.5 text-[9px] font-bold flex justify-between text-zinc-700 uppercase">
                    <span>Cant Descripción</span>
                    <span>Total</span>
                  </div>

                  {/* Ítems */}
                  <div className="space-y-1.5 py-1 text-[10px]">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold">1x Lomo al Trapo 300g</span>
                        <span className="font-bold shrink-0">$38.000</span>
                      </div>
                      <span className="text-[8.5px] text-zinc-500 pl-3 block italic">
                        ↳ Término 3/4, salsa aparte
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold">2x Copa Vino Tinto</span>
                        <span className="font-bold shrink-0">$28.000</span>
                      </div>
                      <span className="text-[8.5px] text-zinc-500 pl-3 block">
                        (2 x $14.000)
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="font-bold">1x Volcán de Chocolate</span>
                      <span className="font-bold shrink-0">$12.000</span>
                    </div>
                  </div>

                  {/* Separador Doble */}
                  <div className="text-[9px] text-center text-zinc-400 font-mono tracking-tighter">
                    = = = = = = = = = = = = = = = = = = = = =
                  </div>

                  {/* Totales y Desglose Financiero */}
                  <div className="space-y-1 text-[9.5px] text-zinc-600">
                    {showTaxBreakdown && (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal Neto:</span>
                          <span>$72.222</span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            {taxType === 'INC_8'
                              ? 'Impoconsumo (INC 8%):'
                              : taxType === 'IVA_19'
                              ? 'IVA (19%):'
                              : `Impuesto (${taxRate}%):`}
                          </span>
                          <span>$5.778</span>
                        </div>
                      </>
                    )}

                    {parseFloat(defaultTipPct) > 0 && (
                      <div className="flex justify-between text-zinc-800 font-semibold">
                        <span>Propina Voluntaria ({defaultTipPct}%):</span>
                        <span>$7.800</span>
                      </div>
                    )}

                    <div className="flex justify-between font-black text-xs pt-1.5 border-t-2 border-zinc-950 text-zinc-950">
                      <span>TOTAL A PAGAR:</span>
                      <span className="text-sm font-extrabold">$85.800 {currency}</span>
                    </div>
                  </div>

                  {/* Pago */}
                  <div className="py-1 text-[9px] border-t border-dashed border-zinc-300 text-zinc-600 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Forma de Pago:</span>
                      <span className="font-bold text-zinc-800">Efectivo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recibido:</span>
                      <span>$100.000</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-800">
                      <span>Cambio / Vueltos:</span>
                      <span>$14.200</span>
                    </div>
                  </div>

                  {/* Código QR Fiscal / DIAN */}
                  {showQrOnReceipt && (
                    <div className="pt-2 text-center space-y-1 border-t border-dashed border-zinc-300">
                      <div className="w-16 h-16 mx-auto bg-zinc-900 p-1.5 rounded flex items-center justify-center">
                        <QrCode className="w-full h-full text-white" />
                      </div>
                      <p className="text-[7.5px] text-zinc-500 font-mono leading-tight">
                        CUFE: 8f4a12...92b1a0<br />
                        Valide este comprobante en dian.gov.co
                      </p>
                    </div>
                  )}

                  {/* Código de Barras Simulado */}
                  <div className="pt-1 text-center">
                    <div className="flex items-center justify-center gap-0.5 h-6">
                      {[4, 2, 6, 2, 4, 8, 2, 4, 2, 6, 4, 2, 8, 4, 2, 6, 2, 4].map((h, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-900 w-[2px]"
                          style={{ height: `${12 + (h % 10)}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[7.5px] tracking-widest text-zinc-500 font-mono block mt-0.5">
                      *POS-00452-2026*
                    </span>
                  </div>

                  {/* Pie de Página */}
                  <div className="text-center pt-2 border-t border-dashed border-zinc-300 text-[8.5px] text-zinc-500 font-sans space-y-1">
                    <p className="italic font-medium">{receiptFooter || '¡Gracias por su preferencia!'}</p>
                    <p className="text-[7.5px] text-zinc-400">
                      poscocina POS • Impreso en {paperWidth}mm
                    </p>
                  </div>
                </>
              )}

              {/* =========================================
                  MODO 2: PRE-CUENTA DE MESA (COMANDA DE COBRO)
                  ========================================= */}
              {mode === 'precheck' && (
                <>
                  <div className="text-center pb-1 space-y-0.5">
                    <div className="font-black text-xs uppercase tracking-wide text-zinc-950">
                      {companyName || 'MI RESTAURANTE'}
                    </div>
                    <div className="text-[9px] font-bold text-amber-700 bg-amber-500/10 py-0.5 px-2 rounded uppercase tracking-wider">
                      *** PRE-CUENTA DE CONSUMO ***
                    </div>
                    <div className="text-[8px] text-zinc-500 italic">
                      Comprobante informativo • No es factura fiscal
                    </div>
                  </div>

                  <div className="space-y-0.5 text-[9.5px] border-y border-dashed border-zinc-300 py-1">
                    <div className="flex justify-between font-black text-zinc-950">
                      <span>MESA: M-04 (Salón)</span>
                      <span>PAX: 3</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Mesero: Carlos M.</span>
                      <span>Hora: 21:40</span>
                    </div>
                  </div>

                  <div className="space-y-1 py-1 text-[10px]">
                    <div className="flex justify-between">
                      <span>1x Lomo al Trapo 300g</span>
                      <span className="font-bold">$38.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2x Copa Vino Tinto</span>
                      <span className="font-bold">$28.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Volcán de Chocolate</span>
                      <span className="font-bold">$12.000</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-400 pt-1 space-y-1 text-[9.5px]">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal Consumo:</span>
                      <span>$78.000</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-800">
                      <span>Propina Sugerida ({defaultTipPct}%):</span>
                      <span>$7.800</span>
                    </div>
                    <div className="flex justify-between font-black text-xs pt-1 border-t border-zinc-950 text-zinc-950">
                      <span>TOTAL CON PROPINA:</span>
                      <span className="text-sm font-extrabold">$85.800</span>
                    </div>
                  </div>

                  {/* Tabla de sugerencia de propina */}
                  <div className="p-2 rounded bg-zinc-100 border border-zinc-200 text-[8.5px] space-y-1">
                    <span className="font-bold text-zinc-700 block text-center uppercase tracking-tight">
                      Sugerencia Voluntaria de Servicio
                    </span>
                    <div className="flex justify-between">
                      <span>10% ($7.800):</span>
                      <span className="font-bold">$85.800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>15% ($11.700):</span>
                      <span className="font-bold">$89.700</span>
                    </div>
                  </div>

                  <div className="pt-3 text-[8.5px] text-zinc-500 space-y-4">
                    <div className="border-b border-zinc-400 w-3/4 mx-auto pb-1 text-center">
                      Firma de conformidad del cliente
                    </div>
                    <p className="text-center italic text-[8px]">
                      ¡Muchas gracias por acompañarnos hoy!
                    </p>
                  </div>
                </>
              )}

              {/* =========================================
                  MODO 3: COMANDA DE COCINA (TICKET KITCHEN)
                  ========================================= */}
              {mode === 'kitchen' && (
                <>
                  <div className="text-center pb-1 space-y-1 border-b-2 border-zinc-950">
                    <div className="font-black text-base uppercase tracking-wider text-zinc-950">
                      COCINA CALIENTE
                    </div>
                    <div className="flex justify-between text-xs font-black bg-zinc-900 text-white px-2 py-1 rounded">
                      <span>MESA: M-04</span>
                      <span>ORDEN #1042</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-700 pt-0.5">
                      <span>Mesero: Carlos M.</span>
                      <span>21:40 • Marcha 1</span>
                    </div>
                  </div>

                  <div className="space-y-3 py-2">
                    <div className="border-b border-dashed border-zinc-300 pb-2">
                      <div className="text-sm font-black text-zinc-950 flex items-start gap-1.5">
                        <span className="px-1.5 py-0.2 bg-zinc-900 text-white rounded text-xs">1</span>
                        <span>LOMO AL TRAPO 300G</span>
                      </div>
                      <div className="text-[10px] font-bold text-red-600 pl-5 mt-0.5">
                        &gt;&gt; TÉRMINO 3/4, SALSA APARTE &lt;&lt;
                      </div>
                    </div>

                    <div className="border-b border-dashed border-zinc-300 pb-2">
                      <div className="text-sm font-black text-zinc-950 flex items-start gap-1.5">
                        <span className="px-1.5 py-0.2 bg-zinc-900 text-white rounded text-xs">1</span>
                        <span>VOLCÁN DE CHOCOLATE</span>
                      </div>
                      <div className="text-[10px] font-semibold text-zinc-600 pl-5 mt-0.5">
                        Postre • Servir con helado de vainilla
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2 border-t-2 border-zinc-950 text-[9px] font-bold text-zinc-800">
                    TIEMPO TRANSCURRIDO: 00:00 • TICKETS: 1/1
                  </div>
                </>
              )}

            </div>

            {/* Borde dentado inferior en zigzag */}
            <div
              className="h-3 w-full bg-[#fffefb] shadow-lg border-x border-zinc-200/90"
              style={{
                clipPath:
                  'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)',
              }}
            />
          </div>

          {/* Botón de Test de Impresión */}
          <div className="pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPrintingSim}
              onClick={handleTestPrint}
              className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-border hover:bg-muted"
            >
              <Play className={`w-3.5 h-3.5 text-emerald-500 ${isPrintingSim ? 'animate-spin' : ''}`} />
              <span>
                {isPrintingSim
                  ? 'Imprimiendo en dispositivo...'
                  : `Simular Impresión de ${mode === 'invoice' ? 'Factura' : mode === 'precheck' ? 'Pre-cuenta' : 'Comanda'}`}
              </span>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
