import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  Package,
  FileText,
  Truck,
  Receipt,
  Repeat,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../utils/formatting';

export function PortalLayout() {
  const { user, switchRole } = useAuthStore();
  const navigate = useNavigate();

  const portalNav = [
    { label: 'Portal Overview', path: '/portal', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Product Catalog', path: '/portal/products', icon: <Package className="w-4 h-4" /> },
    { label: 'My Quotations', path: '/portal/quotes', icon: <FileText className="w-4 h-4" /> },
    { label: 'Active Orders & Tracking', path: '/portal/orders', icon: <Truck className="w-4 h-4" /> },
    { label: 'Invoices & Billing', path: '/portal/invoices', icon: <Receipt className="w-4 h-4" /> },
    { label: 'SaaS Subscriptions', path: '/portal/subscriptions', icon: <Repeat className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#252733] flex flex-col font-sans">
      {/* Client Portal Header */}
      <header className="h-16 border-b border-[#e5e7eb] bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        <div className="flex items-center gap-4">
          <Link to="/portal" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#714b67] flex items-center justify-center text-white font-bold text-base shadow-sm shadow-[#714b67]/20 font-display">
              Q
            </div>
            <div>
              <span className="font-bold text-[#252733] text-sm tracking-tight font-display">
                QuoteFlow
              </span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
                Customer Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Customer Profile & Exit back to ERP */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs hidden sm:block">
            <div className="font-bold text-[#252733]">Acme Corporation</div>
            <div className="text-[11px] text-[#714b67] font-mono">Alex Morgan (Client)</div>
          </div>

          <button
            onClick={() => {
              switchRole('ADMIN');
              navigate('/dashboard');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#e5e7eb] text-xs text-[#252733] shadow-sm transition-colors"
          >
            <span>Return to Workspace</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
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
        © 2026 QuoteFlow • Revenue operations • Secured Client Portal
      </footer>
    </div>
  );
}
