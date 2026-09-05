import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Lead, LeadConversionPayload } from '../../types/crm';
import { Customer } from '../../types/customer';
import { Subscription } from '../../types/subscription';

export const leadsApi = {
  getLeads: async (search?: string, stage?: string): Promise<ApiResponse<Lead[]>> => {
    await delay(180);
    const data = mockDb.getLeads(search, stage);
    return formatSuccessResponse(data, { total: data.length });
  },

  getLeadById: async (id: string): Promise<ApiResponse<Lead>> => {
    await delay(150);
    const lead = mockDb.getLeadById(id);
    if (!lead) throw new Error('Lead not found');
    return formatSuccessResponse(lead);
  },

  convertLead: async (
    payload: LeadConversionPayload
  ): Promise<ApiResponse<{ customer: Customer; subscription?: Subscription }>> => {
    await delay(350);
    const result = mockDb.convertLeadToCustomer(payload);
    return formatSuccessResponse(result, undefined, 'Lead successfully converted to Customer!');
  },
};
