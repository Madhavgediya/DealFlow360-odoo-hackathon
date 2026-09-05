import { apiClient } from './client';
import { ApiResponse } from '../../types/api';
import { Lead, LeadConversionPayload } from '../../types/crm';
import { Customer } from '../../types/customer';
import { Subscription } from '../../types/subscription';

export const leadsApi = {
  getLeads: async (search?: string, stage?: string): Promise<ApiResponse<Lead[]>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stage) params.append('status', stage);
      
      const res = await apiClient.get<ApiResponse<Lead[]>>(`/leads?${params.toString()}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch leads' };
    }
  },

  getLeadById: async (id: string): Promise<ApiResponse<Lead>> => {
    try {
      const res = await apiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch lead' };
    }
  },

  convertLead: async (
    payload: LeadConversionPayload
  ): Promise<ApiResponse<{ customer: Customer; subscription?: Subscription }>> => {
    try {
      // Create Customer
      const custRes = await apiClient.post<ApiResponse<Customer>>('/customers', {
        name: payload.customerName,
        industry: 'Other', // fallback
      });
      
      if (!custRes.data.success || !custRes.data.data) {
        throw new Error(custRes.data.error || 'Failed to create customer from lead');
      }
      
      // Update Lead Status to CONVERTED/WON
      await apiClient.patch(`/leads/${payload.leadId}/status`, { status: 'WON' });
      
      return {
        success: true,
        data: { customer: custRes.data.data },
        message: 'Lead successfully converted to Customer!',
        error: null,
      };
    } catch (err: any) {
      return { success: false, data: null, error: err.message || err.response?.data?.message || 'Lead conversion failed' };
    }
  },
};
