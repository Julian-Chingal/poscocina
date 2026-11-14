import { env } from '../../../config/env.js';
import { WahaSendTextMessage } from '../interfaces/waha.types.js';

export class WahaService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = (env.WAHA_API_URL || 'http://localhost:3008').replace(/\/$/, '');
    this.apiKey = env.WAHA_API_KEY || 'poscocina_waha_secret';
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey;
    }
    return headers;
  }

  async sendText(session: string, chatId: string, text: string): Promise<any> {
    const normalizedChatId = chatId.includes('@') ? chatId : `${chatId.replace(/\D/g, '')}@c.us`;
    const payload: WahaSendTextMessage = {
      session: session || 'default',
      chatId: normalizedChatId,
      text,
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/sendText`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[WahaService] sendText failed (${response.status}): ${errorText}`);
        return null;
      }

      return await response.json().catch(() => ({ success: true }));
    } catch (err: any) {
      console.error(`[WahaService] Network error sending WhatsApp message to ${chatId}:`, err.message);
      return null;
    }
  }

  async getSessions(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sessions`, {
        headers: this.headers,
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  async getSessionStatus(session: string): Promise<{ status: string; qr?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${session || 'default'}`, {
        headers: this.headers,
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        return { status: data.status || 'STOPPED' };
      }
      return { status: 'DISCONNECTED' };
    } catch (err) {
      return { status: 'UNREACHABLE' };
    }
  }

  async getSessionQr(session: string): Promise<string | null> {
    try {
      // WAHA provides QR either as an image or JSON { qr: '...' }
      const res = await fetch(`${this.baseUrl}/api/${session || 'default'}/auth/qr`, {
        headers: this.headers,
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = (await res.json()) as any;
          return json.qr || null;
        }
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  async startSession(session: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${session || 'default'}/start`, {
        method: 'POST',
        headers: this.headers,
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  }
}

export const wahaService = new WahaService();
