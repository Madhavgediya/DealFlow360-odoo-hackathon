import { apiClient } from './client';
import { ApiResponse } from '../../types/api';
import { Quote, CreateQuotePayload, QuoteLineItem } from '../../types/quote';

export const quotesApi = {
  getQuotes: async (search?: string, status?: string): Promise<ApiResponse<Quote[]>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const res = await apiClient.get<ApiResponse<Quote[]>>(`/quotations?${params.toString()}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch quotes' };
    }
  },

  getQuoteById: async (id: string): Promise<ApiResponse<Quote>> => {
    try {
      const res = await apiClient.get<ApiResponse<Quote>>(`/quotations/${id}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch quote' };
    }
  },

  createQuote: async (payload: CreateQuotePayload, salespersonId?: string, salespersonName?: string): Promise<ApiResponse<Quote>> => {
    try {
      const res = await apiClient.post<ApiResponse<Quote>>('/quotations', {
        customer_id: payload.customerId,
        opportunity_id: null,
        valid_until: payload.validUntil || null,
      });
      return { ...res.data, message: 'Quote created successfully!' };
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to create quote' };
    }
  },

  updateQuoteLines: async (
    quoteId: string,
    lines: QuoteLineItem[],
    modifierName?: string,
    modifierRole?: string
  ): Promise<ApiResponse<Quote>> => {
    try {
      // Simple implementation: Add lines one by one
      // The backend does not have bulk replace. We just add them.
      for (const line of lines) {
        if (!line.id || line.id.startsWith('new-')) {
          await apiClient.post(`/quotations/${quoteId}/lines`, {
            product_id: line.productId,
            quantity: line.quantity,
            discount_percent: line.discountPercentage || 0,
          });
        }
      }
      
      // Fetch updated quote
      const res = await apiClient.get<ApiResponse<Quote>>(`/quotations/${quoteId}`);
      return { ...res.data, message: 'Quote line items updated.' };
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to update quote lines' };
    }
  },

  confirmQuote: async (quoteId: string): Promise<ApiResponse<Quote>> => {
    try {
      const res = await apiClient.post<ApiResponse<any>>(`/orders/convert`, {
        quotation_id: quoteId,
      });
      
      // Fetch updated quote to return
      const quoteRes = await apiClient.get<ApiResponse<Quote>>(`/quotations/${quoteId}`);
      return { ...quoteRes.data, message: 'Quote confirmed and converted to Order!' };
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to confirm quote' };
    }
  },
};
