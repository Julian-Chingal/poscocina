import { workstations, printers } from '../../../db/schema.js';

export type StationEntity = typeof workstations.$inferSelect;
export type StationWithPrinter = StationEntity & {
  printer?: typeof printers.$inferSelect | null;
};
export type InsertStation = typeof workstations.$inferInsert;

export interface IStationRepository {
  findById(id: string): Promise<StationEntity | null>;
  findByVenueId(venueId: string, onlyActive?: boolean): Promise<StationWithPrinter[]>;
  findByCode(venueId: string, code: string): Promise<StationEntity | null>;
  create(data: InsertStation): Promise<StationEntity>;
  update(id: string, data: Partial<InsertStation>): Promise<StationEntity>;
  softDelete(id: string): Promise<StationEntity>;
  hasActiveOrders(stationId: string): Promise<boolean>;
}
