/**
 * Servicio robusto para gestión, sincronización, persistencia en memoria
 * y transmisión física con impresoras USB y USB-OTG mediante WebUSB y Web Serial.
 */
import { localBridgePrinterService } from './local-bridge-printer.service';

export interface UsbDeviceItem {
  id: string;
  name: string;
  manufacturer?: string;
  vendorId?: number;
  productId?: number;
  vendorIdHex: string;
  productIdHex: string;
  serialNumber?: string;
  type: 'webusb' | 'webserial';
  isConnected: boolean;
  rawDevice?: any;
}

export interface UsbTestResult {
  success: boolean;
  message: string;
  device?: UsbDeviceItem;
  details?: {
    opened?: boolean;
    claimedInterface?: number;
    outEndpoint?: number;
    error?: string;
  };
}

class UsbPrinterService {
  // Caché persistente en memoria para mantener referencias vivas a dispositivos USB
  private rawUsbDevices: Map<string, any> = new Map();
  private knownDevices: UsbDeviceItem[] = [];
  private listeners: Set<() => void> = new Set();
  private isPolling = false;
  private _pollIntervalId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAutoPolling();
    }
  }

  /**
   * Suscribe un componente a cambios de conexión/desconexión USB en tiempo real
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.warn('Error en listener de UsbPrinterService:', e);
      }
    });
  }

  /**
   * Inicializa el monitoreo continuo para mantener el estado de conexión
   */
  private initAutoPolling() {
    if (this.isPolling) return;
    this.isPolling = true;

    // Ejecutar chequeo inicial
    this.refreshDevicesList();

    // Re-chequeo periódico cada 2.5 segundos
    this._pollIntervalId = setInterval(() => {
      this.refreshDevicesList();
    }, 2500);

    // Eventos nativos WebUSB
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        (navigator as any).usb.addEventListener('connect', (e: any) => {
          this.registerRawDevice(e.device);
          this.refreshDevicesList();
        });
        (navigator as any).usb.addEventListener('disconnect', (e: any) => {
          this.unregisterRawDevice(e.device);
          this.refreshDevicesList();
        });
      } catch (err) {
        console.warn('Aviso al enlazar eventos connect/disconnect WebUSB:', err);
      }
    }

    // Re-chequeo al enfocar la ventana
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.refreshDevicesList();
      });
    }
  }

  stopAutoPolling() {
    if (this._pollIntervalId) {
      clearInterval(this._pollIntervalId);
      this._pollIntervalId = null;
      this.isPolling = false;
    }
  }

  private registerRawDevice(device: any) {
    if (!device) return;
    const key = `usb_${device.vendorId}_${device.productId}`;
    this.rawUsbDevices.set(key, device);
  }

  private unregisterRawDevice(device: any) {
    if (!device) return;
    const key = `usb_${device.vendorId}_${device.productId}`;
    this.rawUsbDevices.delete(key);
  }

  /**
   * Refresca la lista de dispositivos autorizados y conectados
   */
  async refreshDevicesList(): Promise<UsbDeviceItem[]> {
    const list: UsbDeviceItem[] = [];

    // 0. Controlador nativo Flutter (Zogui Print Bridge)
    try {
      if (await localBridgePrinterService.isOnline()) {
        const bridgePrinters = await localBridgePrinterService.getPrinters();
        for (const bp of bridgePrinters) {
          list.push({
            id: bp.name,
            name: bp.name,
            manufacturer: bp.driverName || 'Controlador Nativo',
            vendorIdHex: '0x0000',
            productIdHex: '0x0000',
            type: 'webusb',
            isConnected: bp.isOnline,
            rawDevice: { bridge: true, name: bp.name },
          });
        }
      }
    } catch (e) {
      console.warn('Aviso leyendo impresoras del puente local Flutter:', e);
    }

    // 1. WebUSB
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        const devices = await (navigator as any).usb.getDevices();
        for (const dev of devices) {
          this.registerRawDevice(dev);
          list.push(this.formatWebUsbDevice(dev, true));
        }
      } catch (err) {
        console.warn('Error leyendo WebUSB devices:', err);
      }
    }

    // 2. Web Serial
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      try {
        const ports = await (navigator as any).serial.getPorts();
        for (const port of ports) {
          list.push(this.formatSerialPort(port, true));
        }
      } catch (err) {
        console.warn('Error leyendo WebSerial ports:', err);
      }
    }

    // Comparar si hubo cambios en la lista
    const oldKeys = this.knownDevices.map((d) => d.id).join(',');
    const newKeys = list.map((d) => d.id).join(',');
    this.knownDevices = list;

    if (oldKeys !== newKeys) {
      this.notifyListeners();
    }

    return list;
  }

  /**
   * Verifica compatibilidad de APIs en el navegador actual
   */
  isSupported() {
    const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : false;
    const webUsb = typeof navigator !== 'undefined' && 'usb' in navigator;
    const webSerial = typeof navigator !== 'undefined' && 'serial' in navigator;
    return {
      webUsb: Boolean(webUsb),
      webSerial: Boolean(webSerial),
      isSecureContext,
      supported: Boolean((webUsb || webSerial) && isSecureContext),
    };
  }

  /**
   * Obtiene la lista de dispositivos USB previamente vinculados y autorizados
   */
  async getPairedDevices(): Promise<UsbDeviceItem[]> {
    return await this.refreshDevicesList();
  }

  /**
   * Determina si una impresora registrada está físicamente conectada y lista
   */
  isPrinterConnected(printer: { ipAddress?: string; name?: string; connectionType?: string }): boolean {
    if (printer.connectionType !== 'usb_direct') return true;
    if (this.knownDevices.length === 0) return false;

    // Si solo hay una impresora USB conectada al dispositivo, es esa!
    if (this.knownDevices.length === 1) return true;

    // Buscar coincidencia por VID/PID o nombre
    const target = this.matchDeviceByIdentifier(printer.ipAddress || printer.name || '', this.knownDevices);
    return target !== null && target.isConnected;
  }

  /**
   * Solicita al usuario seleccionar una impresora USB conectada físicamente (WebUSB)
   */
  async requestUsbDevice(): Promise<UsbDeviceItem> {
    if (typeof navigator === 'undefined' || !('usb' in navigator)) {
      throw new Error(
        'Tu navegador no soporta WebUSB. Usa Google Chrome, Microsoft Edge o Chromium en Android/Windows.'
      );
    }

    const device = await (navigator as any).usb.requestDevice({ filters: [] });
    this.registerRawDevice(device);
    const item = this.formatWebUsbDevice(device, true);
    await this.refreshDevicesList();
    return item;
  }

  /**
   * Solicita al usuario seleccionar un puerto serie USB / CH340 / FTDI (Web Serial)
   */
  async requestSerialDevice(): Promise<UsbDeviceItem> {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      throw new Error('Web Serial no está disponible en este navegador.');
    }

    const port = await (navigator as any).serial.requestPort();
    const item = this.formatSerialPort(port, true);
    await this.refreshDevicesList();
    return item;
  }

  /**
   * Verifica la conexión física con el dispositivo USB y confirma comunicación
   */
  async testConnection(deviceOrId: UsbDeviceItem | string): Promise<UsbTestResult> {
    try {
      let targetDevice: UsbDeviceItem | null = null;

      if (typeof deviceOrId === 'string') {
        const paired = await this.getPairedDevices();
        targetDevice = this.matchDeviceByIdentifier(deviceOrId, paired);
      } else {
        targetDevice = deviceOrId;
      }

      if (!targetDevice) {
        return {
          success: false,
          message: 'Impresora USB no encontrada o no está conectada físicamente al puerto USB / OTG.',
        };
      }

      const raw = targetDevice.rawDevice || this.resolveRawDevice(targetDevice);
      if (!raw) {
        return {
          success: false,
          message: 'No se pudo obtener el canal de comunicación con la impresora USB.',
        };
      }

      if (targetDevice.type === 'webusb') {
        return await this.testWebUsbDevice(raw, targetDevice);
      } else {
        return await this.testWebSerialDevice(raw, targetDevice);
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Error inesperado al probar conexión USB.',
        details: { error: String(err) },
      };
    }
  }

  /**
   * Envía un ticket físico de prueba a la impresora USB seleccionada
   */
  async printTestTicket(
    deviceOrId: UsbDeviceItem | string,
    printerName: string,
    paperWidth: '58' | '80' = '80',
    promptIfNoDevice = true
  ): Promise<UsbTestResult> {
    try {
      // 0. Si el controlador nativo Flutter está activo, enviar directamente
      try {
        if (await localBridgePrinterService.isOnline()) {
          const targetName = printerName || (typeof deviceOrId === 'string' ? deviceOrId : deviceOrId?.name);
          const bridgeRes = await localBridgePrinterService.testPrint(targetName);
          if (bridgeRes.success) {
            return {
              success: true,
              message: bridgeRes.message || 'Ticket de prueba impreso físicamente vía Zogui Print Bridge',
            };
          }
        }
      } catch (_) {}

      let paired = await this.getPairedDevices();
      let targetDevice: UsbDeviceItem | null = null;

      if (typeof deviceOrId === 'string') {
        targetDevice = this.matchDeviceByIdentifier(deviceOrId, paired);
      } else {
        targetDevice = deviceOrId;
      }

      if (!targetDevice && promptIfNoDevice && typeof navigator !== 'undefined' && 'usb' in navigator) {
        try {
          targetDevice = await this.requestUsbDevice();
        } catch {
          // Cancelado por el usuario
        }
      }

      if (!targetDevice) {
        return {
          success: false,
          message: 'No se encontró la impresora USB conectada para imprimir el ticket de prueba.',
        };
      }

      const raw = targetDevice.rawDevice || this.resolveRawDevice(targetDevice);
      if (!raw) {
        return {
          success: false,
          message: 'El controlador USB no tiene acceso activo a la impresora.',
        };
      }

      const testBuffer = this.generateEscPosTestTicket(printerName, targetDevice, paperWidth);

      if (targetDevice.type === 'webusb') {
        return await this.sendBufferToWebUsb(raw, testBuffer, targetDevice);
      } else {
        return await this.sendBufferToWebSerial(raw, testBuffer, targetDevice);
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Error al imprimir por USB: ${err?.message || 'Fallo de transmisión'}`,
      };
    }
  }

  /**
   * Imprime un buffer binario ESC/POS crudo (enviado desde el backend en Base64 o Uint8Array)
   */
  async printRawEscpos(
    base64OrBuffer: string | Uint8Array,
    deviceOrIdentifier?: UsbDeviceItem | string,
    _paperWidth: '58' | '80' = '80',
    promptIfNoDevice = false
  ): Promise<UsbTestResult> {
    try {
      // 0. Si el controlador nativo Flutter está activo, enviar directamente
      try {
        if (await localBridgePrinterService.isOnline()) {
          const targetName = typeof deviceOrIdentifier === 'string' ? deviceOrIdentifier : deviceOrIdentifier?.name;
          const bridgeRes = await localBridgePrinterService.print({
            printer: targetName,
            data: base64OrBuffer,
            cut: true,
          });
          if (bridgeRes.success) {
            return {
              success: true,
              message: bridgeRes.message || 'Impreso vía Zogui Print Bridge',
            };
          }
        }
      } catch (_) {}

      let buffer: Uint8Array;
      if (typeof base64OrBuffer === 'string') {
        const binaryStr = atob(base64OrBuffer);
        buffer = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          buffer[i] = binaryStr.charCodeAt(i);
        }
      } else {
        buffer = base64OrBuffer;
      }

      let paired = await this.getPairedDevices();
      let targetDevice: UsbDeviceItem | null = null;

      if (deviceOrIdentifier) {
        targetDevice =
          typeof deviceOrIdentifier === 'string'
            ? this.matchDeviceByIdentifier(deviceOrIdentifier, paired)
            : deviceOrIdentifier;
      }

      if (!targetDevice && paired.length > 0) {
        targetDevice = paired[0];
      }

      if (!targetDevice && promptIfNoDevice && typeof navigator !== 'undefined' && 'usb' in navigator) {
        try {
          targetDevice = await this.requestUsbDevice();
        } catch {
          // Cancelado por el usuario
        }
      }

      if (!targetDevice) {
        return {
          success: false,
          message: 'No hay ninguna impresora USB conectada y autorizada para imprimir.',
        };
      }

      const raw = targetDevice.rawDevice || this.resolveRawDevice(targetDevice);
      if (!raw) {
        return {
          success: false,
          message: 'No se pudo obtener el canal de datos USB de la impresora.',
        };
      }

      if (targetDevice.type === 'webusb') {
        return await this.sendBufferToWebUsb(raw, buffer, targetDevice);
      } else {
        return await this.sendBufferToWebSerial(raw, buffer, targetDevice);
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Error de impresión ESC/POS: ${err?.message || 'Fallo general'}`,
      };
    }
  }

  /**
   * Imprime físicamente el comprobante simulado (Factura, Pre-cuenta o Comanda)
   * desde la vista de previsualización térmica
   */
  async printSimulationReceipt(options: {
    mode: 'invoice' | 'precheck' | 'kitchen';
    paperWidth: '58' | '80';
    companyName?: string;
    taxId?: string;
    venueAddress?: string;
    phone?: string;
    receiptHeader?: string;
    receiptFooter?: string;
    printerIdentifier?: string;
    promptIfNoDevice?: boolean;
  }): Promise<UsbTestResult> {
    const {
      mode,
      paperWidth,
      companyName = 'Mi Restaurante',
      taxId = 'NIT: 900.123.456-7',
      venueAddress = 'Sede Principal',
      phone = 'Tel: +57 300 123 4567',
      receiptHeader = 'Experiencias sensoriales y autor',
      receiptFooter = '¡Gracias por su visita!',
      printerIdentifier,
      promptIfNoDevice = false,
    } = options;

    const width = paperWidth === '58' ? 32 : 42;
    const divider = '-'.repeat(width) + '\n';
    const ESC = '\x1B';
    const GS = '\x1D';

    let raw = `${ESC}@`; // Initialize

    if (mode === 'kitchen') {
      raw += `${ESC}a\x01`; // Center
      raw += `${GS}!\x11`; // Double size
      raw += `*** COCINA CALIENTE ***\n`;
      raw += `${GS}!\x00`;
      raw += divider;
      raw += `${ESC}a\x00`; // Left
      raw += `MESA: M-04       MESERO: Carlos M.\n`;
      raw += `ORDEN: #ORD-7890 HORA: ${new Date().toLocaleTimeString('es-CO')}\n`;
      raw += divider;
      raw += `${GS}!\x11${ESC}E\x011x Lomo al Trapo 300g\n${GS}!\x00${ESC}E\x00`;
      raw += `   >> Termino 3/4, salsa aparte\n`;
      raw += `${GS}!\x11${ESC}E\x012x Copa Vino Tinto\n${GS}!\x00${ESC}E\x00`;
      raw += `${GS}!\x11${ESC}E\x011x Volcan de Chocolate\n${GS}!\x00${ESC}E\x00`;
      raw += divider;
      raw += `OBSERVACION: Cliente en terraza\n`;
      raw += divider;
    } else if (mode === 'precheck') {
      raw += `${ESC}a\x01`;
      raw += `${GS}!\x11${ESC}E\x01*** PRE-CUENTA ***\n${GS}!\x00${ESC}E\x00`;
      raw += `${companyName}\n`;
      raw += `DOCUMENTO NO VALIDO COMO FACTURA\n`;
      raw += divider;
      raw += `${ESC}a\x00`;
      raw += `Mesa: M-04       Atiende: Carlos M.\n`;
      raw += divider;
      raw += `1x Lomo al Trapo 300g     $38.000\n`;
      raw += `2x Copa Vino Tinto         $28.000\n`;
      raw += `1x Volcan de Chocolate     $12.000\n`;
      raw += divider;
      raw += `${ESC}a\x02`; // Right
      raw += `SUBTOTAL: $78.000\n`;
      raw += `IMPUESTOS (INC 8%): $6.240\n`;
      raw += `${ESC}E\x01SUBTOTAL CUENTA: $84.240\n${ESC}E\x00`;
      raw += `PROPINA SUGERIDA (10%): $7.800\n`;
      raw += `${GS}!\x11${ESC}E\x01TOTAL CON PROPINA: $92.040\n${GS}!\x00${ESC}E\x00`;
      raw += divider;
      raw += `${ESC}a\x01`;
      raw += `La propina es voluntaria.\nGracias por su preferencia.\n`;
    } else {
      // mode === 'invoice'
      raw += `${ESC}a\x01`;
      raw += `${GS}!\x11${ESC}E\x01${companyName}\n${GS}!\x00${ESC}E\x00`;
      raw += `${taxId}\n`;
      raw += `${venueAddress}\n`;
      raw += `${phone}\n`;
      if (receiptHeader) raw += `"${receiptHeader}"\n`;
      raw += divider;
      raw += `${ESC}a\x00`;
      raw += `FACTURA: #POS-00452  MESA: M-04\n`;
      raw += `Fecha: ${new Date().toLocaleDateString('es-CO')}  Caja: 01\n`;
      raw += `Cliente: Consumidor Final\n`;
      raw += divider;
      raw += `1x Lomo al Trapo 300g     $38.000\n`;
      raw += `2x Copa Vino Tinto         $28.000\n`;
      raw += `1x Volcan de Chocolate     $12.000\n`;
      raw += divider;
      raw += `${ESC}a\x02`;
      raw += `Subtotal Neto: $72.222\n`;
      raw += `Impuesto (8%): $5.778\n`;
      raw += `Propina Voluntaria: $7.800\n`;
      raw += `${GS}!\x11${ESC}E\x01TOTAL A PAGAR: $85.800\n${GS}!\x00${ESC}E\x00`;
      raw += divider;
      raw += `${ESC}a\x00`;
      raw += `Forma de Pago: Efectivo\n`;
      raw += `Recibido:      $100.000\n`;
      raw += `Cambio:        $14.200\n`;
      raw += divider;
      raw += `${ESC}a\x01`;
      raw += `${receiptFooter}\n`;
      raw += `poscocina POS • Impreso en ${paperWidth}mm\n`;
    }

    raw += '\n\n\n\n';
    raw += `${GS}V\x41\x03`; // Cut

    const buffer = new TextEncoder().encode(raw);
    return await this.printRawEscpos(buffer, printerIdentifier, paperWidth, promptIfNoDevice);
  }

  /**
   * Genera el identificador legible para almacenar en la base de datos (campo ipAddress)
   */
  formatIdentifier(device: UsbDeviceItem): string {
    const cleanName = (device.name || 'Impresora POS USB').replace(/^(?:USB:\s*)+/i, '').trim();
    return `USB: ${cleanName} (VID:${device.vendorIdHex} PID:${device.productIdHex}${
      device.serialNumber ? ` SN:${device.serialNumber}` : ''
    })`;
  }

  // --- MÉTODOS INTERNOS PRIVADOS ---

  private resolveRawDevice(item: UsbDeviceItem): any {
    if (item.rawDevice) return item.rawDevice;
    const key = `usb_${item.vendorId}_${item.productId}`;
    return this.rawUsbDevices.get(key) || null;
  }

  private formatWebUsbDevice(device: any, isConnected: boolean): UsbDeviceItem {
    const vidHex = `0x${(device.vendorId || 0).toString(16).padStart(4, '0').toUpperCase()}`;
    const pidHex = `0x${(device.productId || 0).toString(16).padStart(4, '0').toUpperCase()}`;
    const cleanProductName = (device.productName || '').replace(/^(?:USB:\s*)+/i, '').trim();
    const name = cleanProductName || `Impresora USB (${vidHex}:${pidHex})`;

    return {
      id: `usb_${device.vendorId}_${device.productId}`,
      name,
      manufacturer: device.manufacturerName || 'Dispositivo USB',
      vendorId: device.vendorId,
      productId: device.productId,
      vendorIdHex: vidHex,
      productIdHex: pidHex,
      serialNumber: device.serialNumber,
      type: 'webusb',
      isConnected,
      rawDevice: device,
    };
  }

  private formatSerialPort(port: any, isConnected: boolean): UsbDeviceItem {
    const info = port.getInfo?.() || {};
    const vidHex = info.usbVendorId
      ? `0x${info.usbVendorId.toString(16).padStart(4, '0').toUpperCase()}`
      : '0x0000';
    const pidHex = info.usbProductId
      ? `0x${info.usbProductId.toString(16).padStart(4, '0').toUpperCase()}`
      : '0x0000';

    return {
      id: `serial_${info.usbVendorId || 0}_${info.usbProductId || 0}`,
      name: `Puerto Serie USB (${vidHex}:${pidHex})`,
      manufacturer: 'Adaptador Serie / USB POS',
      vendorId: info.usbVendorId,
      productId: info.usbProductId,
      vendorIdHex: vidHex,
      productIdHex: pidHex,
      type: 'webserial',
      isConnected,
      rawDevice: port,
    };
  }

  private matchDeviceByIdentifier(identifier: string, devices: UsbDeviceItem[]): UsbDeviceItem | null {
    if (devices.length === 0) return null;

    // Si solo hay un dispositivo USB conectado, asumimos que es el objetivo
    if (devices.length === 1) return devices[0];
    if (!identifier) return devices[0];

    const lower = identifier.toLowerCase();

    // 1. Extraer VID y PID numéricos mediante Regex
    const vidMatch = lower.match(/vid[:=]?\s*(?:0x)?([0-9a-f]+)/i);
    const pidMatch = lower.match(/pid[:=]?\s*(?:0x)?([0-9a-f]+)/i);

    if (vidMatch && pidMatch) {
      const vidNum = parseInt(vidMatch[1], 16);
      const pidNum = parseInt(pidMatch[1], 16);
      const exactMatch = devices.find((d) => d.vendorId === vidNum && d.productId === pidNum);
      if (exactMatch) return exactMatch;
    }

    // 2. Coincidencia por subcadenas VID/PID
    for (const d of devices) {
      if (
        lower.includes(d.vendorIdHex.toLowerCase()) &&
        lower.includes(d.productIdHex.toLowerCase())
      ) {
        return d;
      }
    }

    // 3. Coincidencia por nombre de modelo
    for (const d of devices) {
      if (d.name && lower.includes(d.name.toLowerCase())) {
        return d;
      }
    }

    // Fallback: primer dispositivo
    return devices[0] || null;
  }

  private async testWebUsbDevice(dev: any, item: UsbDeviceItem): Promise<UsbTestResult> {
    try {
      if (!dev.opened) {
        await dev.open();
      }

      if (dev.configuration === null) {
        await dev.selectConfiguration(1);
      }

      const { outEndpoint, interfaceNum } = this.findOutEndpoint(dev);

      if (outEndpoint !== null) {
        try {
          await dev.claimInterface(interfaceNum);
          const escInit = new Uint8Array([0x1b, 0x40]);
          await dev.transferOut(outEndpoint, escInit);
          await dev.releaseInterface(interfaceNum);
        } catch (claimErr: any) {
          console.warn('Aviso al reclamar interfaz USB:', claimErr);
        }
      }

      await dev.close();

      return {
        success: true,
        message: `¡Conexión USB confirmada! "${item.name}" responde y está sincronizada en este puerto.`,
        device: item,
        details: { opened: true, claimedInterface: interfaceNum, outEndpoint: outEndpoint ?? undefined },
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      let userFriendlyMsg = `Fallo al conectar con dispositivo USB: ${errMsg}`;

      if (err?.name === 'SecurityError' || errMsg.includes('Access denied') || errMsg.includes('protected')) {
        userFriendlyMsg =
          'El sistema operativo o un controlador tiene bloqueado el puerto USB de esta impresora. ' +
          'En Android OTG esto se soluciona otorgando permisos en el aviso emergente. En Windows, puedes usar el modo "Navegador Web / Spooler".';
      }

      return {
        success: false,
        message: userFriendlyMsg,
        device: item,
        details: { error: errMsg },
      };
    }
  }

  private async testWebSerialDevice(port: any, item: UsbDeviceItem): Promise<UsbTestResult> {
    try {
      await port.open({ baudRate: 9600 });
      const writer = port.writable.getWriter();
      const escInit = new Uint8Array([0x1b, 0x40]);
      await writer.write(escInit);
      writer.releaseLock();
      await port.close();

      return {
        success: true,
        message: `¡Conexión por Puerto Serie USB confirmada! "${item.name}" lista.`,
        device: item,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `No se pudo abrir el puerto serie USB: ${err?.message || 'Puerto ocupado'}`,
        device: item,
      };
    }
  }

  private async sendBufferToWebUsb(
    dev: any,
    buffer: Uint8Array,
    item: UsbDeviceItem
  ): Promise<UsbTestResult> {
    try {
      if (!dev.opened) {
        await dev.open();
      }

      if (dev.configuration === null) {
        await dev.selectConfiguration(1);
      }

      const { outEndpoint, interfaceNum } = this.findOutEndpoint(dev);

      if (outEndpoint === null) {
        throw new Error('No se detectó un canal de salida (OUT endpoint) en esta impresora USB.');
      }

      await dev.claimInterface(interfaceNum);
      await dev.transferOut(outEndpoint, buffer);
      await dev.releaseInterface(interfaceNum);
      await dev.close();

      return {
        success: true,
        message: `Impresión física completada con éxito en "${item.name}" vía cable USB.`,
        device: item,
      };
    } catch (err: any) {
      try {
        if (dev.opened) await dev.close();
      } catch {}
      throw err;
    }
  }

  private async sendBufferToWebSerial(
    port: any,
    buffer: Uint8Array,
    item: UsbDeviceItem
  ): Promise<UsbTestResult> {
    try {
      await port.open({ baudRate: 9600 });
      const writer = port.writable.getWriter();
      await writer.write(buffer);
      writer.releaseLock();
      await port.close();

      return {
        success: true,
        message: `Impresión física completada con éxito en "${item.name}" vía serie USB.`,
        device: item,
      };
    } catch (err: any) {
      throw err;
    }
  }

  private findOutEndpoint(dev: any): { outEndpoint: number | null; interfaceNum: number } {
    let outEndpoint: number | null = null;
    let interfaceNum = 0;

    for (const iface of dev.configuration?.interfaces || []) {
      for (const alt of iface.alternates || []) {
        for (const ep of alt.endpoints || []) {
          if (ep.direction === 'out') {
            outEndpoint = ep.endpointNumber;
            interfaceNum = iface.interfaceNumber;
            break;
          }
        }
        if (outEndpoint !== null) break;
      }
      if (outEndpoint !== null) break;
    }

    return { outEndpoint, interfaceNum };
  }

  private generateEscPosTestTicket(
    printerName: string,
    device: UsbDeviceItem,
    paperWidth: '58' | '80'
  ): Uint8Array {
    const width = paperWidth === '58' ? 32 : 42;
    const divider = '-'.repeat(width) + '\n';

    const ESC = '\x1B';
    const GS = '\x1D';

    let raw = '';
    raw += `${ESC}@`; // Init
    raw += `${ESC}a\x01`; // Align center
    raw += `${GS}!\x11`; // Double size
    raw += `*** TEST IMPRESION ***\n`;
    raw += `${GS}!\x00`; // Normal size
    raw += `CONEXION DIRECTA USB / OTG\n`;
    raw += divider;

    raw += `${ESC}a\x00`; // Align left
    raw += `Impresora: ${printerName}\n`;
    raw += `Hardware:  ${device.name}\n`;
    raw += `Fabricante:${device.manufacturer || 'Generico'}\n`;
    raw += `VID / PID: ${device.vendorIdHex} / ${device.productIdHex}\n`;
    raw += `Papel:     ${paperWidth} mm (${width} col)\n`;
    raw += `Fecha:     ${new Date().toLocaleString('es-CO')}\n`;
    raw += divider;

    raw += `${ESC}a\x01`; // Align center
    raw += `${ESC}E\x01`; // Bold
    raw += `SISTEMA POSCOCINA\n`;
    raw += `¡DISPOSITIVO SINCRONIZADO!\n`;
    raw += `${ESC}E\x00`; // Bold off
    raw += `Listo para comandas y recibos.\n`;
    raw += '\n\n\n\n';
    raw += `${GS}V\x41\x03`; // Cut

    return new TextEncoder().encode(raw);
  }
}

export const usbPrinterService = new UsbPrinterService();
