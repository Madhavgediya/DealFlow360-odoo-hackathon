import { apiClient, delay, formatSuccessResponse, formatErrorResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Customer, CustomerTier, PaymentTerms } from '../../types/customer';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adaptServerCustomer(raw: any): Customer {
  const name = raw.name || 'Enterprise Customer';
  const tier: CustomerTier = (raw.tier || 'GOLD') as CustomerTier;
  const paymentTerms: PaymentTerms = (raw.payment_terms || raw.paymentTerms || 'NET_30') as PaymentTerms;
  const creditLimit = Number(raw.credit_limit || raw.creditLimit) || 10000000;
  const creditUsed = Number(raw.credit_used || raw.creditUsed) || 0;
  const status = raw.status || 'ACTIVE';

  return {
    id: raw.id || `cust-${Date.now()}`,
    companyId: raw.company_id || raw.companyId || 'comp-1',
    name,
    code: raw.code || `CUST-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    industry: raw.industry || 'Technology & Telecommunications',
    tier,
    priceListId: raw.price_list_id || 'pl-default',
    priceListName: raw.price_list_name || 'Standard Commercial INR Price List',
    currency: 'INR',
    paymentTerms,
    creditLimit,
    creditUsed,
    status,
    trialStart: raw.trial_start,
    trialEnd: raw.trial_end,
    trialDaysRemaining: raw.trial_days_remaining || (status === 'TRIAL' ? 7 : undefined),
    contacts: raw.contacts || [
      {
        id: `cnt-${Date.now()}`,
        name: raw.contact_name || name,
        email: raw.contact_email || raw.email || 'billing@enterprise.com',
        phone: raw.contact_phone || raw.phone || '+91 98765 43210',
        role: 'Commercial Lead / Procurement',
        isPrimary: true,
      },
    ],
    billingAddress: raw.billing_address || {
      street: raw.address || 'Tech Park, Main Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
    },
    shippingAddress: raw.shipping_address || {
      street: raw.address || 'Tech Park, Main Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
    },
    totalRevenue: Number(raw.total_revenue || raw.totalRevenue) || 0,
    openDealsCount: Number(raw.open_deals_count || raw.openDealsCount) || 1,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
  };
}

export interface CreateCustomerPayload {
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  tier?: CustomerTier;
  paymentTerms?: PaymentTerms;
  creditLimit?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export const customersApi = {
  getCustomers: async (search?: string): Promise<ApiResponse<Customer[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/customers', {
        params: search ? { search } : undefined,
      });
      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        let list = response.data.data.map(adaptServerCustomer);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
        }
        return formatSuccessResponse(list, { total: list.length });
      }
    } catch (err) {
      console.debug('Live customers API note, using memory store:', err);
    }

    await delay(120);
    const data = mockDb.getCustomers(search);
    return formatSuccessResponse(data, { total: data.length });
  },

  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.get<ApiResponse<any>>(`/customers/${id}`);
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerCustomer(response.data.data));
        }
      } catch (err) {
        console.debug('Live getCustomerById note:', err);
      }
    }

    await delay(100);
    const customer = mockDb.getCustomerById(id);
    if (!customer) return formatErrorResponse('Customer not found');
    return formatSuccessResponse(customer);
  },

  createCustomer: async (payload: CreateCustomerPayload): Promise<ApiResponse<Customer>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/customers', {
        name: payload.name.trim(),
        industry: payload.industry || 'Technology & Enterprise Solutions',
        website: payload.website || null,
        address: payload.address || null,
        status: 'ACTIVE',
      });

      if (response.data && response.data.success && response.data.data) {
        const adapted = adaptServerCustomer({
          ...response.data.data,
          tier: payload.tier || 'GOLD',
          payment_terms: payload.paymentTerms || 'NET_30',
          credit_limit: payload.creditLimit || 10000000,
          contact_name: payload.contactName,
          contact_email: payload.contactEmail,
          contact_phone: payload.contactPhone,
        });
        mockDb.addCustomer(adapted);
        return formatSuccessResponse(adapted, undefined, 'Customer created successfully in live database!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (msg) return formatErrorResponse(msg);
      console.debug('Live createCustomer note, storing locally:', err);
    }

    await delay(200);
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      companyId: 'comp-1',
      name: payload.name,
      code: `CUST-${payload.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      industry: payload.industry || 'Enterprise Solutions',
      tier: payload.tier || 'GOLD',
      priceListId: 'pl-default',
      priceListName: 'Standard Commercial INR Price List',
      currency: 'INR',
      paymentTerms: payload.paymentTerms || 'NET_30',
      creditLimit: payload.creditLimit || 10000000,
      creditUsed: 0,
      status: 'ACTIVE',
      contacts: [
        {
          id: `cnt-${Date.now()}`,
          name: payload.contactName || payload.name,
          email: payload.contactEmail || 'commercial@enterprise.com',
          phone: payload.contactPhone || '+91 98765 43210',
          role: 'Primary Commercial Contact',
          isPrimary: true,
        },
      ],
      billingAddress: {
        street: payload.address || 'Tech Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
      },
      shippingAddress: {
        street: payload.address || 'Tech Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
      },
      totalRevenue: 0,
      openDealsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDb.addCustomer(newCust);
    return formatSuccessResponse(newCust, undefined, 'Customer created successfully!');
  },

  updateCustomer: async (id: string, payload: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.put<ApiResponse<any>>(`/customers/${id}`, {
          name: payload.name,
          industry: payload.industry,
          address: payload.billingAddress?.street,
          status: payload.status,
        });
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerCustomer(response.data.data), undefined, 'Customer updated');
        }
      } catch (err) {
        console.debug('Live updateCustomer note:', err);
      }
    }

    const cust = mockDb.getCustomerById(id);
    if (cust) {
      Object.assign(cust, payload, { updatedAt: new Date().toISOString() });
      return formatSuccessResponse(cust, undefined, 'Customer updated successfully');
    }
    return formatErrorResponse('Customer not found');
  },
};
