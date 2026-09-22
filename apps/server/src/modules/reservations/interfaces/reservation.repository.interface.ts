export interface IReservationRepository {
  findReservations(venueId: string, date?: string): Promise<any[]>;
  findReservationById(id: string): Promise<any>;
  createReservation(data: any): Promise<any>;
  updateReservation(id: string, data: any): Promise<any>;
  seatReservation(reservationId: string, waiterId?: string, tableId?: string): Promise<any>;
}
