import { eq, and, inArray, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { workstations, printers, orderItemStations } from '../../../db/schema.js';
import {
  IStationRepository,
  StationEntity,
  StationWithPrinter,
  InsertStation,
} from '../interfaces/station.repository.interface.js';

export class StationRepository implements IStationRepository {
  async findById(id: string): Promise<StationEntity | null> {
    const [station] = await db
      .select()
      .from(workstations)
      .where(eq(workstations.id, id))
      .limit(1);
    return station ?? null;
  }

  async findByVenueId(venueId: string, onlyActive = true): Promise<StationWithPrinter[]> {
    const conditions = [eq(workstations.venueId, venueId)];
    if (onlyActive) {
      conditions.push(eq(workstations.isActive, true));
    }

    const rows = await db
      .select({
        station: workstations,
        printer: printers,
      })
      .from(workstations)
      .leftJoin(printers, eq(workstations.printerId, printers.id))
      .where(and(...conditions))
      .orderBy(workstations.sortOrder, workstations.name);

    return rows.map((r) => ({
      ...r.station,
      printer: r.printer,
    }));
  }

  async findByCode(venueId: string, code: string): Promise<StationEntity | null> {
    const [station] = await db
      .select()
      .from(workstations)
      .where(and(eq(workstations.venueId, venueId), eq(workstations.code, code)))
      .limit(1);
    return station ?? null;
  }

  async create(data: InsertStation): Promise<StationEntity> {
    const [newStation] = await db
      .insert(workstations)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return newStation;
  }

  async update(id: string, data: Partial<InsertStation>): Promise<StationEntity> {
    const [updated] = await db
      .update(workstations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(workstations.id, id))
      .returning();
    return updated;
  }

  async softDelete(id: string): Promise<StationEntity> {
    const [deleted] = await db
      .update(workstations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(workstations.id, id))
      .returning();
    return deleted;
  }

  async hasActiveOrders(stationId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orderItemStations)
      .where(
        and(
          eq(orderItemStations.stationId, stationId),
          inArray(orderItemStations.status, ['pending', 'in_preparation'])
        )
      );

    return (result?.count ?? 0) > 0;
  }
}

export const stationRepository = new StationRepository();
