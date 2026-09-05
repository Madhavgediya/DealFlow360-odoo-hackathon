import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PortalLayout } from '../layouts/PortalLayout';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { LeadsPage } from '../pages/crm/LeadsPage';
import { LeadDetailPage } from '../pages/crm/LeadDetailPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ProductDetailPage } from '../pages/products/ProductDetailPage';
import { QuotesPage } from '../pages/quotes/QuotesPage';
import { QuoteBuilderPage } from '../pages/quotes/QuoteBuilderPage';
import { ApprovalsPage } from '../pages/approvals/ApprovalsPage';
import { ApprovalDetailPage } from '../pages/approvals/ApprovalDetailPage';
import { NegotiationDetailPage } from '../pages/negotiations/NegotiationDetailPage';
import { WarehousesPage } from '../pages/inventory/WarehousesPage';
import { StockPage } from '../pages/inventory/StockPage';
import { VendorsPage } from '../pages/vendors/VendorsPage';
import { VendorComparePage } from '../pages/vendors/VendorComparePage';
import { PurchaseOrdersPage } from '../pages/procurement/PurchaseOrdersPage';
import { ShipmentsPage } from '../pages/shipping/ShipmentsPage';
import { SubscriptionsPage } from '../pages/subscriptions/SubscriptionsPage';
import { InvoicesPage } from '../pages/billing/InvoicesPage';
import { InvoiceDetailPage } from '../pages/billing/InvoiceDetailPage';
import { DealHealthPage } from '../pages/deal-health/DealHealthPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { PortalDashboardPage } from '../pages/portal/PortalDashboardPage';

import { PortalProductsPage } from '../pages/portal/PortalProductsPage';
import { PortalQuotesPage } from '../pages/portal/PortalQuotesPage';
import { PortalQuoteDetailPage } from '../pages/portal/PortalQuoteDetailPage';
import { PortalOrdersPage } from '../pages/portal/PortalOrdersPage';
import { PortalInvoicesPage } from '../pages/portal/PortalInvoicesPage';
import { PortalSubscriptionsPage } from '../pages/portal/PortalSubscriptionsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  // Main ERP Layout Routes
  {
    path: '/',

    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // CRM
      {
        path: 'crm/leads',
        element: <LeadsPage />,
      },
      {
        path: 'crm/leads/:id',
        element: <LeadDetailPage />,
      },
      // Customers
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'customers/:id',
        element: <CustomerDetailPage />,
      },
      // Products
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      // Quotes & Negotiations
      {
        path: 'sales/quotes',
        element: <QuotesPage />,
      },
      {
        path: 'sales/quotes/new',
        element: <QuoteBuilderPage />,
      },
      {
        path: 'sales/quotes/:id',
        element: <QuoteBuilderPage />,
      },
      {
        path: 'sales/negotiations',
        element: <NegotiationDetailPage />,
      },
      {
        path: 'sales/negotiations/:quoteId',
        element: <NegotiationDetailPage />,
      },
      // Approvals
      {
        path: 'approvals',
        element: <ApprovalsPage />,
      },
      {
        path: 'approvals/:id',
        element: <ApprovalDetailPage />,
      },
      // Inventory
      {
        path: 'inventory/warehouses',
        element: <WarehousesPage />,
      },
      {
        path: 'inventory/stock',
        element: <StockPage />,
      },
      // Vendors
      {
        path: 'vendors',
        element: <VendorsPage />,
      },
      {
        path: 'vendors/compare/:productId',
        element: <VendorComparePage />,
      },
      // Procurement & Shipping
      {
        path: 'procurement/purchase-orders',
        element: <PurchaseOrdersPage />,
      },
      {
        path: 'shipping',
        element: <ShipmentsPage />,
      },
      {
        path: 'shipping/:id',
        element: <ShipmentsPage />,
      },
      // Subscriptions & Billing
      {
        path: 'subscriptions',
        element: <SubscriptionsPage />,
      },
      {
        path: 'billing/invoices',
        element: <InvoicesPage />,
      },
      {
        path: 'billing/invoices/:id',
        element: <InvoiceDetailPage />,
      },
      // Deal Health & Analytics
      {
        path: 'deal-health',
        element: <DealHealthPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      // Profile & Account Management
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings/profile',
        element: <ProfilePage />,
      },
    ],
  },
  // Customer Portal Layout Routes (Isolated)
  {
    path: '/portal',
    element: <PortalLayout />,
    children: [
      {
        index: true,
        element: <PortalDashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },

      {
        path: 'products',
        element: <PortalProductsPage />,
      },
      {
        path: 'quotes',
        element: <PortalQuotesPage />,
      },
      {
        path: 'quotes/:id',
        element: <PortalQuoteDetailPage />,
      },
      {
        path: 'orders',
        element: <PortalOrdersPage />,
      },
      {
        path: 'invoices',
        element: <PortalInvoicesPage />,
      },
      {
        path: 'subscriptions',
        element: <PortalSubscriptionsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
