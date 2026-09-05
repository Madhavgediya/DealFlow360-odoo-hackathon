import { apiClient } from './client';
import { ApiResponse, Company } from '../../types/api';

export const companiesApi = {
  getCompanies: async (): Promise<ApiResponse<Company[]>> => {
    const response = await apiClient.get('/companies');
    return response.data;
  },

  getCompanyById: async (id: string): Promise<ApiResponse<Company>> => {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },

  createCompany: async (data: any): Promise<ApiResponse<Company>> => {
    const response = await apiClient.post('/companies', data);
    return response.data;
  },

  updateCompany: async (id: string, data: any): Promise<ApiResponse<Company>> => {
    const response = await apiClient.put(`/companies/${id}`, data);
    return response.data;
  },

  updateCompanyStatus: async (id: string, status: string): Promise<ApiResponse<Company>> => {
    const response = await apiClient.patch(`/companies/${id}/status`, { status });
    return response.data;
  }
};
