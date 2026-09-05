import { Company } from './api';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'RETAILER'
  | 'SALES_REP'
  | 'SALES_MANAGER'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'CUSTOMER'
  | 'FINANCE_DIRECTOR' // mapped alias to FINANCE
  | 'WAREHOUSE_MANAGER' // mapped alias to OPERATIONS
  | 'PROCUREMENT_LEAD'; // mapped alias to OPERATIONS

export type Permission =
  | 'quote.view'
  | 'quote.create'
  | 'quote.edit'
  | 'quote.delete'
  | 'quote.submit'
  | 'quote.approve'
  | 'quote.confirm'
  | 'quote.negotiate'
  | 'discount.override'
  | 'cost.view'
  | 'margin.view'
  | 'risk.view'
  | 'lead.view'
  | 'lead.create'
  | 'lead.edit'
  | 'lead.qualify'
  | 'lead.convert'
  | 'lead.manage'
  | 'product.view'
  | 'product.edit'
  | 'customer.view'
  | 'customer.edit'
  | 'customer.negotiate'
  | 'retailer.view'
  | 'retailer.manage'
  | 'retailer.order'
  | 'retailer.negotiate'
  | 'inventory.view'
  | 'inventory.allocate'
  | 'vendor.view'
  | 'vendor.compare'
  | 'procurement.create'
  | 'procurement.manage'
  | 'procurement.view'
  | 'fulfillment.manage'
  | 'shipping.manage'
  | 'billing.view'
  | 'billing.manage'
  | 'subscription.manage'
  | 'deal_health.view'
  | 'analytics.view'
  | 'settings.manage'
  | 'company.manage'
  | 'company.create'
  | 'user.manage'
  | 'ai.use';

export interface UserPreferences {
  emailApprovals?: boolean;
  emailCustomerActivity?: boolean;
  emailBillingReminders?: boolean;
  smsAlerts?: boolean;
  weeklyDigest?: boolean;
}

export interface RetailerDetails {
  dealerCode?: string;
  tier?: 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  creditLimit?: number;
  availableCredit?: number;
  discountRate?: number;
  taxRegistrationNumber?: string;
  territory?: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  team?: string;
  location?: string;
  memberSince?: string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
  created_at?: string;
  updated_at?: string;
  twoFactorEnabled?: boolean;
  preferences?: UserPreferences;
  avatarUrl?: string;
  role: UserRole;
  roleTitle: string;
  companyId: string;
  companyName?: string;
  permissions: Permission[];
  customerId?: string; // If role is CUSTOMER
  retailerDetails?: RetailerDetails; // If role is RETAILER
}

export interface ProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  team?: string;
  location?: string;
}

export interface PasswordChangePayload {
  currentPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface AuthSession {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}


