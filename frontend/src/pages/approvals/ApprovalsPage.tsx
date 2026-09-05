import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { approvalsApi } from '../../services/api/approvals.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { ApprovalRequest, ApprovalStatus } from '../../types/approval';
import { RiskBadge } from '../../components/common/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Clock, Building } from 'lucide-react';
import { cn } from '../../utils/formatting';

export function ApprovalsPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = React.useState<string>('PENDING');

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', selectedStatus],
    queryFn: () => approvalsApi.getApprovals(selectedStatus === 'ALL' ? undefined : selectedStatus),
  });

  const approvals = data?.data || [];

  const tabs = [
    { id: 'PENDING', label: 'Pending Inbox', count: approvals.filter((a) => a.status === 'PENDING').length },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'ALL', label: 'All History' },
  ];

  const columns: ColumnDef<ApprovalRequest>[] = [
    {
      key: 'quoteNumber',
      header: 'Quote # / Customer',
      sortable: true,
      cell: (appr) => (
        <div>
          <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors font-sans">
            {appr.quoteNumber}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-sans">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{appr.customerName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (appr) => {
        const variants: Record<ApprovalStatus, any> = {
          PENDING: 'warning',
          APPROVED: 'success',
          REJECTED: 'destructive',
          ESCALATED: 'indigo',
        };
        return <Badge variant={variants[appr.status] || 'default'}>{appr.status}</Badge>;
      },
    },
    {
      key: 'totalAmount',
      header: 'Deal Value',
      sortable: true,
      cell: (appr) => (
        <span className="font-bold text-[#252733] font-mono">
          {formatCurrency(appr.totalAmount, currency)}
        </span>
      ),
    },
    {
      key: 'discountPercentage',
      header: 'Discount %',
      sortable: true,
      cell: (appr) => (
        <span className="font-bold text-rose-600 font-mono">
          {appr.discountPercentage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'grossMarginPercentage',
      header: 'Gross Margin',
      sortable: true,
      cell: (appr) => (
        <span
          className={cn(
            'font-bold font-mono',
            appr.grossMarginPercentage < 18 ? 'text-rose-600' : 'text-emerald-600'
          )}
        >
          {appr.grossMarginPercentage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'riskSeverity',
      header: 'Risk Score',
      sortable: true,
      cell: (appr) => (
        <RiskBadge severity={appr.riskSeverity} score={appr.riskScore} showScore />
      ),
    },
    {
      key: 'requiredRole',
      header: 'Pending Approver',
      cell: (appr) => (
        <span className="font-bold text-[#d97706] text-[11px] font-sans">
          {appr.requiredRole} (Step {appr.currentStep}/{appr.totalSteps})
        </span>
      ),
    },
    {
      key: 'ageHours',
      header: 'Pending Time',
      sortable: true,
      cell: (appr) => (
        <span className="text-slate-500 flex items-center gap-1 text-[11px] font-sans">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {appr.ageHours}h ago
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'Approvals' }]} />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
          Approvals
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-sans">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border',
              selectedStatus === tab.id
                ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#252733]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approval Table */}
      <DataTable
        columns={columns}
        data={approvals}
        isLoading={isLoading}
        searchPlaceholder="Search approvals by quote number, customer, or approver..."
        onRowClick={(appr) => navigate(`/approvals/${appr.id}`)}
        emptyTitle="No approvals pending"
        emptyDescription="All commercial approvals and discount exceptions have been cleared."
      />
    </div>
  );
}
