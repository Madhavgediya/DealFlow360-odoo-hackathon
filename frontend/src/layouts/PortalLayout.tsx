import * as React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { BrandLogo } from '../components/common/BrandLogo';
import { authApi } from '../services/api/auth.api';
import { toast } from 'sonner';
import {
  Package,
  FileText,
  Truck,
  Receipt,
  Repeat,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '../utils/formatting';

export function PortalLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success('Logged out of DealFlow360 Portal');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const portalNav = [
    { label: 'Portal Overview', path: '/portal', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Product Catalog', path: '/portal/products', icon: <Package className="w-4 h-4" /> },
    { label: 'My Quotations', path: '/portal/quotes', icon: <FileText className="w-4 h-4" /> },
    { label: 'Active Orders & Tracking', path: '/portal/orders', icon: <Truck className="w-4 h-4" /> },
    { label: 'Invoices & Billing', path: '/portal/invoices', icon: <Receipt className="w-4 h-4" /> },
    { label: 'SaaS Subscriptions', path: '/portal/subscriptions', icon: <Repeat className="w-4 h-4" /> },
    { label: 'My Profile', path: '/portal/profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#252733] flex flex-col font-sans no-print">
      {/* Client Portal Header */}
      <header className="h-16 border-b border-[#e5e7eb] bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        <div className="flex items-center gap-4">
          <Link to="/portal" className="flex items-center gap-3">
            <BrandLogo size="md" />
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              Client Portal (₹ INR)
            </span>
          </Link>
        </div>

        {/* Customer Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs hidden sm:block">
            <div className="font-bold text-[#252733]">{user?.name || 'Commercial Client'}</div>
            <div className="text-[11px] text-[#714b67] font-medium">{user?.email || 'client@enterprise.com'}</div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Portal Navigation Bar */}
      <div className="bg-white border-b border-[#e5e7eb] px-4 sm:px-8 flex items-center gap-2 overflow-x-auto py-1.5 shadow-subtle">
        {portalNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/portal'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-[#f5eff3] text-[#714b67] font-semibold'
                  : 'text-slate-600 hover:text-[#252733] hover:bg-slate-50'
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Portal Main Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-[#e5e7eb] bg-white py-6 px-4 text-center text-xs text-slate-400">
        © 2026 DealFlow360 • Enterprise Commercial Operations • Secured Client Portal (₹ INR)
      </footer>
    </div>
  );
}

export default PortalLayout;
