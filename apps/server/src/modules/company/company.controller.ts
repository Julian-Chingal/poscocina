import { FastifyRequest, FastifyReply } from 'fastify';
import { companyRepository } from './repositories/company.repository.js';
import { ManageCompanyUseCase } from './use-cases/manage-company.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { resolveCompanyId } from '../../utils/tenant.util.js';
import { UpdateCompanySchema, CreateCompanySchema } from '@poscocina/shared';

export class CompanyController {
  private readonly useCase = new ManageCompanyUseCase(companyRepository);

  async listCompanies(_request: FastifyRequest, reply: FastifyReply) {
    const list = await this.useCase.listCompanies();
    return reply.send(list);
  }

  async createCompany(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateCompanySchema, request.body);
    const created = await this.useCase.createCompany(data);
    request.server.io?.emit('company:created', created);
    return reply.status(201).send(created);
  }

  async getCompany(request: FastifyRequest, reply: FastifyReply) {
    const companyId = await resolveCompanyId(request);
    const company = await this.useCase.getCompanyWithFiscal(companyId);
    return reply.send(company);
  }

  async getFiscalSettings(request: FastifyRequest, reply: FastifyReply) {
    const companyId = await resolveCompanyId(request);
    const fiscal = await this.useCase.getFiscalSettings(companyId);
    return reply.send(fiscal);
  }

  async updateCompany(request: FastifyRequest, reply: FastifyReply) {
    const companyId = await resolveCompanyId(request);
    const data = validate(UpdateCompanySchema, request.body);
    const updated = await this.useCase.updateCompany(data, companyId);
    request.server.io?.emit('company:updated', updated);
    return reply.send(updated);
  }
}

export const companyController = new CompanyController();
