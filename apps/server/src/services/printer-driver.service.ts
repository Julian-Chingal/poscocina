import net from 'net';

export const ESC = '\x1B';
export const GS = '\x1D';

export const CMD = {
  INIT: `${ESC}@`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  DOUBLE_ON: `${GS}!\x11`, // Double width & height
  DOUBLE_HEIGHT: `${GS}!\x01`,
  DOUBLE_WIDTH: `${GS}!\x10`,
  DOUBLE_OFF: `${GS}!\x00`,
  UNDERLINE_ON: `${ESC}-\x01`,
  UNDERLINE_OFF: `${ESC}-\x00`,
  INVERSE_ON: `${GS}B\x01`,
  INVERSE_OFF: `${GS}B\x00`,
  CUT: `${GS}V\x41\x03`, // Feed and full cut
  PARTIAL_CUT: `${GS}V\x42\x03`,
  DRAWER_PULSE: `${ESC}p\x00\x19\xFA`, // 25ms kick pulse pin 2
  FEED_3: '\n\n\n',
  FEED_5: '\n\n\n\n\n',
};

export class PrinterDriverService {
  async sendToNetworkPrinter(
    ip: string,
    port = 9100,
    buffer: Buffer,
    timeoutMs = 3000
  ): Promise<{ success: boolean; error?: string; bytesWritten?: number }> {
    return new Promise((resolve) => {
      if (!ip || ip.trim().length === 0) {
        return resolve({ success: false, error: 'Dirección IP no especificada' });
      }

      const socket = new net.Socket();
      let isResolved = false;

      const finish = (result: { success: boolean; error?: string; bytesWritten?: number }) => {
        if (!isResolved) {
          isResolved = true;
          socket.destroy();
          resolve(result);
        }
      };

      socket.setTimeout(timeoutMs);

      socket.on('connect', () => {
        socket.write(buffer, () => {
          finish({ success: true, bytesWritten: buffer.length });
        });
      });

      socket.on('timeout', () => {
        finish({ success: false, error: `Tiempo de espera agotado al conectar con ${ip}:${port}` });
      });

      socket.on('error', (err) => {
        finish({ success: false, error: `Error de conexión con ${ip}:${port}: ${err.message}` });
      });

      try {
        socket.connect(port, ip.trim());
      } catch (err: any) {
        finish({ success: false, error: err.message });
      }
    });
  }

  padCols(left: string, right: string, width = 42): string {
    const spaceCount = width - left.length - right.length;
    if (spaceCount <= 0) {
      return left.slice(0, Math.max(0, width - right.length - 1)) + ' ' + right;
    }
    return left + ' '.repeat(spaceCount) + right;
  }

  pad3Cols(col1: string, col2: string, col3: string, width = 42): string {
    const c1 = col1.padEnd(4, ' ');
    const c3 = col3.padStart(10, ' ');
    const middleWidth = width - c1.length - c3.length;
    const c2 = col2.length > middleWidth ? col2.slice(0, Math.max(0, middleWidth - 1)) + '.' : col2.padEnd(middleWidth, ' ');
    return c1 + c2 + c3;
  }

  generateKitchenTicket(data: {
    stationName: string;
    orderId: string;
    tableLabel?: string;
    waiterName?: string;
    openedAt: Date;
    notes?: string | null;
    isAppend?: boolean;
    paperWidth?: '58' | '80';
    items: Array<{
      quantity: string | number;
      productName: string;
      notes?: string | null;
      modifiers?: any;
    }>;
  }): { escposBuffer: Buffer; asciiPreview: string } {
    const width = data.paperWidth === '58' ? 32 : 42;
    const divider = '-'.repeat(width) + '\n';

    let raw = CMD.INIT;
    let ascii = '';

    raw += CMD.ALIGN_CENTER;
    raw += CMD.DOUBLE_ON;
    const title = `*** ${data.stationName.toUpperCase()} ***\n`;
    raw += title;
    ascii += title;
    raw += CMD.DOUBLE_OFF;

    if (data.isAppend) {
      raw += CMD.INVERSE_ON + ' *** [ADICION / REORDEN] *** \n' + CMD.INVERSE_OFF;
      ascii += '*** [ADICION / REORDEN] ***\n';
    }

    raw += CMD.ALIGN_LEFT;
    const tableStr = `MESA: ${data.tableLabel || 'BARRA / LLEVAR'}`;
    const waiterStr = `MESERO: ${data.waiterName || 'General'}`;
    raw += CMD.BOLD_ON + this.padCols(tableStr, waiterStr, width) + '\n' + CMD.BOLD_OFF;
    ascii += this.padCols(tableStr, waiterStr, width) + '\n';

    const orderNum = `ORDEN: #${data.orderId.slice(0, 8).toUpperCase()}`;
    const timeStr = `HORA: ${new Date(data.openedAt).toLocaleTimeString('es-CO')}`;
    raw += this.padCols(orderNum, timeStr, width) + '\n';
    ascii += this.padCols(orderNum, timeStr, width) + '\n';

    raw += divider;
    ascii += divider;

    for (const it of data.items) {
      const qtyStr = `${it.quantity}x`;
      raw += CMD.DOUBLE_ON + CMD.BOLD_ON;
      raw += `${qtyStr} ${it.productName}\n`;
      ascii += `${qtyStr} ${it.productName}\n`;
      raw += CMD.DOUBLE_OFF + CMD.BOLD_OFF;

      if (it.notes && it.notes.trim()) {
        const noteStr = `   >> NOTA: ${it.notes.trim()}\n`;
        raw += CMD.BOLD_ON + noteStr + CMD.BOLD_OFF;
        ascii += noteStr;
      }
    }

    if (data.notes && data.notes.trim()) {
      raw += divider;
      ascii += divider;
      const genNotes = `OBSERVACION: ${data.notes.trim()}\n`;
      raw += CMD.BOLD_ON + genNotes + CMD.BOLD_OFF;
      ascii += genNotes;
    }

    raw += divider;
    ascii += divider;
    raw += CMD.ALIGN_CENTER;
    raw += CMD.FEED_3;
    raw += CMD.CUT;

    return {
      escposBuffer: Buffer.from(raw, 'binary'),
      asciiPreview: ascii,
    };
  }

  generateReceiptTicket(data: {
    companyName: string;
    taxId?: string;
    address?: string;
    phone?: string;
    headerNote?: string;
    receiptNumber: string;
    issuedAt: Date;
    tableLabel?: string;
    waiterName?: string;
    customerName?: string;
    customerDoc?: string;
    loyaltyPoints?: number;
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
    tipAmount?: number;
    footerText?: string;
    openDrawer?: boolean;
    paperWidth?: '58' | '80';
    items: Array<{
      quantity: string | number;
      productName: string;
      unitPrice: string | number;
      total: number;
    }>;
    payments: Array<{
      method: string;
      amount: number;
      tipAmount?: number;
    }>;
  }): { escposBuffer: Buffer; asciiPreview: string } {
    const width = data.paperWidth === '58' ? 32 : 42;
    const divider = '-'.repeat(width) + '\n';

    let raw = CMD.INIT;
    let ascii = '';

    raw += CMD.ALIGN_CENTER;
    raw += CMD.DOUBLE_ON + CMD.BOLD_ON + `${data.companyName}\n` + CMD.DOUBLE_OFF + CMD.BOLD_OFF;
    ascii += `${data.companyName}\n`;

    if (data.taxId) {
      raw += `${data.taxId}\n`;
      ascii += `${data.taxId}\n`;
    }
    if (data.address) {
      raw += `${data.address}\n`;
      ascii += `${data.address}\n`;
    }
    if (data.phone) {
      raw += `Tel: ${data.phone}\n`;
      ascii += `Tel: ${data.phone}\n`;
    }
    if (data.headerNote) {
      raw += `"${data.headerNote}"\n`;
      ascii += `"${data.headerNote}"\n`;
    }

    raw += divider;
    ascii += divider;

    raw += CMD.ALIGN_LEFT;
    const rNum = `FACTURA: #${data.receiptNumber}`;
    const rDate = new Date(data.issuedAt).toLocaleDateString('es-CO');
    raw += this.padCols(rNum, rDate, width) + '\n';
    ascii += this.padCols(rNum, rDate, width) + '\n';

    if (data.tableLabel) {
      const mesa = `Mesa: ${data.tableLabel}`;
      const mesero = data.waiterName ? `Mesero: ${data.waiterName}` : '';
      raw += this.padCols(mesa, mesero, width) + '\n';
      ascii += this.padCols(mesa, mesero, width) + '\n';
    }

    if (data.customerName) {
      raw += `Cliente: ${data.customerName}`;
      if (data.customerDoc) raw += ` (${data.customerDoc})`;
      raw += '\n';
      ascii += `Cliente: ${data.customerName}\n`;
      if (data.loyaltyPoints !== undefined && data.loyaltyPoints > 0) {
        raw += `Puntos Fidelidad: ${data.loyaltyPoints} pts\n`;
        ascii += `Puntos Fidelidad: ${data.loyaltyPoints} pts\n`;
      }
    }

    raw += divider;
    ascii += divider;

    raw += CMD.BOLD_ON;
    const tableHeader = this.pad3Cols('CANT', 'PRODUCTO', 'TOTAL', width);
    raw += tableHeader + '\n' + CMD.BOLD_OFF;
    ascii += tableHeader + '\n';
    raw += divider;
    ascii += divider;

    for (const it of data.items) {
      const qStr = `${it.quantity}x`;
      const pStr = `$${Math.round(it.total).toLocaleString('es-CO')}`;
      const line = this.pad3Cols(qStr, it.productName, pStr, width);
      raw += line + '\n';
      ascii += line + '\n';
    }

    raw += divider;
    ascii += divider;

    raw += CMD.ALIGN_RIGHT;
    raw += this.padCols('SUBTOTAL:', `$${Math.round(data.subtotal).toLocaleString('es-CO')}`, width) + '\n';
    ascii += this.padCols('SUBTOTAL:', `$${Math.round(data.subtotal).toLocaleString('es-CO')}`, width) + '\n';

    if (data.taxTotal > 0) {
      raw += this.padCols('IMPUESTOS (INC/IVA):', `$${Math.round(data.taxTotal).toLocaleString('es-CO')}`, width) + '\n';
      ascii += this.padCols('IMPUESTOS (INC/IVA):', `$${Math.round(data.taxTotal).toLocaleString('es-CO')}`, width) + '\n';
    }

    if (data.discountTotal > 0) {
      raw += this.padCols('DESCUENTO:', `-$${Math.round(data.discountTotal).toLocaleString('es-CO')}`, width) + '\n';
      ascii += this.padCols('DESCUENTO:', `-$${Math.round(data.discountTotal).toLocaleString('es-CO')}`, width) + '\n';
    }

    if (data.tipAmount && data.tipAmount > 0) {
      raw += this.padCols('PROPINA VOLUNTARIA:', `$${Math.round(data.tipAmount).toLocaleString('es-CO')}`, width) + '\n';
      ascii += this.padCols('PROPINA VOLUNTARIA:', `$${Math.round(data.tipAmount).toLocaleString('es-CO')}`, width) + '\n';
    }

    raw += CMD.BOLD_ON + CMD.DOUBLE_ON;
    raw += this.padCols('TOTAL:', `$${Math.round(data.total).toLocaleString('es-CO')}`, width) + '\n';
    ascii += this.padCols('TOTAL:', `$${Math.round(data.total).toLocaleString('es-CO')}`, width) + '\n';
    raw += CMD.DOUBLE_OFF + CMD.BOLD_OFF;

    raw += divider;
    ascii += divider;

    raw += CMD.ALIGN_LEFT;
    for (const p of data.payments) {
      const pLine = this.padCols(`Pago (${p.method.toUpperCase()}):`, `$${Math.round(p.amount).toLocaleString('es-CO')}`, width);
      raw += pLine + '\n';
      ascii += pLine + '\n';
    }

    raw += divider;
    ascii += divider;

    raw += CMD.ALIGN_CENTER;
    raw += `${data.footerText || '¡Gracias por su visita!'}\n`;
    ascii += `${data.footerText || '¡Gracias por su visita!'}\n`;

    raw += CMD.FEED_3;
    raw += CMD.CUT;

    if (data.openDrawer) {
      raw += CMD.DRAWER_PULSE;
    }

    return {
      escposBuffer: Buffer.from(raw, 'binary'),
      asciiPreview: ascii,
    };
  }

  generatePreCheckTicket(data: {
    companyName: string;
    tableLabel?: string;
    waiterName?: string;
    subtotal: number;
    taxTotal: number;
    total: number;
    suggestedTip: number;
    totalWithTip: number;
    paperWidth?: '58' | '80';
    items: Array<{
      quantity: string | number;
      productName: string;
      total: number;
    }>;
  }): { escposBuffer: Buffer; asciiPreview: string } {
    const width = data.paperWidth === '58' ? 32 : 42;
    const divider = '-'.repeat(width) + '\n';

    let raw = CMD.INIT;
    let ascii = '';

    raw += CMD.ALIGN_CENTER;
    raw += CMD.DOUBLE_ON + CMD.BOLD_ON + '*** PRE-CUENTA ***\n' + CMD.DOUBLE_OFF + CMD.BOLD_OFF;
    raw += `${data.companyName}\n`;
    raw += 'DOCUMENTO NO VALIDO COMO FACTURA\n';
    ascii += '*** PRE-CUENTA ***\n';

    raw += divider;
    ascii += divider;

    raw += CMD.ALIGN_LEFT;
    const mStr = `Mesa: ${data.tableLabel || 'BARRA'}`;
    const wStr = data.waiterName ? `Atiende: ${data.waiterName}` : '';
    raw += this.padCols(mStr, wStr, width) + '\n';
    ascii += this.padCols(mStr, wStr, width) + '\n';

    raw += divider;
    ascii += divider;

    for (const it of data.items) {
      const qStr = `${it.quantity}x`;
      const pStr = `$${Math.round(it.total).toLocaleString('es-CO')}`;
      const line = this.pad3Cols(qStr, it.productName, pStr, width);
      raw += line + '\n';
      ascii += line + '\n';
    }

    raw += divider;
    ascii += divider;

    raw += CMD.ALIGN_RIGHT;
    raw += this.padCols('SUBTOTAL:', `$${Math.round(data.subtotal).toLocaleString('es-CO')}`, width) + '\n';
    if (data.taxTotal > 0) {
      raw += this.padCols('IMPUESTOS:', `$${Math.round(data.taxTotal).toLocaleString('es-CO')}`, width) + '\n';
    }

    raw += CMD.BOLD_ON;
    raw += this.padCols('SUBTOTAL CUENTA:', `$${Math.round(data.total).toLocaleString('es-CO')}`, width) + '\n';
    raw += CMD.BOLD_OFF;

    raw += this.padCols('PROPINA SUGERIDA (10%):', `$${Math.round(data.suggestedTip).toLocaleString('es-CO')}`, width) + '\n';

    raw += CMD.BOLD_ON + CMD.DOUBLE_ON;
    raw += this.padCols('TOTAL CON PROPINA:', `$${Math.round(data.totalWithTip).toLocaleString('es-CO')}`, width) + '\n';
    raw += CMD.DOUBLE_OFF + CMD.BOLD_OFF;

    raw += divider;
    raw += CMD.ALIGN_CENTER;
    raw += 'La propina es voluntaria.\nGracias por su preferencia.\n';
    raw += CMD.FEED_3;
    raw += CMD.CUT;

    return {
      escposBuffer: Buffer.from(raw, 'binary'),
      asciiPreview: ascii,
    };
  }

  generateShiftSummaryTicket(data: {
    companyName: string;
    venueName: string;
    cashierName: string;
    shiftNumber: number;
    openedAt: Date;
    closedAt: Date;
    initialCash: number;
    cashSales: number;
    cardSales: number;
    transferSales: number;
    totalSales: number;
    totalTips: number;
    expectedCash: number;
    actualCash: number;
    discrepancy: number;
    paperWidth?: '58' | '80';
  }): { escposBuffer: Buffer; asciiPreview: string } {
    const width = data.paperWidth === '58' ? 32 : 42;
    const divider = '-'.repeat(width) + '\n';

    let raw = CMD.INIT;
    let ascii = '';

    raw += CMD.ALIGN_CENTER;
    raw += CMD.DOUBLE_ON + CMD.BOLD_ON + '*** CIERRE DE CAJA ***\n' + CMD.DOUBLE_OFF + CMD.BOLD_OFF;
    raw += `${data.companyName} - ${data.venueName}\n`;
    raw += `TURNO #${data.shiftNumber}\n`;
    ascii += `*** CIERRE DE CAJA TURNO #${data.shiftNumber} ***\n`;

    raw += divider;
    ascii += divider;

    raw += CMD.ALIGN_LEFT;
    raw += `CAJERO: ${data.cashierName}\n`;
    raw += `APERTURA: ${new Date(data.openedAt).toLocaleString('es-CO')}\n`;
    raw += `CIERRE:   ${new Date(data.closedAt).toLocaleString('es-CO')}\n`;

    raw += divider;
    ascii += divider;

    raw += CMD.BOLD_ON + 'VENTAS POR MEDIO DE PAGO:\n' + CMD.BOLD_OFF;
    raw += this.padCols('  Efectivo:', `$${Math.round(data.cashSales).toLocaleString('es-CO')}`, width) + '\n';
    raw += this.padCols('  Tarjetas:', `$${Math.round(data.cardSales).toLocaleString('es-CO')}`, width) + '\n';
    raw += this.padCols('  Transferencias:', `$${Math.round(data.transferSales).toLocaleString('es-CO')}`, width) + '\n';
    raw += divider;
    raw += CMD.BOLD_ON;
    raw += this.padCols('TOTAL VENTAS:', `$${Math.round(data.totalSales).toLocaleString('es-CO')}`, width) + '\n';
    raw += this.padCols('PROPINAS TOTALES:', `$${Math.round(data.totalTips).toLocaleString('es-CO')}`, width) + '\n';
    raw += CMD.BOLD_OFF;

    raw += divider;
    ascii += divider;

    raw += CMD.BOLD_ON + 'ARQUEO DE EFECTIVO EN CAJA:\n' + CMD.BOLD_OFF;
    raw += this.padCols('  Base Inicial:', `$${Math.round(data.initialCash).toLocaleString('es-CO')}`, width) + '\n';
    raw += this.padCols('  Ventas Efectivo:', `$${Math.round(data.cashSales).toLocaleString('es-CO')}`, width) + '\n';
    raw += this.padCols('EFECTIVO ESPERADO:', `$${Math.round(data.expectedCash).toLocaleString('es-CO')}`, width) + '\n';
    raw += this.padCols('EFECTIVO REAL DECLARADO:', `$${Math.round(data.actualCash).toLocaleString('es-CO')}`, width) + '\n';

    const discLabel = data.discrepancy === 0 ? 'DESCUADRE (CUADRADA):' : data.discrepancy > 0 ? 'SOBRANTE (+):' : 'FALTANTE (-):';
    raw += CMD.BOLD_ON;
    raw += this.padCols(discLabel, `$${Math.round(data.discrepancy).toLocaleString('es-CO')}`, width) + '\n';
    raw += CMD.BOLD_OFF;

    raw += divider;
    raw += CMD.ALIGN_CENTER;
    raw += 'FIRMA RESPONSABLE DE CAJA\n\n\n______________________________\n';
    raw += CMD.FEED_3;
    raw += CMD.CUT;

    return {
      escposBuffer: Buffer.from(raw, 'binary'),
      asciiPreview: ascii,
    };
  }

  generateTestTicket(printerName: string, ip?: string | null, paperWidth: '58' | '80' = '80'): {
    escposBuffer: Buffer;
    asciiPreview: string;
  } {
    const width = paperWidth === '58' ? 32 : 42;
    const divider = '-'.repeat(width) + '\n';

    let raw = CMD.INIT;
    raw += CMD.ALIGN_CENTER;
    raw += CMD.DOUBLE_ON + CMD.BOLD_ON + 'TEST DE IMPRESION\n' + CMD.DOUBLE_OFF + CMD.BOLD_OFF;
    raw += 'poscocina ESC/POS Direct Driver\n';
    raw += divider;

    raw += CMD.ALIGN_LEFT;
    raw += `Impresora: ${printerName}\n`;
    if (ip) raw += `IP LAN: ${ip}:9100\n`;
    raw += `Ancho Papel: ${paperWidth}mm (${width} columnas)\n`;
    raw += `Fecha: ${new Date().toLocaleString('es-CO')}\n`;
    raw += divider;

    raw += CMD.ALIGN_CENTER;
    raw += '¡CONEXION EXITOSA!\n';
    raw += 'Listo para comandas y facturacion.\n';
    raw += CMD.FEED_3;
    raw += CMD.CUT;

    return {
      escposBuffer: Buffer.from(raw, 'binary'),
      asciiPreview: `TEST DE IMPRESION - ${printerName} (${paperWidth}mm)`,
    };
  }
}

export const printerDriverService = new PrinterDriverService();
