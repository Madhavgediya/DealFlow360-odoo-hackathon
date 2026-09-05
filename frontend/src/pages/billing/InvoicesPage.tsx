import { useQuery } from '@tanstack/react-query';
import { billingApi } from '../../services/api/billing.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Invoice, InvoiceStatus } from '../../types/billing';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Receipt, Building, CheckCircle2, Clock, DollarSign } from 'lucide-react';

export function InvoicesPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingApi.getInvoices(),
  });

  const invoices = data?.data || [];

  const columns: ColumnDef<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice # / Customer',
      sortable: true,
      cell: (inv) => (
        <div>
          <div className="font-bold font-mono text-[#252733] group-hover:text-[#714b67] transition-colors">
            {inv.invoiceNumber}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-sans">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{inv.customerName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      sortable: true,
      cell: (inv) => {
        const variants: Record<InvoiceStatus, any> = {
          DRAFT: 'default',
          ISSUED: 'warning',
          PARTIALLY_PAID: 'indigo',
          PAID: 'success',
          OVERDUE: 'destructive',
          CANCELLED: 'default',
        };
        return <Badge variant={variants[inv.status] || 'default'}>{inv.status}</Badge>;
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Invoiced',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono font-bold text-[#252733]">
          {formatCurrency(inv.totalAmount, currency)}
        </span>
      ),
    },
    {
      key: 'amountPaid',
      header: 'Paid Amount',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono text-emerald-600 font-semibold">
          {formatCurrency(inv.amountPaid, currency)}
        </span>
      ),
    },
    {
      key: 'amountDue',
      header: 'Outstanding Balance',
      sortable: true,
      cell: (inv) => (
        <span className="font-mono font-bold text-amber-600">
          {formatCurrency(inv.amountDue, currency)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Payment Due',
      sortable: true,
      cell: (inv) => <span className="font-mono text-slate-500">{formatDate(inv.dueDate)}</span>,
    },
  ];

  return (
    <div>
      <div>
        <Breadcrumbs items={[{ label: 'Billing' }, { label: 'Invoices' }]} />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
          Invoices & Customer Receivables
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">
          Track issued tax invoices, payment collections, and settlement records
        </p>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={invoices}
          isLoading={isLoading}
          searchPlaceholder="Search invoices by invoice #, customer, or quote..."
          onRowClick={(inv) => navigate(`/billing/invoices/${inv.id}`)}
        />
      </div>
    </div>
  );
}
