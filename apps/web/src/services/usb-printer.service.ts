/**
 * Servicio para gestión, sincronización y comunicación con impresoras USB y USB-OTG
 * utilizando WebUSB API y Web Serial API en el navegador / tablet.
 */

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
    const list: UsbDeviceItem[] = [];

    // 1. WebUSB
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        const devices = await (navigator as any).usb.getDevices();
        for (const dev of devices) {
          list.push(this.formatWebUsbDevice(dev, true));
        }
      } catch (err) {
        console.warn('Error al leer dispositivos WebUSB vinculados:', err);
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
        console.warn('Error al leer puertos WebSerial vinculados:', err);
      }
    }

    return list;
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

    // Al pasar filtros vacíos [], el navegador muestra todos los dispositivos USB conectados físicamente
    const device = await (navigator as any).usb.requestDevice({ filters: [] });
    return this.formatWebUsbDevice(device, true);
  }

  /**
   * Solicita al usuario seleccionar un puerto serie USB / CH340 / FTDI (Web Serial)
   */
  async requestSerialDevice(): Promise<UsbDeviceItem> {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      throw new Error('Web Serial no está disponible en este navegador.');
    }

    const port = await (navigator as any).serial.requestPort();
    return this.formatSerialPort(port, true);
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

      if (!targetDevice || !targetDevice.rawDevice) {
        return {
          success: false,
          message: 'Impresora USB no encontrada o no está conectada físicamente al puerto USB / OTG.',
        };
      }

      if (targetDevice.type === 'webusb') {
        return await this.testWebUsbDevice(targetDevice.rawDevice, targetDevice);
      } else {
        return await this.testWebSerialDevice(targetDevice.rawDevice, targetDevice);
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
    paperWidth: '58' | '80' = '80'
  ): Promise<UsbTestResult> {
    try {
      let targetDevice: UsbDeviceItem | null = null;

      if (typeof deviceOrId === 'string') {
        const paired = await this.getPairedDevices();
        targetDevice = this.matchDeviceByIdentifier(deviceOrId, paired);
      } else {
        targetDevice = deviceOrId;
      }

      if (!targetDevice || !targetDevice.rawDevice) {
        return {
          success: false,
          message: 'No se encontró la impresora USB conectada para imprimir el ticket de prueba.',
        };
      }

      const testBuffer = this.generateEscPosTestTicket(printerName, targetDevice, paperWidth);

      if (targetDevice.type === 'webusb') {
        return await this.sendBufferToWebUsb(targetDevice.rawDevice, testBuffer, targetDevice);
      } else {
        return await this.sendBufferToWebSerial(targetDevice.rawDevice, testBuffer, targetDevice);
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Error al imprimir por USB: ${err?.message || 'Fallo de transmisión'}`,
      };
    }
  }

  /**
   * Escucha eventos de conexión y desconexión física de cables USB en tiempo real
   */
  listenDeviceEvents(
    onConnect?: (device: UsbDeviceItem) => void,
    onDisconnect?: (device: UsbDeviceItem) => void
  ): () => void {
    if (typeof navigator === 'undefined' || !('usb' in navigator)) {
      return () => {};
    }

    const connectHandler = (event: any) => {
      const item = this.formatWebUsbDevice(event.device, true);
      onConnect?.(item);
    };

    const disconnectHandler = (event: any) => {
      const item = this.formatWebUsbDevice(event.device, false);
      onDisconnect?.(item);
    };

    try {
      (navigator as any).usb.addEventListener('connect', connectHandler);
      (navigator as any).usb.addEventListener('disconnect', disconnectHandler);
    } catch (err) {
      console.warn('No se pudieron registrar listeners de WebUSB:', err);
    }

    return () => {
      try {
        (navigator as any).usb.removeEventListener('connect', connectHandler);
        (navigator as any).usb.removeEventListener('disconnect', disconnectHandler);
      } catch {}
    };
  }

  /**
   * Genera el identificador legible para almacenar en la base de datos (campo ipAddress)
   */
  formatIdentifier(device: UsbDeviceItem): string {
    const cleanName = device.name || 'Impresora POS USB';
    return `USB: ${cleanName} (VID:${device.vendorIdHex} PID:${device.productIdHex}${
      device.serialNumber ? ` SN:${device.serialNumber}` : ''
    })`;
  }

  // --- MÉTODOS INTERNOS PRIVADOS ---

  private formatWebUsbDevice(device: any, isConnected: boolean): UsbDeviceItem {
    const vidHex = `0x${(device.vendorId || 0).toString(16).padStart(4, '0').toUpperCase()}`;
    const pidHex = `0x${(device.productId || 0).toString(16).padStart(4, '0').toUpperCase()}`;
    const name = device.productName || `Impresora USB (${vidHex}:${pidHex})`;

    return {
      id: `usb_${device.vendorId}_${device.productId}_${device.serialNumber || 'default'}`,
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
    if (!identifier || devices.length === 0) return null;
    const lower = identifier.toLowerCase();

    // 1. Coincidencia exacta por VID y PID
    for (const d of devices) {
      if (
        lower.includes(d.vendorIdHex.toLowerCase()) &&
        lower.includes(d.productIdHex.toLowerCase())
      ) {
        return d;
      }
    }

    // 2. Coincidencia por nombre de producto
    for (const d of devices) {
      if (d.name && lower.includes(d.name.toLowerCase())) {
        return d;
      }
    }

    // 3. Fallback: primer dispositivo USB conectado
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

      // Buscar endpoint OUT para transmisión
      const { outEndpoint, interfaceNum } = this.findOutEndpoint(dev);

      if (outEndpoint !== null) {
        try {
          await dev.claimInterface(interfaceNum);
          // Enviar comando ESC @ (Initialize Printer)
          const escInit = new Uint8Array([0x1b, 0x40]);
          await dev.transferOut(outEndpoint, escInit);
          await dev.releaseInterface(interfaceNum);
        } catch (claimErr: any) {
          console.warn('Aviso al reclamar interfaz USB (el dispositivo respondió apertura):', claimErr);
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
        message: `Ticket de prueba impreso físicamente con éxito en "${item.name}" vía cable USB.`,
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
        message: `Ticket de prueba impreso físicamente con éxito en "${item.name}" vía serie USB.`,
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
