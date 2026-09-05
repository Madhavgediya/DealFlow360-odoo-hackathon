import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Invoice } from '../../types/billing';

export const billingApi = {
  getInvoices: async (): Promise<ApiResponse<Invoice[]>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getInvoices());
  },

  getInvoiceById: async (id: string): Promise<ApiResponse<Invoice>> => {
    await delay(150);
    const inv = mockDb.getInvoiceById(id);
    if (!inv) throw new Error('Invoice not found');
    return formatSuccessResponse(inv);
  },

  recordPayment: async (
    invoiceId: string,
    amount: number,
    paymentMethod: any,
    reference: string
  ): Promise<ApiResponse<Invoice>> => {
    await delay(350);
    const updated = mockDb.recordInvoicePayment(invoiceId, amount, paymentMethod, reference);
    return formatSuccessResponse(updated, undefined, 'Payment recorded successfully!');
  },
};
