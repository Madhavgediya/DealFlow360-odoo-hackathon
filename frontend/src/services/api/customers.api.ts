import { apiClient } from './client';
import { ApiResponse } from '../../types/api';
import { Customer } from '../../types/customer';

export const customersApi = {
  getCustomers: async (search?: string): Promise<ApiResponse<Customer[]>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const res = await apiClient.get<ApiResponse<Customer[]>>(`/customers?${params.toString()}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch customers' };
    }
  },

  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    try {
      const res = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch customer' };
    }
  },
};
