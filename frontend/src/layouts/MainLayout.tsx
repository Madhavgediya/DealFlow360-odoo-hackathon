import * as React from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore, DEMO_COMPANIES } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { useAIStore } from '../stores/ai.store';
import { useTourStore } from '../stores/tour.store';
import { can } from '../utils/permissions';
import { CommandPalette } from '../components/command-menu/CommandPalette';
import { AIChatDrawer } from '../components/ai/AIChatDrawer';
import { NotificationCenterDrawer } from '../components/notifications/NotificationCenterDrawer';
import { OnboardingTour } from '../components/onboarding/OnboardingTour';
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
  Sparkles,
  Layers,
  UserCircle,
  LogOut,
  User,
  Menu,
  X,
  Building2,
  MessageSquare,
  Compass,
} from 'lucide-react';

import { BrandLogo } from '../components/common/BrandLogo';
import { authApi } from '../services/api/auth.api';
import { toast } from 'sonner';
import { cn } from '../utils/formatting';
import { Permission } from '../types/auth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: Permission;
  badge?: string;
  badgeColor?: string;
  dataTour?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function MainLayout() {
  const { user, company, setCompany } = useAuthStore();
  const {
    sidebarCollapsed,
    toggleSidebar,
    setCommandPaletteOpen,
    unreadNotificationCount,
  } = useUIStore();
  const { toggleDrawer } = useAIStore();
  const { startTour } = useTourStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Close mobile drawer on route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Comprehensive navigation groups for the whole ERP
  const baseNavigationGroups: NavGroup[] = [
    {
      title: 'COMMERCIAL WORKSPACE',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        {
          label: 'Quotations',
          path: '/sales/quotes',
          icon: <FileText className="w-4 h-4" />,
          badge: 'Live',
          badgeColor: 'bg-[#f5eff3] text-[#714b67]',
          dataTour: 'nav-quotes',
        },
        {
          label: 'Live Negotiations',
          path: '/sales/negotiations',
          icon: <MessageSquare className="w-4 h-4 text-[#714b67]" />,
          badge: 'Deal Desk',
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
          dataTour: 'nav-negotiations',
        },
        {
          label: 'Leads & Pipeline',
          path: '/crm/leads',
          icon: <Users className="w-4 h-4" />,
          permission: 'lead.view' as const,
          dataTour: 'nav-leads',
        },
        {
          label: 'Customer Accounts',
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
          label: 'Approvals Queue',
          path: '/approvals',
          icon: <ShieldCheck className="w-4 h-4" />,
          permission: 'quote.approve' as const,
          badge: 'Review',
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
          dataTour: 'nav-approvals',
        },
      ],
    },
    {
      title: 'OPERATIONS & FULFILLMENT',
      items: [
        {
          label: 'Warehouses & Stock',
          path: '/inventory/stock',
          icon: <Layers className="w-4 h-4" />,
          permission: 'inventory.view' as const,
        },
        {
          label: 'Vendors & Sourcing',
          path: '/vendors',
          icon: <Building2 className="w-4 h-4" />,
          permission: 'vendor.view' as const,
        },
        {
          label: 'Purchase Orders',
          path: '/procurement/purchase-orders',
          icon: <FileText className="w-4 h-4" />,
          permission: 'procurement.manage' as const,
        },
        {
          label: 'Fulfillment & Logistics',
          path: '/shipping',
          icon: <Truck className="w-4 h-4" />,
          permission: 'fulfillment.manage' as const,
        },
        {
          label: 'Invoices & Billing',
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
      title: 'ANALYTICS & GOVERNANCE',
      items: [
        {
          label: 'RAG AI Copilot',
          path: '/ai-copilot',
          icon: <Sparkles className="w-4 h-4 text-[#714b67]" />,
          badge: 'AI',
          badgeColor: 'bg-[#f5eff3] text-[#714b67] font-bold border border-[#ecdfe8]',
        },
        {
          label: 'Analytics & Revenue',
          path: '/analytics',
          icon: <BarChart3 className="w-4 h-4" />,
          permission: 'analytics.view' as const,
        },
        {
          label: 'Deal Health & Rules',
          path: '/deal-health',
          icon: <Settings className="w-4 h-4" />,
        },
        {
          label: 'My Profile & Account',
          path: '/profile',
          icon: <UserCircle className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        {
          label: 'Staff & Retailer Governance',
          path: '/settings/users',
          icon: <Users className="w-4 h-4 text-[#714b67]" />,
          permission: 'settings.manage' as const,
          badge: 'RBAC',
          badgeColor: 'bg-[#f5eff3] text-[#714b67] font-bold border border-[#ecdfe8]',
        },
        {
          label: 'Roles & Permissions',
          path: '/settings/roles',
          icon: <ShieldCheck className="w-4 h-4 text-[#714b67]" />,
          permission: 'settings.manage' as const,
        },
        {
          label: 'Permissions Registry',
          path: '/settings/permissions',
          icon: <ShieldCheck className="w-4 h-4 text-[#714b67]" />,
          permission: 'settings.manage' as const,
        },
      ],
    },
  ];

  const isSuper = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';

  const navigationGroups: NavGroup[] = isSuper
    ? [
        {
          title: 'PLATFORM MANAGEMENT',
          items: [
            {
              label: 'Superadmin Master Hub',
              path: '/superadmin/dashboard',
              icon: <Building2 className="w-4 h-4 text-[#714b67]" />,
              badge: '⚡ Omnipotent',
              badgeColor: 'bg-[#714b67] text-white font-bold',
              dataTour: 'superadmin-hub',
            },
            {
              label: 'Tenant Companies',
              path: '/settings/companies',
              icon: <Building className="w-4 h-4" />,
            },
            {
              label: 'Platform Users & Retailers',
              path: '/settings/users',
              icon: <Users className="w-4 h-4 text-[#714b67]" />,
            },
          ],
        },
        ...baseNavigationGroups,
      ]
    : baseNavigationGroups;

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/superadmin')) return 'Superadmin Master Hub';
    if (p.includes('/settings/users')) return 'User Access & Employee Credentials';
    if (p.includes('/ai-copilot')) return 'RAG AI Copilot Intelligence';
    if (p.includes('/profile')) return 'Account Profile';
    if (p.includes('/dashboard')) return 'Executive Operations Overview';
    if (p.includes('/sales/quotes/new')) return 'Create Quotation';
    if (p.includes('/sales/quotes')) return 'Commercial Quotations';
    if (p.includes('/customers')) return 'Customer Accounts';
    if (p.includes('/approvals')) return 'Approvals Queue';
    if (p.includes('/shipping')) return 'Fulfillment & Shipments';
    if (p.includes('/billing')) return 'Invoices & Receivables';
    if (p.includes('/analytics')) return 'Revenue & Pipeline Analytics';
    if (p.includes('/deal-health')) return 'Deal Health & Margin Anomalies';
    if (p.includes('/crm/leads')) return 'Leads & Commercial Pipeline';
    if (p.includes('/products')) return 'Product Catalog & Pricing';
    if (p.includes('/vendors')) return 'Vendor Directory & Price Lists';
    if (p.includes('/procurement')) return 'Purchase Orders';
    if (p.includes('/subscriptions')) return 'SaaS Recurring Subscriptions';
    return 'Commercial Operations';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#252733] flex flex-col font-sans no-print">
      {/* Global Interactive Guided Tour Component */}
      <OnboardingTour />

      {/* Global Enterprise Top Header */}
      <header className="h-16 border-b border-[#e5e7eb] bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        {/* Left: Mobile menu toggle + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-[#252733] hover:bg-slate-100 transition-colors"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div data-tour="brand-logo" className="shrink-0">
            <BrandLogo size="sm" showText={false} className="lg:hidden" />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-500">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-[#252733]">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right: Live Connection, Tour Trigger, Search, Company, AI Copilot, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Guided Tour Trigger */}
          <button
            onClick={() => startTour(user?.role)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-all active:scale-95 select-none shadow-xs"
            title="Start Interactive Website Guidance"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden md:inline">Website Guidance</span>
          </button>

          {/* Live Backend Connection Indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] text-emerald-700 font-medium select-none"
            title="DealFlow360 Live API Gateway (Express.js + PostgreSQL)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Live System (₹ INR)</span>
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-[#252733] hover:bg-slate-100 transition-colors"
            title="Search Workspace (⌘K / Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Company Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#f3f4f6] border border-[#e5e7eb] px-2.5 py-1.5 rounded-xl text-xs text-[#252733]">
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

          {/* AI Copilot Drawer Trigger */}
          <button
            data-tour="ai-copilot-trigger"
            onClick={toggleDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5eff3] hover:bg-[#ecdfe8] text-[#714b67] text-xs font-semibold border border-[#ecdfe8] transition-all active:scale-95 select-none shadow-sm"
            title="Open RAG AI Deal Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#714b67]" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Notification Center Trigger */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-[#252733] hover:bg-slate-100 transition-colors relative"
            title="Notifications & Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative" data-tour="user-profile-menu">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#714b67] hover:bg-[#5e3c54] text-white font-bold text-xs flex items-center justify-center shadow-sm select-none font-display transition-all hover:scale-105 active:scale-95"
              title="User Account"
            >
              {getInitials(user?.name)}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden animate-in zoom-in-95 p-1.5 divide-y divide-slate-100">
                <div className="p-2.5">
                  <div className="font-bold text-xs text-[#252733] truncate">{user?.name || 'Authorized User'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email || 'user@dealflow360.com'}</div>
                  <div className="mt-1 inline-block text-[10px] font-semibold text-[#714b67] bg-[#f5eff3] px-2 py-0.5 rounded-full border border-[#ecdfe8]">
                    {user?.roleTitle || 'Commercial Operations'}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-[#f5eff3] hover:text-[#714b67] rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Account Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      startTour(user?.role);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-[#f5eff3] hover:text-[#714b67] rounded-xl transition-colors text-left"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Restart Website Tour</span>
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body: Sidebar (Desktop) + Mobile Drawer + Content Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex border-r border-[#e5e7eb] bg-white flex-col justify-between transition-all duration-250 shrink-0 select-none z-20',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Brand Header & Toggle */}
          <div className="p-3 border-b border-[#e5e7eb] flex items-center justify-between" data-tour="brand-logo">
            <Link to="/dashboard" className="cursor-pointer truncate">
              <BrandLogo size={sidebarCollapsed ? 'sm' : 'md'} showText={!sidebarCollapsed} />
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
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
                      data-tour={item.dataTour}
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
                      {!sidebarCollapsed && <span className="truncate flex-1">{item.label}</span>}
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

          {/* User Profile Summary in Footer */}
          <div className="p-3 border-t border-[#e5e7eb]">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#f5eff3] transition-colors group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#f5eff3] group-hover:bg-[#ecdfe8] text-[#714b67] font-bold text-xs flex items-center justify-center border border-[#ecdfe8] shrink-0">
                {getInitials(user?.name)}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#252733] truncate">{user?.name || 'Operator'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.roleTitle || 'Commercial'}</div>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* Mobile Off-Canvas Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Overlay */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            />

            {/* Off-canvas sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-250">
              <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between bg-slate-50">
                <BrandLogo size="sm" showText={true} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {navigationGroups.map((grp, gIdx) => {
                  const visibleItems = grp.items.filter((item) => {
                    if (!item.permission) return true;
                    return can(user, item.permission);
                  });

                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={gIdx} className="space-y-1">
                      <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                        {grp.title}
                      </div>

                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                              isActive
                                ? 'bg-[#f5eff3] text-[#714b67] font-semibold'
                                : 'text-slate-600 hover:text-[#252733] hover:bg-[#f3f4f6]'
                            )
                          }
                        >
                          <div className="shrink-0">{item.icon}</div>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge && (
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

              <div className="p-4 border-t border-[#e5e7eb] bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#f5eff3] text-[#714b67] font-bold text-xs flex items-center justify-center border border-[#ecdfe8]">
                    {getInitials(user?.name)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-[#252733] truncate">{user?.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user?.roleTitle}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f3f4f6] p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette, AI Drawer & Notification Drawer */}
      <CommandPalette />
      <AIChatDrawer />
      <NotificationCenterDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
