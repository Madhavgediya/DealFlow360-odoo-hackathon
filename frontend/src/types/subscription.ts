export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'PAUSED' | 'CANCELLED';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  features: string[];
  maxUsers: number;
  active: boolean;
}

export interface Subscription {
  id: string;
  companyId: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  trialDaysRemaining?: number;
  cancelAtPeriodEnd: boolean;
  linkedQuoteId?: string;
  seats: number;
  invoicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProrationPreview {
  currentPlanId: string;
  newPlanId: string;
  effectiveDate: string;
  unusedCurrentPlanCredit: number;
  newPlanCharge: number;
  netDueNow: number;
  nextRenewalDate: string;
}
