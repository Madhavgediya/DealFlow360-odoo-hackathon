export const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  UNAUTHORIZED: '/unauthorized',

  // Core ERP
  DASHBOARD: '/dashboard',
  
  // CRM
  CRM_LEADS: '/crm/leads',
  CRM_LEAD_DETAIL: '/crm/leads/:id',
  CRM_PIPELINE: '/crm/pipeline',
  CRM_ACTIVITIES: '/crm/activities',
  
  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: '/customers/:id',
  
  // Products & Pricing
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CATEGORIES: '/products/categories',
  PRICE_LISTS: '/products/price-lists',
  
  // Sales & Quotes
  QUOTES: '/sales/quotes',
  QUOTE_CREATE: '/sales/quotes/new',
  QUOTE_DETAIL: '/sales/quotes/:id',
  NEGOTIATIONS: '/sales/negotiations',
  NEGOTIATION_DETAIL: '/sales/negotiations/:quoteId',
  
  // Approvals
  APPROVALS: '/approvals',
  APPROVAL_DETAIL: '/approvals/:id',
  
  // Inventory
  INVENTORY_WAREHOUSES: '/inventory/warehouses',
  INVENTORY_STOCK: '/inventory/stock',
  INVENTORY_RESERVATIONS: '/inventory/reservations',
  
  // Vendors & Procurement
  VENDORS: '/vendors',
  VENDOR_DETAIL: '/vendors/:id',
  VENDOR_PERFORMANCE: '/vendors/performance',
  PURCHASE_ORDERS: '/procurement/purchase-orders',
  PURCHASE_ORDER_DETAIL: '/procurement/purchase-orders/:id',
  
  // Fulfillment & Shipping
  FULFILLMENT: '/fulfillment',
  FULFILLMENT_DETAIL: '/fulfillment/:id',
  SHIPPING: '/shipping',
  SHIPPING_DETAIL: '/shipping/:id',
  
  // Subscriptions & Billing
  SUBSCRIPTION_PLANS: '/subscriptions/plans',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_DETAIL: '/subscriptions/:id',
  INVOICES: '/billing/invoices',
  INVOICE_DETAIL: '/billing/invoices/:id',
  PAYMENTS: '/billing/payments',
  
  // Deal Health & Analytics
  DEAL_HEALTH: '/deal-health',
  ANALYTICS: '/analytics',
  
  // AI & Settings
  AI_ASSISTANT: '/ai',
  SETTINGS: '/settings',

  // Customer Portal (Separated)
  PORTAL_DASHBOARD: '/portal',
  PORTAL_PRODUCTS: '/portal/products',
  PORTAL_QUOTES: '/portal/quotes',
  PORTAL_QUOTE_DETAIL: '/portal/quotes/:id',
  PORTAL_NEGOTIATIONS: '/portal/negotiations',
  PORTAL_ORDERS: '/portal/orders',
  PORTAL_INVOICES: '/portal/invoices',
  PORTAL_SUBSCRIPTIONS: '/portal/subscriptions',
};
