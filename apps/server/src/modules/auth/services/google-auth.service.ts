import { UnauthorizedError } from '../../../errors/app-error.js';

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export class GoogleAuthService {
  async verifyIdToken(idToken: string): Promise<VerifiedGoogleUser> {
    if (!idToken || typeof idToken !== 'string') {
      throw new UnauthorizedError('Token de Google no proporcionado o inválido');
    }

    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as Record<string, any>;
        throw new UnauthorizedError(
          errorData.error_description || 'El token de Google es inválido o ha expirado'
        );
      }

      const payload = (await response.json()) as Record<string, any>;

      if (!payload.sub || !payload.email) {
        throw new UnauthorizedError('El token de Google no contiene información de identidad requerida');
      }

      const isVerified = payload.email_verified === 'true' || payload.email_verified === true;
      if (!isVerified) {
        throw new UnauthorizedError('El correo electrónico de Google no está verificado');
      }

      const configuredClientId = process.env.GOOGLE_CLIENT_ID;
      if (configuredClientId && payload.aud && payload.aud !== configuredClientId) {
        throw new UnauthorizedError(
          'El token de Google no fue emitido para la aplicación configurada'
        );
      }

      return {
        sub: payload.sub,
        email: payload.email.toLowerCase().trim(),
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err;
      }
      throw new UnauthorizedError(`Fallo en la validación con Google: ${err.message || 'Error de red'}`);
    }
  }
}

export const googleAuthService = new GoogleAuthService();
