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

  async getCompanyWithFiscal() {
    return await this.companyRepo.getCompanyWithFiscal();
  }

  async getFiscalSettings() {
    return await this.companyRepo.getFiscalSettings();
  }

  async updateCompany(data: UpdateCompanyInput) {
    return await this.companyRepo.updateCompanyWithFiscal(data);
  }
}
