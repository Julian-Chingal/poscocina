import { IVenueRepository } from '../interfaces/venue.repository.interface.js';

export class ManageVenuesUseCase {
  constructor(private readonly repo: IVenueRepository) {}

  async listVenues() {
    return await this.repo.listVenues();
  }

  async listPublicVenues() {
    return await this.repo.listPublicVenues();
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

  async getRoles() {
    return await this.repo.getRoles();
  }

  async getVenueUsers(venueId: string) {
    return await this.repo.getVenueUsers(venueId);
  }

  async createUser(venueId: string, data: any, creatorId?: string) {
    return await this.repo.createUser(venueId, data, creatorId);
  }

  async updateUser(id: string, data: any, updaterId?: string) {
    return await this.repo.updateUser(id, data, updaterId);
  }

  async resetPin(id: string, newPin: string, resetById?: string) {
    return await this.repo.resetPin(id, newPin, resetById);
  }

  async deleteUser(id: string, deletedById?: string) {
    return await this.repo.deleteUser(id, deletedById);
  }
}
