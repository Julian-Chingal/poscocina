import { CompanyRepository } from '../repositories/company.repository.js';
import { UpdateCompanyInput, CreateCompanyInput } from '@poscocina/shared';

export class ManageCompanyUseCase {
  constructor(private readonly companyRepo: CompanyRepository) {}

  async listCompanies() {
    return await this.companyRepo.listAllCompanies();
  }

  async createCompany(data: CreateCompanyInput) {
    return await this.companyRepo.createCompanyWithInitialVenue(data);
  }

  async getCompanyWithFiscal(companyId?: string) {
    return await this.companyRepo.getCompanyWithFiscal(companyId);
  }

  async getFiscalSettings(companyId?: string) {
    return await this.companyRepo.getFiscalSettings(companyId);
  }

  async updateCompany(data: UpdateCompanyInput, companyId?: string) {
    return await this.companyRepo.updateCompanyWithFiscal(data, companyId);
  }
}
