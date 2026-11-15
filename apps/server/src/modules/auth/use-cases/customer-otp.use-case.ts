import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { wahaService } from '../../whatsapp/services/waha.service.js';
import { googleAuthService } from '../services/google-auth.service.js';
import { UnauthorizedError } from '../../../errors/app-error.js';

export class CustomerOtpUseCase {
  async requestOtp(venueId: string, rawPhone: string, name?: string) {
    const cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      throw new Error('Número de teléfono inválido');
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Check if customer exists in this venue
    const [existingCustomer] = await db
      .select()
      .from(schema.customers)
      .where(and(eq(schema.customers.venueId, venueId), eq(schema.customers.phone, cleanPhone)))
      .limit(1);

    if (existingCustomer) {
      await db
        .update(schema.customers)
        .set({
          otpCodeHash: otpHash,
          otpExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.customers.id, existingCustomer.id));
    } else {
      await db.insert(schema.customers).values({
        venueId,
        name: name || `Cliente ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        documentType: 'CC',
        documentNumber: cleanPhone,
        otpCodeHash: otpHash,
        otpExpiresAt: expiresAt,
      });
    }

    // Dispatch WhatsApp message via WAHA
    const session = `venue_${venueId}`;
    const message = `🔐 Tu código de acceso a Zogui Delivery es: *${otpCode}*\n\nEste código vence en 5 minutos. No lo compartas con nadie.`;

    wahaService.sendText(session, cleanPhone, message).catch((err) => {
      console.warn(`[CustomerOtp] Could not send OTP to ${cleanPhone}:`, err.message);
    });

    return {
      success: true,
      phone: cleanPhone,
      message: 'Código de verificación enviado por WhatsApp.',
    };
  }

  async verifyOtp(venueId: string, rawPhone: string, code: string, fastifyJwt: any) {
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const [customer] = await db
      .select()
      .from(schema.customers)
      .where(and(eq(schema.customers.venueId, venueId), eq(schema.customers.phone, cleanPhone)))
      .limit(1);

    if (!customer || !customer.otpCodeHash || !customer.otpExpiresAt) {
      throw new UnauthorizedError('Código de verificación inválido o no solicitado');
    }

    if (new Date() > new Date(customer.otpExpiresAt)) {
      throw new UnauthorizedError('El código de verificación ha expirado. Solicite uno nuevo.');
    }

    const isValid = await bcrypt.compare(code, customer.otpCodeHash);
    if (!isValid) {
      throw new UnauthorizedError('Código de verificación incorrecto');
    }

    // Clear OTP hash once consumed
    await db
      .update(schema.customers)
      .set({
        otpCodeHash: null,
        otpExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.customers.id, customer.id));

    // Sign Customer JWT token
    const token = fastifyJwt.sign(
      {
        sub: customer.id,
        role: 'customer',
        venueId: customer.venueId,
        phone: customer.phone,
        name: customer.name,
      },
      { expiresIn: '30d' }
    );

    return {
      token,
      customer: {
        id: customer.id,
        venueId: customer.venueId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
    };
  }

  async loginWithGoogle(idToken: string, venueId?: string, fastifyJwt?: any) {
    const googleProfile = await googleAuthService.verifyIdToken(idToken);

    // Resolve venueId if not provided (fallback to first active venue)
    let targetVenueId = venueId;
    if (!targetVenueId) {
      const [firstVenue] = await db
        .select({ id: schema.venues.id })
        .from(schema.venues)
        .where(eq(schema.venues.isActive, true))
        .limit(1);
      targetVenueId = firstVenue?.id;
    }

    if (!targetVenueId) {
      throw new Error('No hay restaurantes activos disponibles para vincular al cliente.');
    }

    // Search existing customer by email in this venue
    let [customer] = await db
      .select()
      .from(schema.customers)
      .where(
        and(
          eq(schema.customers.venueId, targetVenueId),
          eq(schema.customers.email, googleProfile.email)
        )
      )
      .limit(1);

    if (!customer) {
      // Check if customer exists in another venue with same email to reuse phone/address
      const [existingElsewhere] = await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.email, googleProfile.email))
        .limit(1);

      const [newCustomer] = await db
        .insert(schema.customers)
        .values({
          venueId: targetVenueId,
          name: googleProfile.name || googleProfile.email.split('@')[0],
          email: googleProfile.email,
          phone: existingElsewhere?.phone || null,
          address: existingElsewhere?.address || null,
          documentType: 'CC',
          documentNumber: `G-${googleProfile.sub.slice(0, 20)}`,
        })
        .returning();
      customer = newCustomer;
    }

    // Sign Customer JWT token valid for 30 days
    const token = fastifyJwt.sign(
      {
        sub: customer.id,
        role: 'customer',
        venueId: customer.venueId,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        picture: googleProfile.picture,
      },
      { expiresIn: '30d' }
    );

    return {
      token,
      customer: {
        id: customer.id,
        venueId: customer.venueId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        picture: googleProfile.picture,
      },
    };
  }
}

export const customerOtpUseCase = new CustomerOtpUseCase();
