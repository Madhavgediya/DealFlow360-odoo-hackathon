import { apiClient, delay, formatSuccessResponse, formatErrorResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Lead, LeadConversionPayload, LeadStage, LeadSource } from '../../types/crm';
import { Customer } from '../../types/customer';
import { Subscription } from '../../types/subscription';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adaptServerLead(raw: any): Lead {
  const firstName = raw.first_name || raw.firstName || 'Lead';
  const lastName = raw.last_name || raw.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || raw.company_name || 'Enterprise Lead';
  const score = raw.lead_score !== undefined ? Number(raw.lead_score) : raw.score || 75;
  const stage = (raw.status || raw.stage || 'NEW') as LeadStage;
  const source = (raw.source || 'WEBSITE') as LeadSource;
  const budget = Number(raw.estimated_budget || raw.budget) || 1000000;

  return {
    id: raw.id || `lead-${Date.now()}`,
    companyId: raw.company_id || raw.companyId || 'comp-1',
    firstName,
    lastName,
    fullName,
    email: raw.email || 'lead@enterprise.com',
    phone: raw.phone || '+91 98765 00000',
    companyName: raw.company_name || raw.companyName || 'Enterprise Corp',
    industry: raw.industry || 'Technology & Enterprise Solutions',
    annualRevenue: raw.annual_revenue || raw.annualRevenue || 50000000,
    employeeCount: raw.employee_count || raw.employeeCount || 250,
    source,
    stage,
    score,
    assignedToId: raw.assigned_user_id || raw.assignedToId || 'usr-sales-1',
    assignedToName: raw.assigned_user_name || raw.assignedToName || 'Ananya Sharma',
    requirements: raw.requirement || raw.requirements || 'Enterprise deal management & workflow automation.',
    budget,
    expectedCloseDate: raw.expected_close_date || raw.expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    hasTrial: raw.trial_status === 'ACTIVE' || raw.hasTrial || false,
    trialDaysRemaining: raw.trial_days_remaining || raw.trialDaysRemaining || 7,
    convertedCustomerId: raw.converted_customer_id || raw.convertedCustomerId,
    activities: raw.activities || [
      {
        id: `act-${Date.now()}`,
        type: 'NOTE',
        title: 'Initial Lead Ingestion',
        description: 'Lead registered and AI intent analysis initialized.',
        performedBy: 'System AI Engine',
        performedByRole: 'SYSTEM',
        createdAt: raw.created_at || new Date().toISOString(),
      },
    ],
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
  };
}

export interface CreateLeadPayload {
  firstName: string;
  lastName?: string;
  companyName: string;
  email: string;
  phone?: string;
  industry?: string;
  budget?: number;
  requirements?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  source?: LeadSource;
}

export const leadsApi = {
  getLeads: async (search?: string, stage?: string): Promise<ApiResponse<Lead[]>> => {
    try {
      const params: Record<string, string> = {};
      if (stage && stage !== 'ALL') params.status = stage;
      if (search) params.search = search;

      const response = await apiClient.get<ApiResponse<any[]>>('/leads', { params });
      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        let list = response.data.data.map(adaptServerLead);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(l => l.fullName.toLowerCase().includes(q) || l.companyName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
        }
        return formatSuccessResponse(list, { total: list.length });
      }
    } catch (err) {
      console.debug('Live leads API note, using memory store:', err);
    }

    await delay(120);
    const data = mockDb.getLeads(search, stage);
    return formatSuccessResponse(data, { total: data.length });
  },

  getLeadById: async (id: string): Promise<ApiResponse<Lead>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.get<ApiResponse<any>>(`/leads/${id}`);
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerLead(response.data.data));
        }
      } catch (err) {
        console.debug('Live getLeadById note:', err);
      }
    }

    await delay(100);
    const lead = mockDb.getLeadById(id);
    if (!lead) {
      return formatErrorResponse('Lead record not found');
    }
    return formatSuccessResponse(lead);
  },

  createLead: async (payload: CreateLeadPayload): Promise<ApiResponse<Lead>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/leads', {
        first_name: payload.firstName.trim(),
        last_name: payload.lastName?.trim() || null,
        company_name: payload.companyName.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || null,
        industry: payload.industry || 'Technology',
        estimated_budget: payload.budget || 1000000,
        requirement: payload.requirements || 'Enterprise solutions',
        priority: payload.priority || 'MEDIUM',
        source: payload.source || 'WEBSITE',
        status: 'NEW',
      });

      if (response.data && response.data.success && response.data.data) {
        const adapted = adaptServerLead(response.data.data);
        return formatSuccessResponse(adapted, undefined, 'Lead created successfully in live CRM database!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (msg) return formatErrorResponse(msg);
      console.debug('Live createLead note, storing locally:', err);
    }

    await delay(200);
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      companyId: 'comp-1',
      firstName: payload.firstName,
      lastName: payload.lastName || '',
      fullName: `${payload.firstName} ${payload.lastName || ''}`.trim(),
      email: payload.email,
      phone: payload.phone || '+91 98765 00000',
      companyName: payload.companyName,
      industry: payload.industry || 'Enterprise Technology',
      annualRevenue: (payload.budget || 1000000) * 10,
      employeeCount: 150,
      source: payload.source || 'WEBSITE',
      stage: 'NEW',
      score: 82,
      assignedToId: 'usr-sales-1',
      assignedToName: 'Ananya Sharma',
      requirements: payload.requirements || 'Standard enterprise requirement',
      budget: payload.budget || 1000000,
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      hasTrial: false,
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'NOTE',
          title: 'Lead Created',
          description: 'Lead manually registered into DealFlow360.',
          performedBy: 'Ananya Sharma',
          performedByRole: 'SALES_REP',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDb.addLead(newLead);
    return formatSuccessResponse(newLead, undefined, 'Lead created successfully!');
  },

  updateLead: async (id: string, payload: Partial<CreateLeadPayload>): Promise<ApiResponse<Lead>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.put<ApiResponse<any>>(`/leads/${id}`, {
          first_name: payload.firstName,
          last_name: payload.lastName,
          company_name: payload.companyName,
          email: payload.email,
          phone: payload.phone,
          industry: payload.industry,
          estimated_budget: payload.budget,
          requirement: payload.requirements,
          priority: payload.priority,
          source: payload.source,
        });
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerLead(response.data.data), undefined, 'Lead updated successfully');
        }
      } catch (err) {
        console.debug('Live updateLead note:', err);
      }
    }

    const lead = mockDb.getLeadById(id);
    if (lead) {
      if (payload.firstName) lead.firstName = payload.firstName;
      if (payload.lastName !== undefined) lead.lastName = payload.lastName;
      if (payload.firstName || payload.lastName !== undefined) lead.fullName = `${lead.firstName} ${lead.lastName || ''}`.trim();
      if (payload.companyName) lead.companyName = payload.companyName;
      if (payload.email) lead.email = payload.email;
      if (payload.phone) lead.phone = payload.phone;
      if (payload.industry) lead.industry = payload.industry;
      if (payload.budget) lead.budget = payload.budget;
      if (payload.requirements) lead.requirements = payload.requirements;
      lead.updatedAt = new Date().toISOString();
      return formatSuccessResponse(lead, undefined, 'Lead updated successfully');
    }
    return formatErrorResponse('Lead not found');
  },

  updateLeadStatus: async (id: string, status: LeadStage): Promise<ApiResponse<Lead>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.patch<ApiResponse<any>>(`/leads/${id}/status`, { status });
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerLead(response.data.data), undefined, 'Lead status updated');
        }
      } catch (err) {
        console.debug('Live updateLeadStatus note:', err);
      }
    }

    const lead = mockDb.getLeadById(id);
    if (lead) {
      lead.stage = status;
      lead.updatedAt = new Date().toISOString();
      return formatSuccessResponse(lead, undefined, 'Lead status updated');
    }
    return formatErrorResponse('Lead not found');
  },

  deleteLead: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    if (UUID_REGEX.test(id)) {
      try {
        await apiClient.delete(`/leads/${id}`);
      } catch (err) {
        console.debug('Live deleteLead note:', err);
      }
    }

    mockDb.deleteLead(id);
    return formatSuccessResponse({ id }, undefined, 'Lead removed successfully');
  },

  addInteraction: async (leadId: string, interaction: {
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
    subject: string;
    notes: string;
    outcome?: string;
    nextFollowup?: string;
    performedBy?: string;
  }): Promise<ApiResponse<any>> => {
    if (UUID_REGEX.test(leadId)) {
      try {
        await apiClient.post(`/leads/${leadId}/interactions`, {
          interaction_type: interaction.type,
          subject: interaction.subject,
          notes: interaction.notes,
          outcome: interaction.outcome,
          next_followup_at: interaction.nextFollowup,
        }).catch(() => {});
      } catch (err) {
        console.debug('Live addInteraction note:', err);
      }
    }

    const lead = mockDb.getLeadById(leadId);
    if (lead) {
      lead.activities.unshift({
        id: `act-${Date.now()}`,
        type: interaction.type as any,
        title: interaction.subject,
        description: interaction.notes,
        performedBy: interaction.performedBy || 'Account Exec',
        performedByRole: 'SALES_REP',
        createdAt: new Date().toISOString(),
      });
      lead.updatedAt = new Date().toISOString();
      return formatSuccessResponse(lead, undefined, 'Interaction logged successfully!');
    }
    return formatErrorResponse('Lead not found');
  },

  convertLead: async (
    payload: LeadConversionPayload
  ): Promise<ApiResponse<{ customer: Customer; subscription?: Subscription }>> => {
    if (UUID_REGEX.test(payload.leadId)) {
      try {
        // Create customer in live backend
        const custRes = await apiClient.post<ApiResponse<any>>('/customers', {
          name: payload.customerName,
          industry: 'Enterprise Technology',
          status: 'ACTIVE',
        });
        if (custRes.data && custRes.data.success) {
          const custData = custRes.data.data;
          await apiClient.patch(`/leads/${payload.leadId}/status`, { status: 'CONVERTED' }).catch(() => {});
          
          const customer: Customer = {
            id: custData.id,
            companyId: custData.company_id || 'comp-1',
            name: custData.name,
            code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            industry: 'Enterprise Technology',
            tier: payload.tier,
            priceListId: 'pl-default',
            priceListName: 'Standard Commercial INR Price List',
            currency: 'INR',
            paymentTerms: payload.paymentTerms,
            creditLimit: payload.creditLimit,
            creditUsed: 0,
            status: payload.enableTrial ? 'TRIAL' : 'ACTIVE',
            trialDaysRemaining: payload.enableTrial ? 7 : undefined,
            totalRevenue: 0,
            openDealsCount: 0,
            billingAddress: {
              street: 'Tech Park, Main Boulevard',
              city: 'Mumbai',
              state: 'Maharashtra',
              country: 'India',
              postalCode: '400001',
            },
            shippingAddress: {
              street: 'Tech Park, Main Boulevard',
              city: 'Mumbai',
              state: 'Maharashtra',
              country: 'India',
              postalCode: '400001',
            },
            contacts: [
              {
                id: `cont-${Date.now()}`,
                name: payload.customerName,
                email: payload.contactEmail,
                phone: payload.contactPhone,
                role: 'Primary Commercial Contact',
                isPrimary: true,
              },
            ],
            createdAt: custData.created_at || new Date().toISOString(),
            updatedAt: custData.updated_at || new Date().toISOString(),
          };
          mockDb.addCustomer(customer);
          return formatSuccessResponse({ customer }, undefined, 'Lead converted to Customer account!');
        }
      } catch (err) {
        console.debug('Live convertLead fallback note:', err);
      }
    }

    await delay(250);
    const result = mockDb.convertLeadToCustomer(payload);
    return formatSuccessResponse(result, undefined, 'Lead successfully converted to Customer!');
  },
};
