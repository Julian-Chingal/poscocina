import { IVenueRepository } from '../interfaces/venue.repository.interface.js';

export class ManageVenuesUseCase {
  constructor(private readonly repo: IVenueRepository) {}

  async listVenues() {
    return await this.repo.listVenues();
  }

  async listPublicVenues() {
    return await this.repo.listPublicVenues();
  }

  async getPublicVenueBySlugOrId(slugOrId: string) {
    return await this.repo.getPublicVenueBySlugOrId(slugOrId);
  }

  async getFirstVenue() {
    return await this.repo.getFirstVenue();
  }

  async getVenueById(id: string) {
    return await this.repo.getVenueById(id);
  }

  async getVenueSummary(id: string) {
    return await this.repo.getVenueSummary(id);
  }

  async createVenue(data: any) {
    return await this.repo.createVenue(data);
  }

  async updateVenueSettings(id: string, data: any) {
    return await this.repo.updateVenueSettings(id, data);
  }

  async toggleVenueStatus(id: string, isActive: boolean) {
    return await this.repo.toggleVenueStatus(id, isActive);
  }

  async deleteVenue(id: string) {
    return await this.repo.deleteVenue(id);
  }

  async getRoles(requester?: any) {
    return await this.repo.getRoles(requester);
  }

  async getVenueUsers(requester: any, venueId?: string) {
    return await this.repo.getVenueUsers(requester, venueId);
  }

  async createUser(venueId: string, data: any, requester?: any) {
    return await this.repo.createUser(venueId, data, requester);
  }

  async updateUser(id: string, data: any, requester?: any) {
    return await this.repo.updateUser(id, data, requester);
  }

  async resetPin(id: string, newPin: string, requester?: any) {
    return await this.repo.resetPin(id, newPin, requester);
  }

  async deleteUser(id: string, requester?: any) {
    return await this.repo.deleteUser(id, requester);
  }
}
