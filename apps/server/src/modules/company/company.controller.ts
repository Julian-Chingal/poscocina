import { FastifyRequest, FastifyReply } from 'fastify';
import { companyRepository } from './repositories/company.repository.js';
import { ManageCompanyUseCase } from './use-cases/manage-company.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { UpdateCompanySchema } from '@poscocina/shared';

export class CompanyController {
  private readonly useCase = new ManageCompanyUseCase(companyRepository);

  async getCompany(_request: FastifyRequest, reply: FastifyReply) {
    const company = await this.useCase.getCompanyWithFiscal();
    return reply.send(company);
  }

  async getFiscalSettings(_request: FastifyRequest, reply: FastifyReply) {
    const fiscal = await this.useCase.getFiscalSettings();
    return reply.send(fiscal);
  }

  async updateCompany(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(UpdateCompanySchema, request.body);
    const updated = await this.useCase.updateCompany(data);
    request.server.io?.emit('company:updated', updated);
    return reply.send(updated);
  }
}

export const companyController = new CompanyController();
