import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Quote } from '../../types/quote';
import { StatusBadge, RiskBadge } from '../../components/common/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, Building } from 'lucide-react';
import { cn } from '../../utils/formatting';

export function QuotesPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<'table' | 'kanban'>('table');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', selectedStatus],
    queryFn: () => quotesApi.getQuotes(undefined, selectedStatus === 'ALL' ? undefined : selectedStatus),
  });

  const quotes = data?.data || [];

  const statusTabs = [
    { id: 'ALL', label: 'All Quotes', count: quotes.length },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'APPROVAL_REQUIRED', label: 'Needs Approval' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'CUSTOMER_NEGOTIATION', label: 'In Negotiation' },
    { id: 'REAPPROVAL_REQUIRED', label: 'Reapproval Req.' },
    { id: 'CONFIRMED', label: 'Won' },
  ];

  const columns: ColumnDef<Quote>[] = [
    {
      key: 'quoteNumber',
      header: 'Quote # / Customer',
      sortable: true,
      cell: (q) => (
        <div>
          <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors">
            {q.quoteNumber}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{q.customerName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Deal Status',
      sortable: true,
      cell: (q) => <StatusBadge status={q.status} />,
    },
    {
      key: 'totalAmount',
      header: 'Net Total Amount',
      sortable: true,
      cell: (q) => (
        <span className="font-bold text-[#252733]">
          {formatCurrency(q.totalAmount, currency)}
        </span>
      ),
    },
    {
      key: 'discountPercentage',
      header: 'Discount %',
      sortable: true,
      cell: (q) => (
        <span
          className={cn(
            'font-semibold',
            q.discountPercentage > 15
              ? 'text-rose-600'
              : q.discountPercentage > 10
              ? 'text-amber-600'
              : 'text-slate-600'
          )}
        >
          {q.discountPercentage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'grossMarginPercentage',
      header: 'Gross Margin',
      sortable: true,
      cell: (q) => (
        <span
          className={cn(
            'font-bold',
            q.grossMarginPercentage < 18 ? 'text-rose-600' : 'text-emerald-600'
          )}
        >
          {q.grossMarginPercentage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'riskAssessment',
      header: 'AI Risk Level',
      sortable: true,
      cell: (q) => (
        <RiskBadge
          severity={q.riskAssessment?.overallSeverity || 'LOW'}
          score={q.riskAssessment?.overallScore}
          showScore
        />
      ),
    },
    {
      key: 'currentRevisionNumber',
      header: 'Revision',
      cell: (q) => <span className="text-xs text-slate-500 font-mono">Rev {q.currentRevisionNumber}</span>,
    },
    {
      key: 'salespersonName',
      header: 'Sales Rep',
      cell: (q) => <span className="text-slate-600">{q.salespersonName}</span>,
    },
    {
      key: 'validUntil',
      header: 'Expiry Date',
      sortable: true,
      cell: (q) => <span className="text-slate-500">{formatDate(q.validUntil)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Quotations' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Quotations
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Table / Kanban) */}
          <div className="flex items-center bg-white border border-[#e5e7eb] p-0.5 rounded-xl shadow-subtle">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 rounded-lg text-xs transition-colors',
                viewMode === 'table' ? 'bg-[#f5eff3] text-[#714b67] font-semibold' : 'text-slate-400 hover:text-slate-700'
              )}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-2 rounded-lg text-xs transition-colors',
                viewMode === 'kanban' ? 'bg-[#f5eff3] text-[#714b67] font-semibold' : 'text-slate-400 hover:text-slate-700'
              )}
              title="Kanban Pipeline View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/sales/quotes/new')}
            className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <Plus className="w-4 h-4" />
            New quotation
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border',
              selectedStatus === tab.id
                ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-subtle'
                : 'bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6] hover:text-[#714b67]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View: Table vs Kanban */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={quotes}
          isLoading={isLoading}
          searchPlaceholder="Search quotations by quote #, customer, sales rep..."
          onRowClick={(q) => navigate(`/sales/quotes/${q.id}`)}
          emptyTitle="No quotes matching this filter"
          emptyDescription="Create a new quote to start calculating commercial risk."
        />
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {['DRAFT', 'APPROVAL_REQUIRED', 'CUSTOMER_NEGOTIATION', 'CONFIRMED'].map((colStatus) => {
            const colQuotes = quotes.filter((q) => q.status === colStatus || (colStatus === 'APPROVAL_REQUIRED' && q.status === 'REAPPROVAL_REQUIRED'));
            return (
              <div key={colStatus} className="bg-[#f3f4f6] rounded-2xl border border-[#e5e7eb] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#252733]">
                    {colStatus === 'CUSTOMER_NEGOTIATION' ? 'In Negotiation' : colStatus.replace('_', ' ')}
                  </span>
                  <Badge variant="secondary" size="sm">{colQuotes.length}</Badge>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {colQuotes.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => navigate(`/sales/quotes/${q.id}`)}
                      className="p-4 rounded-2xl border border-[#e5e7eb] bg-white hover:border-[#714b67]/50 hover:shadow-md cursor-pointer transition-all space-y-2.5 group shadow-subtle"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-[#252733] group-hover:text-[#714b67]">
                          {q.quoteNumber}
                        </span>
                        <RiskBadge severity={q.riskAssessment?.overallSeverity || 'LOW'} />
                      </div>

                      <div className="text-xs font-semibold text-slate-700 truncate">
                        {q.customerName}
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400">Margin: {q.grossMarginPercentage.toFixed(1)}%</span>
                        <span className="font-bold text-[#252733]">{formatCurrency(q.totalAmount, currency, { compact: true })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
