export interface IVenueRepository {
  listVenues(): Promise<any[]>;
  listPublicVenues(): Promise<any[]>;
  getPublicVenueBySlugOrId(slugOrId: string): Promise<any>;
  getFirstVenue(): Promise<any>;
  getVenueById(id: string): Promise<any>;
  getVenueSummary(id: string): Promise<any>;
  createVenue(data: any): Promise<any>;
  updateVenueSettings(id: string, data: any): Promise<any>;
  toggleVenueStatus(id: string, isActive: boolean): Promise<any>;
  checkVenueDependencies(id: string): Promise<any>;
  deleteVenue(id: string): Promise<any>;
  // Staff & Roles
  getRoles(requester?: any): Promise<any[]>;
  getVenueUsers(requester: any, venueId?: string): Promise<any[]>;
  createUser(venueId: string, data: any, requester?: any): Promise<any>;
  updateUser(id: string, data: any, requester?: any): Promise<any>;
  resetPin(id: string, newPin: string, requester?: any): Promise<any>;
  deleteUser(id: string, requester?: any): Promise<any>;
}
