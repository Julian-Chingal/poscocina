import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { companyController } from './company.controller.js';

export async function companyRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
  };

  const superAdminGuard = {
    preHandler: [fastify.authenticate, fastify.requireRole([ROLES.SUPER_ADMIN])],
  };

  // Multi-Company (Restaurants) Management - Super Admin Only
  fastify.get('/api/companies', superAdminGuard, (req, rep) => companyController.listCompanies(req, rep));
  fastify.post('/api/companies', superAdminGuard, (req, rep) => companyController.createCompany(req, rep));

  // Corporate & Brand Endpoints
  fastify.get('/api/company', (req, rep) => companyController.getCompany(req, rep));
  fastify.get('/api/company/fiscal', (req, rep) => companyController.getFiscalSettings(req, rep));
  fastify.put('/api/company', managerGuard, (req, rep) => companyController.updateCompany(req, rep));
  fastify.patch('/api/company', managerGuard, (req, rep) => companyController.updateCompany(req, rep));
}
