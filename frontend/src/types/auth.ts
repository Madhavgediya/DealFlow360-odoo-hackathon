import { Company } from './api';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
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
  | 'discount.override'
  | 'cost.view'
  | 'margin.view'
  | 'risk.view'
  | 'lead.view'
  | 'lead.edit'
  | 'lead.qualify'
  | 'lead.convert'
  | 'product.view'
  | 'product.edit'
  | 'customer.view'
  | 'customer.edit'
  | 'customer.negotiate'
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
  | 'ai.use';

export interface UserPreferences {
  emailApprovals?: boolean;
  emailCustomerActivity?: boolean;
  emailBillingReminders?: boolean;
  smsAlerts?: boolean;
  weeklyDigest?: boolean;
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
  permissions: Permission[];
  customerId?: string; // If role is CUSTOMER
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

