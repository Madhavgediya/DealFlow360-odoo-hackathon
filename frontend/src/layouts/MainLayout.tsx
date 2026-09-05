import * as React from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore, DEMO_COMPANIES } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { useAIStore } from '../stores/ai.store';
import { can } from '../utils/permissions';
import { CurrencyCode } from '../types/api';
import { formatTimeAgo } from '../utils/date';
import { DemoTourBar } from '../components/demo/DemoTourBar';
import { RoleSwitcherBar } from '../components/demo/RoleSwitcherBar';
import { CommandPalette } from '../components/command-menu/CommandPalette';
import { AIChatDrawer } from '../components/ai/AIChatDrawer';
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  ShieldCheck,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '../utils/formatting';
import { Permission } from '../types/auth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: Permission;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function MainLayout() {
  const { user, company, currency, setCompany, setCurrency, logout } = useAuthStore();
  const {
    sidebarCollapsed,
    toggleSidebar,
    setCommandPaletteOpen,
    notifications,
    unreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useUIStore();
  const { toggleDrawer } = useAIStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Comprehensive navigation groups for the whole ERP
  const navigationGroups: NavGroup[] = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        {
          label: 'Quotations',
          path: '/sales/quotes',
          icon: <FileText className="w-4 h-4" />,
          badge: '12',
          badgeColor: 'bg-[#f5eff3] text-[#714b67]',
        },
        {
          label: 'Leads & Pipeline',
          path: '/crm/leads',
          icon: <Users className="w-4 h-4" />,
          badge: '8',
          badgeColor: 'bg-[#f3f4f6] text-[#252733]',
        },
        {
          label: 'Customers',
          path: '/customers',
          icon: <Building className="w-4 h-4" />,
          permission: 'customer.view' as const,
        },
        {
          label: 'Products Catalog',
          path: '/products',
          icon: <Layers className="w-4 h-4" />,
          permission: 'product.view' as const,
        },
        {
          label: 'Approvals',
          path: '/approvals',
          icon: <ShieldCheck className="w-4 h-4" />,
          permission: 'quote.approve' as const,
          badge: '4',
          badgeColor: 'bg-[#f5eff3] text-[#714b67] font-bold',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          label: 'Inventory & Stock',
          path: '/inventory/stock',
          icon: <Layers className="w-4 h-4" />,
          permission: 'inventory.view' as const,
        },
        {
          label: 'Vendors & Sourcing',
          path: '/vendors',
          icon: <Building className="w-4 h-4" />,
          permission: 'vendor.view' as const,
        },
        {
          label: 'Purchase Orders',
          path: '/procurement/purchase-orders',
          icon: <FileText className="w-4 h-4" />,
          permission: 'procurement.manage' as const,
        },
        {
          label: 'Fulfillment',
          path: '/shipping',
          icon: <Truck className="w-4 h-4" />,
          permission: 'fulfillment.manage' as const,
        },
        {
          label: 'Billing & Invoices',
          path: '/billing/invoices',
          icon: <Receipt className="w-4 h-4" />,
          permission: 'billing.view' as const,
        },
        {
          label: 'Subscriptions',
          path: '/subscriptions',
          icon: <FileText className="w-4 h-4" />,
          permission: 'billing.view' as const,
        },
      ],
    },
    {
      title: 'INSIGHTS & TOOLS',
      items: [
        {
          label: 'Analytics',
          path: '/analytics',
          icon: <BarChart3 className="w-4 h-4" />,
          permission: 'analytics.view' as const,
        },
        {
          label: 'Deal Health & Rules',
          path: '/deal-health',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Dynamic breadcrumb label
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/dashboard')) return 'Overview';
    if (p.includes('/sales/quotes/new')) return 'New Quotation';
    if (p.includes('/sales/quotes')) return 'Quotations';
    if (p.includes('/customers')) return 'Customers';
    if (p.includes('/approvals')) return 'Approvals';
    if (p.includes('/shipping')) return 'Fulfillment';
    if (p.includes('/billing')) return 'Billing';
    if (p.includes('/analytics')) return 'Analytics';
    if (p.includes('/deal-health')) return 'Settings & Deal Health';
    if (p.includes('/crm/leads')) return 'Leads & Pipeline';
    if (p.includes('/products')) return 'Products';
    if (p.includes('/vendors')) return 'Vendors';
    if (p.includes('/procurement')) return 'Purchase Orders';
    if (p.includes('/subscriptions')) return 'Subscriptions';
    return 'Workspace';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#252733] flex flex-col font-sans">
      {/* 1. Top Hackathon Hero Walkthrough Controller */}
      <DemoTourBar />

      {/* 2. Top Persona Switcher Bar for Quick Permission Testing */}
      <RoleSwitcherBar />

      {/* 3. Global Top Header */}
      <header className="h-16 border-b border-[#e5e7eb] bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        {/* Left: Breadcrumbs "Workspace / Overview" */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-500">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-[#252733]">{getPageTitle()}</span>
        </div>

        {/* Right: Search, Company, Currency, AI Copilot, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Company Selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#f3f4f6] border border-[#e5e7eb] px-2.5 py-1.5 rounded-xl text-xs text-[#252733]">
            <Building className="w-3.5 h-3.5 text-[#714b67]" />
            <select
              value={company.id}
              onChange={(e) => {
                const found = DEMO_COMPANIES.find((c) => c.id === e.target.value);
                if (found) setCompany(found);
              }}
              className="bg-transparent border-0 text-[#252733] text-xs focus:outline-none cursor-pointer font-medium"
            >
              {DEMO_COMPANIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-[#252733]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-1 bg-[#f3f4f6] border border-[#e5e7eb] px-2.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-mono font-bold text-[11px]">Cur:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent border-0 text-[#252733] font-mono font-semibold text-xs focus:outline-none cursor-pointer"
            >
              <option value="INR" className="bg-white text-[#252733]">INR (₹)</option>
              <option value="USD" className="bg-white text-[#252733]">USD ($)</option>
              <option value="EUR" className="bg-white text-[#252733]">EUR (€)</option>
              <option value="GBP" className="bg-white text-[#252733]">GBP (£)</option>
            </select>
          </div>

          {/* AI Copilot Launcher */}
          <button
            onClick={toggleDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5eff3] hover:bg-[#ecdfe8] text-[#714b67] text-xs font-semibold border border-[#ecdfe8] transition-all active:scale-95 select-none shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#714b67]" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden animate-in zoom-in-95">
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#252733]">Notifications ({unreadNotificationCount} unread)</span>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-semibold text-[#714b67] hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">No notifications right now.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setNotificationsOpen(false);
                          navigate(n.route);
                        }}
                        className={cn(
                          'p-3 rounded-xl text-xs cursor-pointer transition-colors space-y-1',
                          n.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-[#f5eff3]/50 hover:bg-[#f5eff3]'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#252733]">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{formatTimeAgo(n.createdAt)}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customer Portal Shortcut */}
          <Link
            to="/portal"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#e5e7eb] bg-[#f3f4f6] text-[11px] font-medium text-slate-600 hover:text-[#252733] hover:bg-slate-100 transition-colors"
            title="Open isolated Customer Portal"
          >
            <span>Client Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          {/* Top Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#714b67] text-white font-bold text-xs flex items-center justify-center shadow-sm select-none font-display">
            {getInitials(user?.name)}
          </div>
        </div>
      </header>

      {/* 4. Body Shell with Left Sidebar + Main Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={cn(
            'border-r border-[#e5e7eb] bg-white flex flex-col justify-between transition-all duration-300 shrink-0 select-none z-20',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Top: Brand Logo & Section links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {/* QuoteFlow Brand Header */}
            {!sidebarCollapsed ? (
              <div className="px-2 py-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#714b67] flex items-center justify-center text-white font-bold text-base shadow-sm shadow-[#714b67]/20 font-display">
                  Q
                </div>
                <div>
                  <div className="font-bold tracking-tight text-[#252733] text-sm leading-tight font-display">QuoteFlow</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Revenue operations</div>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#714b67] flex items-center justify-center text-white font-bold text-base mx-auto shadow-sm shadow-[#714b67]/20 font-display">
                Q
              </div>
            )}

            {/* Nav Groups */}
            {navigationGroups.map((grp, gIdx) => {
              const visibleItems = grp.items.filter((item) => {
                if (!item.permission) return true;
                return can(user, item.permission);
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={gIdx} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                      {grp.title}
                    </div>
                  )}

                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative',
                          isActive
                            ? 'bg-[#f5eff3] text-[#714b67] font-semibold'
                            : 'text-slate-600 hover:text-[#252733] hover:bg-[#f3f4f6]'
                        )
                      }
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="shrink-0">{item.icon}</div>
                      {!sidebarCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full',
                            item.badgeColor || 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer: Need help card + User Profile Footer */}
          <div className="p-3 space-y-3 border-t border-[#e5e7eb]">
            {/* Help Card */}
            {!sidebarCollapsed && (
              <div className="bg-[#f9f6f8] rounded-2xl p-3.5 border border-[#ecdfe8] space-y-2">
                <div className="w-6 h-6 rounded-full bg-[#f5eff3] text-[#714b67] flex items-center justify-center text-xs font-bold">
                  ?
                </div>
                <div>
                  <div className="text-xs font-bold text-[#252733]">Need help?</div>
                  <div className="text-[11px] text-slate-500">Visit our support center</div>
                </div>
                <button
                  onClick={() => toggleDrawer()}
                  className="text-[11px] font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center gap-1"
                >
                  Get support <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* User Profile Bar */}
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#f5eff3] text-[#714b67] font-bold text-xs flex items-center justify-center border border-[#ecdfe8] shrink-0 font-display">
                  {getInitials(user?.name)}
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#252733] truncate">{user?.name || 'Jordan Davis'}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.roleTitle || 'Sales manager'}</div>
                  </div>
                )}
              </div>

              {!sidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Collapse Sidebar"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f3f4f6] p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette & AI Drawer */}
      <CommandPalette />
      <AIChatDrawer />
    </div>
  );
}
