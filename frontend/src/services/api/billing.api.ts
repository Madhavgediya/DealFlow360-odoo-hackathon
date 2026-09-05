import { apiClient } from './client';
import { ApiResponse } from '../../types/api';
import { Invoice } from '../../types/billing';

export const billingApi = {
  getInvoices: async (): Promise<ApiResponse<Invoice[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<Invoice[]>>('/invoices');
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch invoices' };
    }
  },

  getInvoiceById: async (id: string): Promise<ApiResponse<Invoice>> => {
    try {
      const res = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch invoice' };
    }
  },

  recordPayment: async (
    invoiceId: string,
    amount: number,
    paymentMethod: any,
    reference: string
  ): Promise<ApiResponse<Invoice>> => {
    try {
      await apiClient.post('/payments/register', {
        invoice_id: invoiceId,
        amount,
        payment_method: paymentMethod || 'BANK_TRANSFER',
        reference,
      });

      // Fetch the updated invoice to return
      const res = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${invoiceId}`);
      return { ...res.data, message: 'Payment recorded successfully!' };
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to record payment' };
    }
  },
};
