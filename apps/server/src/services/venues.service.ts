import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError } from '../errors/app-error.js';

export class VenuesService {
  async listVenues() {
    return db.select().from(schema.venues);
  }

  async getFirstVenue() {
    const [venue] = await db.select().from(schema.venues).limit(1);
    if (!venue) {
      throw new NotFoundError('No hay locales registrados en el sistema');
    }
    return venue;
  }

  async getVenueById(id: string) {
    const [venue] = await db.select().from(schema.venues).where(eq(schema.venues.id, id)).limit(1);
    if (!venue) {
      throw new NotFoundError('Local no encontrado');
    }
    return venue;
  }

  async updateVenueSettings(
    id: string,
    data: {
      name?: string;
      address?: string;
      timezone?: string;
      settings?: Record<string, unknown>;
    }
  ) {
    const existing = await this.getVenueById(id);

    const mergedSettings = {
      ...((existing.settings as Record<string, unknown>) || {}),
      ...(data.settings || {}),
    };

    const updateFields: Record<string, unknown> = {
      settings: mergedSettings,
    };

    if (data.name) updateFields.name = data.name;
    if (data.address) updateFields.address = data.address;
    if (data.timezone) updateFields.timezone = data.timezone;

    const [updated] = await db
      .update(schema.venues)
      .set(updateFields)
      .where(eq(schema.venues.id, id))
      .returning();

    return updated;
  }
}

export const venuesService = new VenuesService();
