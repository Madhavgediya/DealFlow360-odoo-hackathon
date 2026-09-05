import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '../../types/auth';
import { UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RoleSwitcherBar() {
  const { user, switchRole } = useAuthStore();
  const navigate = useNavigate();

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Admin', desc: 'Full System Access' },
    { role: 'SALES_MANAGER', label: 'Sales Director', desc: 'Approvals & Margins' },
    { role: 'SALES_REP', label: 'Sales Rep', desc: 'CRM & Quotes' },
    { role: 'FINANCE_DIRECTOR', label: 'CFO', desc: 'Financial Approvals & Billing' },
    { role: 'WAREHOUSE_MANAGER', label: 'Warehouse Head', desc: 'Inventory & Stock' },
    { role: 'PROCUREMENT_LEAD', label: 'Procurement', desc: 'Vendor Intelligence & POs' },
    { role: 'CUSTOMER', label: 'Customer Portal', desc: 'Client View (Zero Margin Leak)' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    if (role === 'CUSTOMER') {
      navigate('/portal');
    } else if (window.location.pathname.startsWith('/portal')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-4 bg-[#f3f4f6] border-b border-[#e5e7eb] text-xs">
      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
        <UserCheck className="w-3.5 h-3.5 text-[#714b67]" />
        Role Persona:
      </span>

      <div className="flex items-center gap-1">
        {roles.map((r) => {
          const isActive = user?.role === r.role;
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
