import { api } from '@/services/api';
import { CompanyItem, CreateCompanyPayload } from '../types/restaurants.types';

export const restaurantsApi = {
  getCompanies: (): Promise<CompanyItem[]> =>
    api.get('/companies'),

  createCompany: (payload: CreateCompanyPayload): Promise<CompanyItem> =>
    api.post('/companies', payload),
};
