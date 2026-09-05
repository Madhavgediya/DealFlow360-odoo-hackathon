import { Company } from './api';

export type UserRole =
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_REP'
  | 'FINANCE_DIRECTOR'
  | 'WAREHOUSE_MANAGER'
  | 'PROCUREMENT_LEAD'
  | 'CUSTOMER';

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

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  roleTitle: string;
  companyId: string;
  permissions: Permission[];
  customerId?: string; // If role is CUSTOMER
}

export interface AuthSession {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
