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

  async sendText(session: string, chatId: string, text: string): Promise<{ success: boolean; id?: string; error?: string }> {
    const rawClean = chatId.replace(/\D/g, '');
    const isLid = chatId.includes('@lid') || (rawClean.length >= 15 && !chatId.includes('@c.us'));
    const primaryChatId = chatId.includes('@')
      ? chatId
      : isLid
        ? `${rawClean}@lid`
        : `${rawClean}@c.us`;

    const payload: WahaSendTextMessage = {
      session: session || 'default',
      chatId: primaryChatId,
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
        console.warn(`[WahaService] sendText with ${primaryChatId} failed (${response.status}): ${errorText}`);

        // If session is FAILED / STOPPED (HTTP 422), fail immediately with actionable error
        if (response.status === 422 && errorText.includes('Session status is not as expected')) {
          return {
            success: false,
            error: 'La sesión de WhatsApp está detenida o en estado FAILED. Por favor vincula o reinicia la sesión.',
          };
        }

        // If failed due to LID / @c.us resolution error, retry with alternate suffix
        if (!chatId.includes('@') && (errorText.includes('LID') || errorText.includes('not found') || response.status === 500)) {
          const alternateChatId = primaryChatId.endsWith('@c.us')
            ? `${rawClean}@lid`
            : `${rawClean}@c.us`;

          console.info(`[WahaService] Retrying sendText with alternate suffix: ${alternateChatId}`);
          const altResponse = await fetch(`${this.baseUrl}/api/sendText`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ ...payload, chatId: alternateChatId }),
          });

          if (altResponse.ok) {
            const altData = (await altResponse.json().catch(() => ({}))) as any;
            return { success: true, id: altData?.id };
          }
        }

        return {
          success: false,
          error: errorText || `Error HTTP ${response.status} de WAHA`,
        };
      }

      const data = (await response.json().catch(() => ({}))) as any;
      return { success: true, id: data?.id };
    } catch (err: any) {
      console.error(`[WahaService] Network error sending WhatsApp message to ${chatId}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async resolvePhoneFromLid(session: string, lid: string): Promise<string | null> {
    const sessionName = session || 'default';
    const cleanLid = lid.replace(/@.*$/, '').replace(/\D/g, '');

    try {
      // 1. Check WAHA LID mapping endpoint: GET /api/{session}/lids/{lid}
      const lidRes = await fetch(`${this.baseUrl}/api/${sessionName}/lids/${cleanLid}`, {
        headers: this.headers,
      });
      if (lidRes.ok) {
        const lidData = (await lidRes.json().catch(() => null)) as any;
        const pn = lidData?.pn || lidData?.phoneNumber || lidData?.number;
        if (pn) {
          const cleanPn = String(pn).replace(/@.*$/, '').replace(/\D/g, '');
          if (cleanPn && cleanPn.length < 15) return cleanPn;
        }
      }

      // 2. Check WAHA contact info: GET /api/contacts?contactId={id}&session={session}
      const contactRes = await fetch(
        `${this.baseUrl}/api/contacts?contactId=${encodeURIComponent(cleanLid + '@lid')}&session=${sessionName}`,
        { headers: this.headers }
      );
      if (contactRes.ok) {
        const contactData = (await contactRes.json().catch(() => null)) as any;
        const pn = contactData?.number || contactData?.pn || contactData?.phoneNumber;
        if (pn) {
          const cleanPn = String(pn).replace(/@.*$/, '').replace(/\D/g, '');
          if (cleanPn && cleanPn.length < 15) return cleanPn;
        }
      }
    } catch (err: any) {
      console.warn(`[WahaService] Could not resolve phone from LID ${cleanLid}:`, err.message);
    }

    return null;
  }

  async restartSession(session: string): Promise<boolean> {
    const sessionName = session || 'default';
    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/restart`, {
        method: 'POST',
        headers: this.headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async stopSession(session: string, logout = false): Promise<boolean> {
    const sessionName = session || 'default';
    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/stop`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ logout }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async logoutSession(session: string): Promise<boolean> {
    const sessionName = session || 'default';
    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/logout`, {
        method: 'POST',
        headers: this.headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async startSession(session: string): Promise<boolean> {
    const sessionName = session || 'default';
    try {
      // 0. Check current status. If session is FAILED, try restart first
      const current = await this.getSessionStatus(sessionName);
      if (current.status === 'FAILED') {
        console.info(`[WahaService] Session ${sessionName} is FAILED, attempting restart...`);
        const restarted = await this.restartSession(sessionName);
        if (restarted) return true;
        // If restart failed, stop it first before starting
        await this.stopSession(sessionName);
      }

      // 1. In WAHA, recommended upsert-and-start endpoint is POST /api/sessions/start
      const startBodyRes = await fetch(`${this.baseUrl}/api/sessions/start`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ name: sessionName }),
      });
      if (startBodyRes.ok) {
        return true;
      }

      // 2. Alternative: POST /api/sessions
      const createRes = await fetch(`${this.baseUrl}/api/sessions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ name: sessionName }),
      });
      if (createRes.ok) {
        return true;
      }

      // 3. If it already exists, start it via POST /api/sessions/{session}/start
      const startRes = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/start`, {
        method: 'POST',
        headers: this.headers,
      });
      return startRes.ok;
    } catch (err: any) {
      console.error(`[WahaService] Error starting session ${sessionName} at ${this.baseUrl}:`, err.message);
      return false;
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
      // 1. Try raw text format first (ideal for client-side SVG rendering)
      const rawRes = await fetch(`${this.baseUrl}/api/${session || 'default'}/auth/qr?format=raw`, {
        headers: this.headers,
      });
      if (rawRes.ok) {
        const rawJson = (await rawRes.json()) as any;
        if (rawJson?.value) {
          return rawJson.value;
        }
      }

      // 2. Fallback: standard QR endpoint (JSON base64 or raw image binary)
      const res = await fetch(`${this.baseUrl}/api/${session || 'default'}/auth/qr`, {
        headers: this.headers,
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = (await res.json()) as any;
          if (json.value) return json.value;
          if (json.qr) return json.qr;
          if (json.data) {
            return `data:${json.mimetype || 'image/png'};base64,${json.data}`;
          }
        }
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType || 'image/png'};base64,${base64}`;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  async fetchFile(filePath: string): Promise<{ ok: boolean; status: number; contentType: string; buffer: Buffer } | null> {
    try {
      const cleanPath = filePath.replace(/^\/+/, '');
      const url = `${this.baseUrl}/api/files/${cleanPath}`;
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['X-Api-Key'] = this.apiKey;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return { ok: false, status: res.status, contentType: 'text/plain', buffer: Buffer.from('') };
      }
      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      const arrayBuffer = await res.arrayBuffer();
      return {
        ok: true,
        status: 200,
        contentType,
        buffer: Buffer.from(arrayBuffer),
      };
    } catch (err: any) {
      console.error(`[WahaService] Error fetching file ${filePath}:`, err.message);
      return null;
    }
  }
}

export const wahaService = new WahaService();
