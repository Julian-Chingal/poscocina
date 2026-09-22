import { ICustomerRepository } from '../interfaces/customer.repository.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';

export class ManageCustomersUseCase {
  constructor(private readonly repo: ICustomerRepository) {}

  async search(venueId: string, q?: string, limit = 20) {
    return await this.repo.search(venueId, q, limit);
  }

  async getById(id: string) {
    const customer = await this.repo.findById(id);
    if (!customer) throw new NotFoundError('Cliente no encontrado');
    return customer;
  }

  async create(data: any) {
    return await this.repo.create(data);
  }

  async update(id: string, data: any) {
    await this.getById(id);
    return await this.repo.update(id, data);
  }
}
