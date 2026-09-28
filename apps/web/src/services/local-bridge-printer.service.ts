/**
 * Servicio cliente para comunicar la aplicación web de poscocina
 * con el controlador nativo de impresión en Flutter (Zogui Print Bridge).
 * 
 * Permite imprimir en impresoras térmicas USB, Red (TCP) y Spooler de Windows
 * sin lidiar con los bloqueos de permisos de WebUSB / WebSerial del navegador.
 */

export interface BridgePrinterDevice {
  id: string;
  name: string;
  driverName: string;
  portName: string;
  connectionType: 'spooler' | 'tcp' | 'bluetooth' | 'usb';
  isDefault: boolean;
  isOnline: boolean;
}

export interface BridgePrintOptions {
  printer?: string;
  data?: string | Uint8Array; // Base64 string o buffer binario ESC/POS
  text?: string;
  cut?: boolean;
  openDrawer?: boolean;
  beep?: boolean;
}

export interface BridgePrintResponse {
  success: boolean;
  jobId?: string;
  printer?: string;
  bytes?: number;
  error?: string;
  message?: string;
}

class LocalBridgePrinterService {
  private bridgeUrl = 'http://127.0.0.1:8080';
  private wsUrl = 'ws://127.0.0.1:8080/ws';
  private ws: WebSocket | null = null;
  private isConnected = false;
  private checkCacheTimeout = 0;
  private cachedOnlineStatus: boolean | null = null;

  get isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  get url(): string {
    return this.bridgeUrl;
  }

  get host(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('poscocina_bridge_host') || '127.0.0.1';
    }
    return '127.0.0.1';
  }

  get port(): number {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('poscocina_bridge_port');
      return p ? parseInt(p, 10) : 8080;
    }
    return 8080;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      const savedHost = localStorage.getItem('poscocina_bridge_host');
      const savedPort = localStorage.getItem('poscocina_bridge_port');
      if (savedHost) {
        this.setHost(savedHost, savedPort ? parseInt(savedPort, 10) : 8080);
      } else if (savedPort) {
        this.setPort(parseInt(savedPort, 10));
      }
    }
  }

  /**
   * Configura el host / IP del controlador (por defecto 127.0.0.1 o IP de red local)
   */
  setHost(host: string, port = 8080) {
    const cleanHost = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split(':')[0] || '127.0.0.1';
    this.bridgeUrl = `http://${cleanHost}:${port}`;
    this.wsUrl = `ws://${cleanHost}:${port}/ws`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('poscocina_bridge_host', cleanHost);
      localStorage.setItem('poscocina_bridge_port', port.toString());
    }
    this.cachedOnlineStatus = null;
  }

  /**
   * Configura el puerto del controlador local si difiere de 8080
   */
  setPort(port: number) {
    const currentHost = (typeof window !== 'undefined' && localStorage.getItem('poscocina_bridge_host')) || '127.0.0.1';
    this.setHost(currentHost, port);
  }

  /**
   * Verifica si el controlador de impresión en Flutter está abierto y escuchando
   */
  async isOnline(forceRefresh = false): Promise<boolean> {
    const now = Date.now();
    if (!forceRefresh && this.cachedOnlineStatus !== null && now < this.checkCacheTimeout) {
      return this.cachedOnlineStatus;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const resp = await fetch(`${this.bridgeUrl}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const isOk = resp.status === 200;
      this.cachedOnlineStatus = isOk;
      this.checkCacheTimeout = now + 4000; // cache por 4 segundos
      return isOk;
    } catch {
      this.cachedOnlineStatus = false;
      this.checkCacheTimeout = now + 2000;
      return false;
    }
  }

  /**
   * Obtiene la lista de impresoras físicas y de red detectadas por el controlador Flutter
   */
  async getPrinters(): Promise<BridgePrinterDevice[]> {
    try {
      const resp = await fetch(`${this.bridgeUrl}/printers`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!resp.ok) return [];
      const json = await resp.json();
      return json.printers || [];
    } catch (e) {
      console.warn('No se pudo consultar la lista de impresoras del Bridge:', e);
      return [];
    }
  }

  /**
   * Envía un trabajo de impresión directamente al controlador Flutter
   */
  async print(options: BridgePrintOptions): Promise<BridgePrintResponse> {
    const { printer, data, text, cut = true, openDrawer = false, beep = false } = options;

    let payloadData: string | undefined;

    if (data instanceof Uint8Array) {
      // Convertir Uint8Array a Base64
      let binary = '';
      for (let i = 0; i < data.byteLength; i++) {
        binary += String.fromCharCode(data[i]);
      }
      payloadData = btoa(binary);
    } else if (typeof data === 'string') {
      payloadData = data;
    }

    try {
      const resp = await fetch(`${this.bridgeUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          printer,
          data: payloadData,
          text,
          cut,
          openDrawer,
          beep,
        }),
      });

      const json = await resp.json();
      return {
        success: Boolean(json.success),
        jobId: json.jobId,
        printer: json.printer,
        bytes: json.bytes,
        error: json.error,
        message: json.success
          ? `Impreso correctamente en ${json.printer || 'impresora'}`
          : json.error || 'Error al imprimir',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'No hay conexión con el controlador nativo de Flutter en 127.0.0.1:8080',
        message: 'Asegúrate de que la app "Zogui Print Bridge" esté abierta en esta máquina.',
      };
    }
  }

  /**
   * Imprime un ticket de prueba en la impresora especificada o predeterminada
   */
  async testPrint(printerName?: string): Promise<BridgePrintResponse> {
    try {
      const resp = await fetch(`${this.bridgeUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          printer: printerName,
        }),
      });

      const json = await resp.json();
      return {
        success: Boolean(json.success),
        jobId: json.jobId,
        printer: json.printer,
        error: json.error,
        message: json.success
          ? `Ticket de prueba impreso en ${json.printer}`
          : json.error || 'Error al enviar ticket de prueba',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Error de comunicación',
        message: 'El controlador local de Flutter no respondió.',
      };
    }
  }

  /**
   * Inicializa conexión WebSocket persistente para eventos en tiempo real
   */
  initWebSocket(onPrintEvent?: (event: any) => void) {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
    }

    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        this.isConnected = true;
      };
      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.type === 'print_event' && onPrintEvent) {
            onPrintEvent(data.job);
          }
        } catch (_) {}
      };
      this.ws.onclose = () => {
        this.isConnected = false;
      };
    } catch (_) {}
  }
}

export const localBridgePrinterService = new LocalBridgePrinterService();
