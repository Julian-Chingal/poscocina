export interface IVenueRepository {
  listVenues(): Promise<any[]>;
  listPublicVenues(): Promise<any[]>;
  getFirstVenue(): Promise<any>;
  getVenueById(id: string): Promise<any>;
  getVenueSummary(id: string): Promise<any>;
  createVenue(data: any): Promise<any>;
  updateVenueSettings(id: string, data: any): Promise<any>;
  toggleVenueStatus(id: string, isActive: boolean): Promise<any>;
  checkVenueDependencies(id: string): Promise<any>;
  deleteVenue(id: string): Promise<any>;
  // Staff & Roles
  getRoles(): Promise<any[]>;
  getVenueUsers(venueId: string): Promise<any[]>;
  createUser(venueId: string, data: any, creatorId?: string): Promise<any>;
  updateUser(id: string, data: any, updaterId?: string): Promise<any>;
  resetPin(id: string, newPin: string, resetById?: string): Promise<any>;
  deleteUser(id: string, deletedById?: string): Promise<any>;
}
