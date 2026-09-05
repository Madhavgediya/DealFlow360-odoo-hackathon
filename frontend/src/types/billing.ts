import { CurrencyCode } from './api';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'UPI' | 'CHECK' | 'NET_BANKING';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paidAt: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  customerId: string;
  customerName: string;
  quoteId?: string;
  quoteNumber?: string;
  subscriptionId?: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  lines: InvoiceLine[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  paymentTerms: string;
  payments: PaymentRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
