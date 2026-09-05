import * as React from 'react';
import { useUIStore } from '../../stores/ui.store';
import { mockDb } from '../../services/mock/mockDatabase';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Users,
  Package,
  Building2,
  Truck,
  Receipt,
  ShieldCheck,
  ArrowRight,
  UserCircle,
} from 'lucide-react';
import { cn } from '../../utils/formatting';

interface CommandPaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ReactNode;
  route: string;
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const results = React.useMemo<CommandPaletteItem[]>(() => {
    if (!query) {
      return [
        { id: 'quick-profile', title: 'My Profile & Account Management', subtitle: 'Manage personal info, security, 2FA, and preferences', category: 'Account', icon: <UserCircle className="w-4 h-4 text-[#714b67]" />, route: '/profile' },
        { id: 'quick-quotes', title: 'Quotations & Pipeline', category: 'Navigation', icon: <FileText className="w-4 h-4 text-[#714b67]" />, route: '/sales/quotes' },
        { id: 'quick-approvals', title: 'Approval Inbox (Pending)', category: 'Navigation', icon: <ShieldCheck className="w-4 h-4 text-[#714b67]" />, route: '/approvals' },
        { id: 'quick-crm', title: 'CRM Leads & Pipeline', category: 'Navigation', icon: <Users className="w-4 h-4 text-[#252733]" />, route: '/crm/leads' },
        { id: 'quick-products', title: 'Product Catalog & Price Lists', category: 'Navigation', icon: <Package className="w-4 h-4 text-[#714b67]" />, route: '/products' },
        { id: 'quick-vendors', title: 'Vendor Intelligence & Sourcing', category: 'Navigation', icon: <Building2 className="w-4 h-4 text-[#252733]" />, route: '/vendors' },
        { id: 'quick-shipments', title: 'Fulfillment & Carrier Shipments', category: 'Navigation', icon: <Truck className="w-4 h-4 text-[#714b67]" />, route: '/shipping' },
        { id: 'quick-invoices', title: 'Invoices & Billing', category: 'Navigation', icon: <Receipt className="w-4 h-4 text-[#252733]" />, route: '/billing/invoices' },
      ];
    }


    const q = query.toLowerCase();
    const items: CommandPaletteItem[] = [];

    // Search Quotes
    mockDb.getQuotes().forEach((quote) => {
      if (quote.quoteNumber.toLowerCase().includes(q) || quote.customerName.toLowerCase().includes(q)) {
        items.push({
          id: quote.id,
          title: `${quote.quoteNumber} - ${quote.customerName}`,
          subtitle: `Status: ${quote.status} | Total: ₹ ${quote.totalAmount.toLocaleString()}`,
          category: 'Quotes & Deals',
          icon: <FileText className="w-4 h-4 text-[#714b67]" />,
          route: `/sales/quotes/${quote.id}`,
        });
      }
    });

    // Search Leads
    mockDb.getLeads().forEach((lead) => {
      if (lead.fullName.toLowerCase().includes(q) || lead.companyName.toLowerCase().includes(q)) {
        items.push({
          id: lead.id,
          title: `${lead.companyName} (${lead.fullName})`,
          subtitle: `Stage: ${lead.stage} | Score: ${lead.score}/100`,
          category: 'CRM Leads',
          icon: <Users className="w-4 h-4 text-[#252733]" />,
          route: `/crm/leads/${lead.id}`,
        });
      }
    });

    // Search Products
    mockDb.getProducts().forEach((prod) => {
      if (prod.name.toLowerCase().includes(q) || prod.sku.toLowerCase().includes(q)) {
        items.push({
          id: prod.id,
          title: prod.name,
          subtitle: `SKU: ${prod.sku} | Price: ₹ ${prod.basePrice.toLocaleString()}`,
          category: 'Products',
          icon: <Package className="w-4 h-4 text-[#714b67]" />,
          route: `/products/${prod.id}`,
        });
      }
    });

    // Search Vendors
    mockDb.getVendors().forEach((ven) => {
      if (ven.name.toLowerCase().includes(q)) {
        items.push({
          id: ven.id,
          title: ven.name,
          subtitle: `Rating: ${ven.rating} ★ | Avg Lead Time: ${ven.leadTimeAvgDays} days`,
          category: 'Vendors',
          icon: <Building2 className="w-4 h-4 text-[#252733]" />,
          route: `/vendors/${ven.id}`,
        });
      }
    });

    return items.slice(0, 8);
  }, [query]);

  const handleSelect = (route: string) => {
    navigate(route);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-[#252733]/40 backdrop-blur-sm animate-in fade-in"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col font-sans">
        {/* Search header */}
        <div className="flex items-center px-4 py-3 border-b border-[#e5e7eb] bg-[#f3f4f6]/50">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search deals, quotes, leads, products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent border-0 text-sm text-[#252733] placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-[#e5e7eb] rounded-md shadow-subtle">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#f3f4f6]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching results found for "{query}".
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.route)}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-xs',
                  idx === selectedIndex ? 'bg-[#f5eff3] text-[#714b67] font-semibold' : 'text-[#252733] hover:bg-[#f3f4f6]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#f3f4f6] border border-[#e5e7eb] shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-[#252733]">{item.title}</div>
                    {item.subtitle && <div className="text-[11px] text-slate-500">{item.subtitle}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#714b67] bg-[#f5eff3] px-1.5 py-0.5 rounded border border-[#ecdfe8]">
                    {item.category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e5e7eb] bg-[#f3f4f6]/50 text-[11px] text-slate-400">
          <span>Navigate with <strong>↑</strong> <strong>↓</strong></span>
          <span>Press <strong>ENTER</strong> to select</span>
        </div>
      </div>
    </div>
  );
}
