import * as React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useTourStore } from '../stores/tour.store';
import { BrandLogo } from '../components/common/BrandLogo';
import { Button } from '../components/ui/button';
import { OnboardingTour } from '../components/onboarding/OnboardingTour';
import {
  LayoutDashboard,
  Store,
  FileText,
  MessageSquare,
  Receipt,
  CreditCard,
  LogOut,
  Sparkles,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';

export function RetailerLayout() {
  const { user, logout } = useAuthStore();
  const { startTour } = useTourStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out of B2B Retailer Portal');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dealer Workspace', path: '/retailer/dashboard', icon: LayoutDashboard },
    { label: 'B2B Quotes & Requests', path: '/retailer/quotes', icon: FileText, dataTour: 'retailer-nav-quotes' },
    { label: 'Live Negotiations', path: '/retailer/negotiations', icon: MessageSquare },
    { label: 'Wholesale Catalog', path: '/retailer/catalog', icon: Store, dataTour: 'retailer-nav-catalog' },
    { label: 'Orders & Invoices', path: '/retailer/orders', icon: Receipt },
  ];

  const retailerDetails = user?.retailerDetails || {
    dealerCode: 'RET-IND-9021',
    tier: 'PLATINUM',
    creditLimit: 500000,
    availableCredit: 385000,
    discountRate: 18.5,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#252733] font-sans flex flex-col selection:bg-[#714b67] selection:text-white no-print">
      {/* Interactive Guided Tour Component for Retailers */}
      <OnboardingTour />

      {/* Top Banner with Dealer Tier & Credit Info */}
      <div className="bg-gradient-to-r from-amber-950 via-[#44233c] to-slate-900 text-white px-4 py-2 text-xs" data-tour="retailer-credit-banner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 text-[10px] uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {retailerDetails.tier} CERTIFIED DEALER
            </span>
            <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
              Code: <strong className="text-white">{retailerDetails.dealerCode}</strong>
            </span>
            <span className="text-amber-200/90 text-[11px] hidden md:inline">
              Base Discount: <strong>{retailerDetails.discountRate}% Off List Price</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-200">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Available Credit:</span>
              <strong className="text-emerald-400 font-mono">
                ₹{(retailerDetails.availableCredit || 385000).toLocaleString('en-IN')}
              </strong>
              <span className="text-slate-400 text-[10px]">
                / ₹{(retailerDetails.creditLimit || 500000).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Retailer Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/retailer/dashboard" className="flex items-center gap-2" data-tour="brand-logo">
              <BrandLogo size="md" />
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 ml-1">
                B2B Portal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-tour={item.dataTour}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#f5eff3] text-[#714b67] font-bold'
                        : 'text-slate-600 hover:text-[#252733] hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#714b67]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Tour Guidance Trigger */}
            <button
              onClick={() => startTour('RETAILER')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-all active:scale-95 select-none shadow-xs"
              title="Start Portal Guidance Tour"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Portal Guide</span>
            </button>

            <div className="flex items-center gap-2.5">
              <img
                src={
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
                }
                alt={user?.name || 'Retailer'}
                className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-[#252733] block truncate max-w-[150px]">
                  {user?.name || 'Retailer Partner'}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold font-mono block">
                  Wholesale Account
                </span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-[#f5eff3] text-[#714b67]' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Outlet Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400">
        <p>DealFlow360 Enterprise B2B Dealer Network • Certified Wholesale Settlement Engine (₹ INR)</p>
      </footer>
    </div>
  );
}

export default RetailerLayout;
