import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../../services/api/customers.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Customer } from '../../types/customer';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function CustomersPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers(),
  });

  const customers = data?.data || [];

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Account / Code',
      sortable: true,
      cell: (c) => (
        <div>
          <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors">
            {c.name}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{c.code}</div>
        </div>
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      sortable: true,
      cell: (c) => {
        const variants: Record<string, any> = {
          PLATINUM: 'indigo',
          GOLD: 'warning',
          SILVER: 'secondary',
          STANDARD: 'default',
        };
        return <Badge variant={variants[c.tier] || 'default'}>{c.tier}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      cell: (c) =>
        c.status === 'TRIAL' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
            <Sparkles className="w-3 h-3" />
            7-Day Trial ({c.trialDaysRemaining}d left)
          </span>
        ) : (
          <Badge variant="success">ACTIVE</Badge>
        ),
    },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      sortable: true,
      cell: (c) => (
        <span className="text-[#252733]">
          {formatCurrency(c.creditLimit, currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      cell: (c) => <span className="font-mono text-xs text-slate-600">{c.paymentTerms}</span>,
    },
    {
      key: 'totalRevenue',
      header: 'Lifetime Spend',
      sortable: true,
      cell: (c) => (
        <span className="font-bold text-emerald-600">
          {formatCurrency(c.totalRevenue, currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Onboarded',
      sortable: true,
      cell: (c) => <span className="text-slate-500">{formatDate(c.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'Customers' }]} />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
          Customers
        </h1>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchPlaceholder="Search customer accounts by name or code..."
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
      />
    </div>
  );
}
