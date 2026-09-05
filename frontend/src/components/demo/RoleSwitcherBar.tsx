import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '../../types/auth';
import { UserCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRoleRedirectPath } from '../../utils/permissions';

export function RoleSwitcherBar() {
  const { user, switchRole } = useAuthStore();
  const navigate = useNavigate();

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: '⚡ Superadmin', desc: 'Omnipotent Multi-Company Hub & Global Admin Creator' },
    { role: 'ADMIN', label: '👑 Company Admin', desc: 'Full Company CRM, CPQ, Retailer & Staff Management' },
    { role: 'RETAILER', label: '🏪 B2B Retailer', desc: 'Wholesale Catalog, Volume Bids & Negotiation Desk' },
    { role: 'SALES_MANAGER', label: 'Sales Director', desc: 'Approvals & Discount Overrides' },
    { role: 'SALES_REP', label: 'Sales Rep', desc: 'CRM Pipeline & CPQ Quotes' },
    { role: 'FINANCE', label: 'Finance / CFO', desc: 'Margin Approvals & Invoicing' },
    { role: 'OPERATIONS', label: 'Operations', desc: 'Inventory, Warehouses & POs' },
    { role: 'CUSTOMER', label: 'Customer Portal', desc: 'Client View (Zero Margin Leak)' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    const targetUrl = getRoleRedirectPath(role);
    navigate(targetUrl);
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-4 bg-[#f3f4f6] border-b border-[#e5e7eb] text-xs">
      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
        <UserCheck className="w-3.5 h-3.5 text-[#714b67]" />
        Role Persona:
      </span>

      <div className="flex items-center gap-1">
        {roles.map((r) => {
          const isActive =
            user?.role === r.role ||
            (r.role === 'SUPER_ADMIN' && user?.role === 'SUPERADMIN') ||
            (r.role === 'FINANCE' && user?.role === 'FINANCE_DIRECTOR') ||
            (r.role === 'OPERATIONS' &&
              (user?.role === 'WAREHOUSE_MANAGER' || user?.role === 'PROCUREMENT_LEAD'));

          return (
            <button
              key={r.role}
              onClick={() => handleRoleSelect(r.role)}
              title={r.desc}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-[#714b67] text-white border-[#714b67] shadow-sm font-semibold'
                  : 'bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f5eff3] hover:text-[#714b67] shadow-subtle'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


