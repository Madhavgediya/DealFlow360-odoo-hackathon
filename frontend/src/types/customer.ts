import { CurrencyCode } from './api';

export type CustomerTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type PaymentTerms = 'IMMEDIATE' | 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60';

export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  code: string;
  industry: string;
  tier: CustomerTier;
  priceListId: string;
  priceListName: string;
  currency: CurrencyCode;
  paymentTerms: PaymentTerms;
  creditLimit: number;
  creditUsed: number;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CHURNED';
  trialStart?: string;
  trialEnd?: string;
  trialDaysRemaining?: number;
  contacts: CustomerContact[];
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  totalRevenue: number;
  openDealsCount: number;
  createdAt: string;
  updatedAt: string;
}
