import { Permission, User, UserRole } from '../types/auth';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.delete', 'quote.submit', 'quote.approve', 'quote.confirm',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'lead.view', 'lead.edit', 'lead.qualify', 'lead.convert',
    'product.view', 'product.edit',
    'customer.view', 'customer.edit', 'customer.negotiate',
    'inventory.view', 'inventory.allocate',
    'vendor.view', 'vendor.compare',
    'procurement.create', 'procurement.manage', 'procurement.view', 'fulfillment.manage', 'shipping.manage',
    'billing.view', 'billing.manage', 'subscription.manage',
    'deal_health.view', 'analytics.view', 'settings.manage', 'ai.use'
  ],
  ADMIN: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.delete', 'quote.submit', 'quote.approve', 'quote.confirm',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'lead.view', 'lead.edit', 'lead.qualify', 'lead.convert',
    'product.view', 'product.edit',
    'customer.view', 'customer.edit', 'customer.negotiate',
    'inventory.view', 'inventory.allocate',
    'vendor.view', 'vendor.compare',
    'procurement.create', 'procurement.manage', 'procurement.view', 'fulfillment.manage', 'shipping.manage',
    'billing.view', 'billing.manage', 'subscription.manage',
    'deal_health.view', 'analytics.view', 'settings.manage', 'ai.use'
  ],
  SALES_MANAGER: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.submit', 'quote.approve', 'quote.confirm',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'lead.view', 'lead.edit', 'lead.qualify', 'lead.convert',
    'product.view', 'customer.view', 'customer.edit', 'customer.negotiate',
    'inventory.view', 'vendor.view', 'vendor.compare',
    'procurement.manage', 'procurement.view', 'fulfillment.manage', 'billing.view', 'deal_health.view', 'analytics.view', 'ai.use'
  ],
  SALES_REP: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.submit',
    'risk.view',
    'lead.view', 'lead.edit', 'lead.qualify', 'lead.convert',
    'product.view', 'customer.view', 'customer.negotiate',
    'inventory.view', 'vendor.view', 'deal_health.view', 'ai.use'
  ],
  FINANCE: [
    'quote.view', 'quote.approve', 'quote.confirm',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'product.view', 'customer.view', 'billing.view', 'billing.manage', 'subscription.manage',
    'procurement.create', 'procurement.manage', 'procurement.view', 'deal_health.view', 'analytics.view', 'ai.use'
  ],
  FINANCE_DIRECTOR: [
    'quote.view', 'quote.approve', 'quote.confirm',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'product.view', 'customer.view', 'billing.view', 'billing.manage', 'subscription.manage',
    'procurement.create', 'procurement.manage', 'procurement.view', 'deal_health.view', 'analytics.view', 'ai.use'
  ],
  OPERATIONS: [
    'quote.view', 'product.view', 'inventory.view', 'inventory.allocate',
    'vendor.view', 'vendor.compare', 'procurement.create', 'procurement.manage', 'procurement.view',
    'fulfillment.manage', 'shipping.manage', 'ai.use'
  ],
  WAREHOUSE_MANAGER: [
    'quote.view', 'product.view', 'inventory.view', 'inventory.allocate',
    'fulfillment.manage', 'shipping.manage', 'procurement.create', 'ai.use'
  ],
  PROCUREMENT_LEAD: [
    'quote.view', 'product.view', 'inventory.view', 'vendor.view', 'vendor.compare',
    'procurement.create', 'procurement.manage', 'procurement.view', 'fulfillment.manage', 'ai.use'
  ],
  CUSTOMER: [
    'customer.negotiate'
  ]
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Platform Owner',
  ADMIN: 'System Administrator',
  SALES_MANAGER: 'Sales Director / Manager',
  SALES_REP: 'Account Executive / Sales Rep',
  FINANCE: 'Finance & Billing Director',
  FINANCE_DIRECTOR: 'Finance & Billing Director',
  OPERATIONS: 'Operations & Fulfillment Lead',
  WAREHOUSE_MANAGER: 'Head of Inventory & Warehouses',
  PROCUREMENT_LEAD: 'Procurement & Supply Specialist',
  CUSTOMER: 'Client / Portal Contact'
};

export function can(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  return user.permissions?.includes(permission) || false;
}

export function hasRole(user: User | null | undefined, roles: UserRole | UserRole[]): boolean {
  if (!user) return false;
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.includes(user.role);
}

