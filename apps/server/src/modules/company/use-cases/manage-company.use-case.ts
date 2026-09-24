import { CompanyRepository } from '../repositories/company.repository.js';
import { UpdateCompanyInput } from '@poscocina/shared';

export class ManageCompanyUseCase {
  constructor(private readonly companyRepo: CompanyRepository) {}

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
