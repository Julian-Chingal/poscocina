import { Resend } from 'resend';
import { env } from '../config/env.js';

export interface ManagerWelcomeEmailParams {
  to: string;
  name: string;
  rawPassword: string;
  companyName?: string;
  venueName?: string;
  loginUrl?: string;
}

export interface PasswordChangedEmailParams {
  to: string;
  name: string;
  newPassword?: string;
  companyName?: string;
  loginUrl?: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private from: string;

  constructor() {
    this.from = env.EMAIL_FROM || 'poscocina <onboarding@resend.dev>';
    if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== '') {
      this.resend = new Resend(env.RESEND_API_KEY.trim());
    }
  }

  private isReady(): boolean {
    if (!this.resend) {
      if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== '') {
        this.resend = new Resend(env.RESEND_API_KEY.trim());
        return true;
      }
      return false;
    }
    return true;
  }

  async sendManagerWelcomeEmail(params: ManagerWelcomeEmailParams): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isReady()) {
      console.warn(`[EmailService] RESEND_API_KEY no configurada. Omitiendo bienvenida a ${params.to}`);
      return { success: false, error: 'RESEND_API_KEY_NOT_CONFIGURED' };
    }

    const loginUrl = params.loginUrl || `${env.APP_URL}/#/login`;
    const restaurantName = params.companyName || params.venueName || 'tu restaurante';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a poscocina</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e4e4e7;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">poscocina</h1>
              <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">Plataforma de Gestión Gastronómica & POS</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #18181b;">¡Hola, ${params.name}! 👋</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                Has sido registrado como <strong>Gerente (Manager)</strong> para la administración de <strong>${restaurantName}</strong> en poscocina.
              </p>

              <!-- Credentials Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; margin: 24px 0; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #ea580c;">Tus Credenciales de Acceso</p>
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
                      <tr>
                        <td width="35%" style="color: #71717a; font-weight: 500;">Restaurante:</td>
                        <td style="color: #09090b; font-weight: 600;">${restaurantName}</td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-weight: 500;">Correo Electrónico:</td>
                        <td style="color: #09090b; font-weight: 600;">${params.to}</td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-weight: 500;">Contraseña de Acceso:</td>
                        <td style="color: #ea580c; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">${params.rawPassword}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 6px rgba(234, 88, 12, 0.35);">
                      Ingresar a la Plataforma
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #71717a; border-top: 1px solid #f4f4f5; padding-top: 16px;">
                🔒 <strong>Recomendación de Seguridad:</strong> Te sugerimos actualizar tu contraseña ingresando a tu perfil una vez hayas iniciado sesión por primera vez.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fbfbfb; border-top: 1px solid #f4f4f5; padding: 20px 24px; text-align: center; font-size: 12px; color: #a1a1aa;">
              <p style="margin: 0;">© ${new Date().getFullYear()} poscocina. Todos los derechos reservados.</p>
              <p style="margin: 4px 0 0 0;">Este es un mensaje automático del sistema, por favor no respondas a este correo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    try {
      const response = await this.resend!.emails.send({
        from: this.from,
        to: params.to,
        subject: `¡Bienvenido a poscocina! Tus credenciales de acceso para ${restaurantName}`,
        html,
      });

      if (response.error) {
        console.error(`[EmailService] Resend rechazó el envío de bienvenida a ${params.to}:`, response.error);
        return { success: false, error: response.error.message };
      }

      console.log(`[EmailService] Correo de bienvenida enviado con éxito a ${params.to}. Id: ${response.data?.id}`);
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error(`[EmailService] Excepción enviando correo de bienvenida a ${params.to}:`, err.message || err);
      return { success: false, error: err.message || 'UNKNOWN_ERROR' };
    }
  }

  async sendPasswordChangedEmail(params: PasswordChangedEmailParams): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isReady()) {
      console.warn(`[EmailService] RESEND_API_KEY no configurada. Omitiendo notificación de contraseña a ${params.to}`);
      return { success: false, error: 'RESEND_API_KEY_NOT_CONFIGURED' };
    }

    const loginUrl = params.loginUrl || `${env.APP_URL}/#/login`;
    const restaurantName = params.companyName || 'tu restaurante';

    const newPasswordHtml = params.newPassword
      ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; margin: 20px 0; padding: 16px;">
        <tr>
          <td>
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #ea580c;">Tu Nueva Contraseña</p>
            <p style="margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 1px;">${params.newPassword}</p>
          </td>
        </tr>
      </table>`
      : '';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contraseña Actualizada</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e4e4e7;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">poscocina</h1>
              <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">Alerta de Seguridad</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #18181b;">Hola, ${params.name} 🔐</h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                Te confirmamos que la contraseña asociada a tu cuenta (<strong>${params.to}</strong>) en <strong>${restaurantName}</strong> ha sido actualizada exitosamente.
              </p>

              ${newPasswordHtml}

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
                      Iniciar Sesión
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
                <p style="margin: 0; font-size: 13px; color: #9a3412; line-height: 1.5;">
                  ⚠️ <strong>¿No realizaste este cambio?</strong> Si no solicitaste ni reconoces esta actualización, contacta inmediatamente al administrador de tu restaurante para resguardar tu acceso.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fbfbfb; border-top: 1px solid #f4f4f5; padding: 20px 24px; text-align: center; font-size: 12px; color: #a1a1aa;">
              <p style="margin: 0;">© ${new Date().getFullYear()} poscocina. Todos los derechos reservados.</p>
              <p style="margin: 4px 0 0 0;">Mensaje de seguridad automático generado por la plataforma.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    try {
      const response = await this.resend!.emails.send({
        from: this.from,
        to: params.to,
        subject: `Seguridad poscocina: Tu contraseña ha sido actualizada`,
        html,
      });

      if (response.error) {
        console.error(`[EmailService] Resend rechazó notificación de contraseña a ${params.to}:`, response.error);
        return { success: false, error: response.error.message };
      }

      console.log(`[EmailService] Notificación de contraseña enviada con éxito a ${params.to}. Id: ${response.data?.id}`);
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error(`[EmailService] Excepción enviando notificación de contraseña a ${params.to}:`, err.message || err);
      return { success: false, error: err.message || 'UNKNOWN_ERROR' };
    }
  }
}

export const emailService = new EmailService();
