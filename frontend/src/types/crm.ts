export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'CONVERTED'
  | 'UNQUALIFIED';

export type LeadSource =
  | 'WEBSITE'
  | 'OUTBOUND'
  | 'INBOUND'
  | 'REFERRAL'
  | 'TRADE_SHOW'
  | 'PARTNER';

export interface Activity {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'STATUS_CHANGE';
  title: string;
  description: string;
  performedBy: string;
  performedByRole: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  industry: string;
  annualRevenue?: number;
  employeeCount?: number;
  source: LeadSource;
  stage: LeadStage;
  score: number; // 0-100
  assignedToId: string;
  assignedToName: string;
  requirements: string;
  budget: number;
  expectedCloseDate: string;
  hasTrial: boolean;
  trialDaysRemaining?: number;
  convertedCustomerId?: string;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadConversionPayload {
  leadId: string;
  customerName: string;
  contactEmail: string;
  contactPhone: string;
  tier: 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';
  paymentTerms: 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'IMMEDIATE';
  creditLimit: number;
  enableTrial: boolean;
  trialPlanId?: string;
  sendPortalInvite: boolean;
}
