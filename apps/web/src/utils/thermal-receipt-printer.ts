/**
 * Utilidad especializada para impresión física y previsualización de comprobantes térmicos (58mm y 80mm).
 * Garantiza que la impresión del navegador imprima ÚNICAMENTE la tirilla del recibo con márgenes cero,
 * evitando estrictamente que se imprima la interfaz o pantallazos de la aplicación web.
 */

export interface SimulationReceiptOptions {
  mode: 'invoice' | 'precheck' | 'kitchen';
  paperWidth: '58' | '80';
  companyName: string;
  legalName?: string;
  taxId: string;
  venueAddress: string;
  phone: string;
  receiptHeader?: string;
  receiptFooter?: string;
  taxType?: string;
  taxRate?: string;
  defaultTipPct?: string;
  currency?: string;
  logoUrl?: string;
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

/**
 * Genera el HTML semántico y estilizado exclusivamente para la tirilla térmica
 */
export function generateSimulationReceiptHtml(options: SimulationReceiptOptions): string {
  const {
    mode,
    paperWidth,
    companyName,
    legalName = 'poscocina S.A.S.',
    taxId,
    venueAddress,
    phone,
    receiptHeader,
    receiptFooter,
    taxType = 'INC_8',
    taxRate = '8',
    defaultTipPct = '10',
    currency = 'COP',
    logoUrl,
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
  } = options;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-CO');
  const timeFormatted = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // 1. MODO COCINA (COMANDA TÉRMICA)
  if (mode === 'kitchen') {
    return `
      <div class="ticket-header text-center">
        <div class="bold text-lg">*** COCINA CALIENTE ***</div>
        <div class="divider-double"></div>
        <div class="flex-row bold text-sm">
          <span>MESA: M-04</span>
          <span>ORDEN #1042</span>
        </div>
        <div class="flex-row text-xs mt-1">
          <span>Mesero: Carlos M.</span>
          <span>${timeFormatted} • Marcha 1</span>
        </div>
        <div class="divider-double"></div>
      </div>

      <div class="ticket-items my-2">
        <div class="item-block mb-2">
          <div class="flex-row bold text-base">
            <span>[1] LOMO AL TRAPO 300G</span>
          </div>
          <div class="text-xs bold ml-2 mt-05">
            &gt;&gt; TÉRMINO 3/4, SALSA APARTE &lt;&lt;
          </div>
        </div>
        <div class="divider-dashed"></div>

        <div class="item-block mb-2">
          <div class="flex-row bold text-base">
            <span>[2] COPA VINO TINTO</span>
          </div>
        </div>
        <div class="divider-dashed"></div>

        <div class="item-block mb-2">
          <div class="flex-row bold text-base">
            <span>[1] VOLCÁN DE CHOCOLATE</span>
          </div>
          <div class="text-xs ml-2 mt-05">
            Postre • Servir con helado de vainilla
          </div>
        </div>
      </div>

      <div class="divider-double"></div>
      <div class="text-center text-xs bold">
        OBSERVACIÓN: Cliente en terraza
      </div>
      <div class="divider-dashed"></div>
      <div class="text-center text-xxs">
        TIEMPO: 00:00 • TICKETS: 1/1 • poscocina
      </div>
    `;
  }

  // 2. MODO PRE-CUENTA (INFORMATIVO)
  if (mode === 'precheck') {
    return `
      <div class="ticket-header text-center">
        <div class="bold text-base uppercase">${companyName || 'MI RESTAURANTE'}</div>
        <div class="bold text-xs uppercase mt-05">*** PRE-CUENTA DE CONSUMO ***</div>
        <div class="text-xxs italic">Comprobante informativo • No es factura fiscal</div>
        <div class="divider-dashed"></div>
        <div class="flex-row bold text-xs">
          <span>MESA: M-04 (Salón)</span>
          <span>PAX: 3</span>
        </div>
        <div class="flex-row text-xs">
          <span>Mesero: Carlos M.</span>
          <span>Hora: ${timeFormatted}</span>
        </div>
        <div class="divider-dashed"></div>
      </div>

      <div class="ticket-items">
        <div class="flex-row text-xs bold py-05 border-b">
          <span>Cant Descripción</span>
          <span>Total</span>
        </div>
        <div class="flex-row text-xs py-05">
          <span>1x Lomo al Trapo 300g</span>
          <span>$38.000</span>
        </div>
        <div class="flex-row text-xs py-05">
          <span>2x Copa Vino Tinto</span>
          <span>$28.000</span>
        </div>
        <div class="flex-row text-xs py-05">
          <span>1x Volcán de Chocolate</span>
          <span>$12.000</span>
        </div>
      </div>

      <div class="divider-dashed"></div>
      <div class="ticket-totals text-xs space-y-05">
        <div class="flex-row">
          <span>Subtotal Consumo:</span>
          <span>$78.000</span>
        </div>
        <div class="flex-row bold">
          <span>Propina Sugerida (${defaultTipPct}%):</span>
          <span>$7.800</span>
        </div>
        <div class="divider-double"></div>
        <div class="flex-row bold text-base">
          <span>TOTAL CON PROPINA:</span>
          <span>$85.800</span>
        </div>
      </div>

      <div class="mt-2 text-xxs border p-1 text-center">
        <div class="bold uppercase">Sugerencia Voluntaria de Servicio</div>
        <div class="flex-row mt-05">
          <span>10% ($7.800):</span>
          <span class="bold">$85.800</span>
        </div>
        <div class="flex-row">
          <span>15% ($11.700):</span>
          <span class="bold">$89.700</span>
        </div>
      </div>

      <div class="signature-area mt-4 text-center text-xxs">
        <div class="border-top w-75 mx-auto pt-1">
          Firma de conformidad del cliente
        </div>
        <div class="italic mt-1">¡Muchas gracias por acompañarnos hoy!</div>
        <div class="text-xxs mt-05">poscocina POS • ${paperWidth}mm</div>
      </div>
    `;
  }

  // 3. MODO FACTURA DE VENTA OFICIAL
  const taxLabel = taxType === 'INC_8' ? 'Impoconsumo (INC 8%)' : taxType === 'IVA_19' ? 'IVA (19%)' : `Impuesto (${taxRate}%)`;

  return `
    <div class="ticket-header text-center">
      ${showLogoOnReceipt && logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Logo" />` : ''}
      <div class="bold text-base uppercase">${companyName || 'MI RESTAURANTE'}</div>
      <div class="text-xs">${legalName}</div>
      <div class="bold text-xs">NIT: ${taxId || '900.123.456-7'}</div>
      <div class="text-xxs uppercase">Régimen: ${taxType === 'INC_8' ? 'Impuesto al Consumo' : 'Responsable de IVA'}</div>
      
      ${showResolutionOnReceipt && (isInvoiceResolutionEnabled || Boolean(invoiceResolution)) ? `
        <div class="text-xxs border-y py-05 my-05">
          Res. DIAN No. ${invoiceResolution || '18764000123'} del ${invoiceResolutionDate || '2026-01-15'}<br />
          Habilitada del ${invoicePrefix}-${invoiceInitialNumber} al ${invoicePrefix}-${invoiceFinalNumber}
        </div>
      ` : ''}

      <div class="text-xxs">${venueAddress || 'Dirección de la Sede'}</div>
      <div class="text-xxs">Tel: ${phone || '+57 300 000 0000'}</div>
      ${receiptHeader ? `<div class="text-xxs italic mt-05">"${receiptHeader}"</div>` : ''}
      <div class="divider-dashed"></div>
    </div>

    <div class="ticket-meta text-xs">
      <div class="flex-row bold">
        <span>FACTURA: #${invoicePrefix}-00452</span>
        <span>MESA: M-04</span>
      </div>
      <div class="flex-row">
        <span>Fecha: ${dateFormatted} ${timeFormatted}</span>
        <span>Caja: 01</span>
      </div>
      ${showWaiterOnReceipt ? `
        <div class="flex-row">
          <span>Mesero: Carlos M.</span>
          <span>Turno: #01</span>
        </div>
      ` : ''}
      <div class="border-top pt-05 mt-05 text-xxs">
        <span>Cliente: Consumidor Final (222222222222)</span>
      </div>
      <div class="divider-dashed"></div>
    </div>

    <div class="ticket-items">
      <div class="flex-row text-xs bold border-b py-05">
        <span>Cant Descripción</span>
        <span>Total</span>
      </div>
      <div class="item-line py-05">
        <div class="flex-row text-xs bold">
          <span>1x Lomo al Trapo 300g</span>
          <span>$38.000</span>
        </div>
        <div class="text-xxs ml-2 italic">↳ Término 3/4, salsa aparte</div>
      </div>
      <div class="item-line py-05">
        <div class="flex-row text-xs bold">
          <span>2x Copa Vino Tinto</span>
          <span>$28.000</span>
        </div>
        <div class="text-xxs ml-2">(2 x $14.000)</div>
      </div>
      <div class="item-line py-05">
        <div class="flex-row text-xs bold">
          <span>1x Volcán de Chocolate</span>
          <span>$12.000</span>
        </div>
      </div>
    </div>

    <div class="divider-double"></div>

    <div class="ticket-totals text-xs space-y-05">
      ${showTaxBreakdown ? `
        <div class="flex-row">
          <span>Subtotal Neto:</span>
          <span>$72.222</span>
        </div>
        <div class="flex-row">
          <span>${taxLabel}:</span>
          <span>$5.778</span>
        </div>
      ` : ''}
      ${parseFloat(defaultTipPct) > 0 ? `
        <div class="flex-row bold">
          <span>Propina Voluntaria (${defaultTipPct}%):</span>
          <span>$7.800</span>
        </div>
      ` : ''}
      <div class="divider-double"></div>
      <div class="flex-row bold text-base">
        <span>TOTAL A PAGAR:</span>
        <span>$85.800 ${currency}</span>
      </div>
    </div>

    <div class="ticket-payment text-xxs border-top border-dashed pt-1 mt-1 space-y-05">
      <div class="flex-row">
        <span>Forma de Pago:</span>
        <span class="bold">Efectivo</span>
      </div>
      <div class="flex-row">
        <span>Recibido:</span>
        <span>$100.000</span>
      </div>
      <div class="flex-row bold">
        <span>Cambio / Vueltos:</span>
        <span>$14.200</span>
      </div>
    </div>

    ${showQrOnReceipt ? `
      <div class="ticket-qr text-center border-top border-dashed pt-1 mt-1">
        <div class="qr-box">[ CÓDIGO FISCAL DIAN QR ]</div>
        <div class="text-xxs mt-05">CUFE: 8f4a12...92b1a0</div>
        <div class="text-xxs">Valide este comprobante en dian.gov.co</div>
      </div>
    ` : ''}

    <div class="barcode-sim text-center my-1">
      <div class="barcode-bars">||||| | |||| || ||||| | || ||||</div>
      <div class="text-xxs">*POS-00452-${now.getFullYear()}*</div>
    </div>

    <div class="ticket-footer text-center border-top border-dashed pt-1 mt-1 text-xxs">
      <div class="italic bold">${receiptFooter || '¡Gracias por su preferencia!'}</div>
      <div class="mt-05">poscocina POS • Impreso en ${paperWidth}mm</div>
    </div>
  `;
}

/**
 * Imprime un ticket en una ventana / iframe 100% aislada,
 * garantizando que NUNCA se imprima la interfaz o la pantalla del sistema.
 */
export function printThermalReceiptIframe(htmlContent: string, paperWidth: '58' | '80' = '58'): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Eliminar iframe previo si existiese
      const existingIframe = document.getElementById('poscocina-thermal-print-iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'poscocina-thermal-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        console.error('No se pudo acceder al documento del iframe de impresión');
        resolve(false);
        return;
      }

      const printableWidth = paperWidth === '58' ? '48mm' : '72mm';
      const pageSize = paperWidth === '58' ? '58mm auto' : '80mm auto';
      const baseFontSize = paperWidth === '58' ? '11px' : '12px';

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <title>Comprobante POS</title>
            <style>
              @page {
                size: ${pageSize};
                margin: 0mm;
              }
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: ${printableWidth} !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: 'Courier New', Courier, monospace, monospace !important;
                font-size: ${baseFontSize} !important;
                line-height: 1.25 !important;
              }
              .thermal-slip {
                width: ${printableWidth};
                padding: 2mm 1mm;
                margin: 0 auto;
                background: #fff;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .bold { font-weight: bold; }
              .italic { font-style: italic; }
              .uppercase { text-transform: uppercase; }
              .text-xxs { font-size: 8.5px; }
              .text-xs { font-size: 10px; }
              .text-sm { font-size: 11px; }
              .text-base { font-size: 12.5px; }
              .text-lg { font-size: 14px; }
              .flex-row { display: flex; justify-content: space-between; align-items: flex-start; }
              .divider-dashed { border-top: 1px dashed #000; margin: 4px 0; }
              .divider-double { border-top: 2px solid #000; margin: 4px 0; }
              .border-top { border-top: 1px solid #000; }
              .border-b { border-bottom: 1px solid #000; }
              .border-y { border-top: 1px solid #000; border-bottom: 1px solid #000; }
              .border { border: 1px solid #000; }
              .p-1 { padding: 3px; }
              .pt-05 { padding-top: 2px; }
              .pt-1 { padding-top: 4px; }
              .py-05 { padding-top: 2px; padding-bottom: 2px; }
              .my-05 { margin-top: 2px; margin-bottom: 2px; }
              .my-1 { margin-top: 4px; margin-bottom: 4px; }
              .my-2 { margin-top: 6px; margin-bottom: 6px; }
              .mt-05 { margin-top: 2px; }
              .mt-1 { margin-top: 4px; }
              .mt-2 { margin-top: 6px; }
              .mt-4 { margin-top: 12px; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 6px; }
              .ml-2 { margin-left: 8px; }
              .w-75 { width: 75%; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .space-y-05 > * + * { margin-top: 2px; }
              .logo-img { max-width: 40px; max-height: 40px; display: block; margin: 0 auto 3px auto; }
              .qr-box {
                border: 1px solid #000;
                padding: 4px;
                display: inline-block;
                font-weight: bold;
                font-size: 9px;
                margin: 2px 0;
              }
              .barcode-bars {
                font-family: monospace;
                letter-spacing: 2px;
                font-size: 12px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="thermal-slip">
              ${htmlContent}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      // Permitir renderizado antes de disparar diálogo de impresión
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve(true);
        } catch (printErr) {
          console.error('Error al invocar impresión en iframe térmico:', printErr);
          resolve(false);
        }
      }, 300);
    } catch (err) {
      console.error('Fallo en printThermalReceiptIframe:', err);
      resolve(false);
    }
  });
}
