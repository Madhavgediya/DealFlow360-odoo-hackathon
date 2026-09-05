import { Permission, User, UserRole } from '../types/auth';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.delete', 'quote.submit', 'quote.approve', 'quote.confirm', 'quote.negotiate',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'lead.view', 'lead.create', 'lead.edit', 'lead.qualify', 'lead.convert', 'lead.manage',
    'product.view', 'product.edit',
    'customer.view', 'customer.edit', 'customer.negotiate',
    'retailer.view', 'retailer.manage', 'retailer.order', 'retailer.negotiate',
    'inventory.view', 'inventory.allocate',
    'vendor.view', 'vendor.compare',
    'procurement.create', 'procurement.manage', 'procurement.view', 'fulfillment.manage', 'shipping.manage',
    'billing.view', 'billing.manage', 'subscription.manage',
    'deal_health.view', 'analytics.view', 'settings.manage',
    'company.manage', 'company.create', 'user.manage', 'ai.use'
  ],
  SUPERADMIN: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.delete', 'quote.submit', 'quote.approve', 'quote.confirm', 'quote.negotiate',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'lead.view', 'lead.create', 'lead.edit', 'lead.qualify', 'lead.convert', 'lead.manage',
    'product.view', 'product.edit',
    'customer.view', 'customer.edit', 'customer.negotiate',
    'retailer.view', 'retailer.manage', 'retailer.order', 'retailer.negotiate',
    'inventory.view', 'inventory.allocate',
    'vendor.view', 'vendor.compare',
    'procurement.create', 'procurement.manage', 'procurement.view', 'fulfillment.manage', 'shipping.manage',
    'billing.view', 'billing.manage', 'subscription.manage',
    'deal_health.view', 'analytics.view', 'settings.manage',
    'company.manage', 'company.create', 'user.manage', 'ai.use'
  ],
  ADMIN: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.delete', 'quote.submit', 'quote.approve', 'quote.confirm', 'quote.negotiate',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'lead.view', 'lead.create', 'lead.edit', 'lead.qualify', 'lead.convert', 'lead.manage',
    'product.view', 'product.edit',
    'customer.view', 'customer.edit', 'customer.negotiate',
    'retailer.view', 'retailer.manage', 'retailer.order', 'retailer.negotiate',
    'inventory.view', 'inventory.allocate',
    'vendor.view', 'vendor.compare',
    'procurement.create', 'procurement.manage', 'procurement.view', 'fulfillment.manage', 'shipping.manage',
    'billing.view', 'billing.manage', 'subscription.manage',
    'deal_health.view', 'analytics.view', 'settings.manage',
    'company.manage', 'user.manage', 'ai.use'
  ],
  RETAILER: [
    'quote.view', 'quote.create', 'quote.negotiate',
    'product.view',
    'retailer.view', 'retailer.order', 'retailer.negotiate',
    'billing.view',
    'ai.use'
  ],
  SALES_MANAGER: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.submit', 'quote.approve', 'quote.confirm', 'quote.negotiate',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'lead.view', 'lead.create', 'lead.edit', 'lead.qualify', 'lead.convert', 'lead.manage',
    'product.view', 'customer.view', 'customer.edit', 'customer.negotiate',
    'retailer.view', 'retailer.manage',
    'inventory.view', 'vendor.view', 'vendor.compare',
    'procurement.manage', 'procurement.view', 'fulfillment.manage', 'billing.view', 'deal_health.view', 'analytics.view', 'ai.use'
  ],
  SALES_REP: [
    'quote.view', 'quote.create', 'quote.edit', 'quote.submit', 'quote.negotiate',
    'risk.view',
    'lead.view', 'lead.create', 'lead.edit', 'lead.qualify', 'lead.convert',
    'product.view', 'customer.view', 'customer.negotiate',
    'retailer.view',
    'inventory.view', 'vendor.view', 'deal_health.view', 'ai.use'
  ],
  FINANCE: [
    'quote.view', 'quote.approve', 'quote.confirm',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'product.view', 'customer.view', 'retailer.view', 'billing.view', 'billing.manage', 'subscription.manage',
    'procurement.create', 'procurement.manage', 'procurement.view', 'deal_health.view', 'analytics.view', 'ai.use'
  ],
  FINANCE_DIRECTOR: [
    'quote.view', 'quote.approve', 'quote.confirm',
    'discount.override', 'cost.view', 'margin.view', 'risk.view',
    'product.view', 'customer.view', 'retailer.view', 'billing.view', 'billing.manage', 'subscription.manage',
    'procurement.create', 'procurement.manage', 'procurement.view', 'deal_health.view', 'analytics.view', 'ai.use'
  ],
  OPERATIONS: [
    'quote.view', 'product.view', 'inventory.view', 'inventory.allocate',
    'vendor.view', 'vendor.compare', 'procurement.create', 'procurement.manage', 'procurement.view',
    'fulfillment.manage', 'shipping.manage', 'retailer.view', 'ai.use'
  ],
  WAREHOUSE_MANAGER: [
    'quote.view', 'product.view', 'inventory.view', 'inventory.allocate',
    'fulfillment.manage', 'shipping.manage', 'procurement.create', 'retailer.view', 'ai.use'
  ],
  PROCUREMENT_LEAD: [
    'quote.view', 'product.view', 'inventory.view', 'vendor.view', 'vendor.compare',
    'procurement.create', 'procurement.manage', 'procurement.view', 'fulfillment.manage', 'ai.use'
  ],
  CUSTOMER: [
    'customer.negotiate',
    'quote.view',
    'product.view',
    'billing.view'
  ]
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Platform Superadmin (Global Chief)',
  SUPERADMIN: 'Platform Superadmin (Global Chief)',
  ADMIN: 'Company Administrator',
  RETAILER: 'B2B Retailer / Dealer Partner',
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
  if (user.role === 'SUPER_ADMIN' || user.role === 'SUPERADMIN' || user.role === 'ADMIN') return true;
  return user.permissions?.includes(permission) || false;
}

export function hasRole(user: User | null | undefined, roles: UserRole | UserRole[]): boolean {
  if (!user) return false;
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some(r => {
    if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN') {
      return user.role === 'SUPER_ADMIN' || user.role === 'SUPERADMIN';
    }
    return user.role === r;
  });
}

/**
 * Returns the destination URL corresponding to the user's role on login, registration or role switch
 */
export function getRoleRedirectPath(role: UserRole | string | null | undefined): string {
  if (!role) return '/dashboard';
  const normalized = role.toUpperCase().trim();
  
  if (normalized === 'SUPER_ADMIN' || normalized === 'SUPERADMIN') {
    return '/superadmin/dashboard';
  }
  if (normalized === 'RETAILER') {
    return '/retailer/dashboard';
  }
  if (normalized === 'CUSTOMER') {
    return '/portal';
  }
  if (normalized === 'ADMIN' || normalized === 'SALES_REP' || normalized === 'SALES_MANAGER' || normalized === 'FINANCE' || normalized === 'OPERATIONS' || normalized === 'FINANCE_DIRECTOR' || normalized === 'WAREHOUSE_MANAGER' || normalized === 'PROCUREMENT_LEAD') {
    return '/dashboard';
  }
  return '/dashboard';
}


