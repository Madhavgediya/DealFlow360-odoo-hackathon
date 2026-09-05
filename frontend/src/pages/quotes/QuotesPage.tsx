import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Quote } from '../../types/quote';
import { StatusBadge, RiskBadge } from '../../components/common/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, Building, FileEdit, Repeat, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../utils/formatting';

export function QuotesPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = React.useState<'table' | 'kanban'>('table');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [deleteQuoteTarget, setDeleteQuoteTarget] = React.useState<Quote | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', selectedStatus],
    queryFn: () => quotesApi.getQuotes(undefined, selectedStatus === 'ALL' ? undefined : selectedStatus),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotesApi.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quotation deleted successfully');
      setDeleteQuoteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete quote');
    },
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
        <span className="font-bold text-[#252733] font-mono">
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
            'font-semibold font-mono',
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
            'font-bold font-mono',
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
    {
      key: 'actions' as any,
      header: 'Actions',
      cell: (q) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/sales/quotes/${q.id}`)}
            className="h-7 px-2 text-[11px] gap-1 border-[#ecdfe8] bg-[#f5eff3] text-[#714b67] hover:bg-[#ecdfe8]"
            title="Open Quote Builder"
          >
            <FileEdit className="w-3 h-3" />
            Edit
          </Button>
          <button
            onClick={() => navigate(`/sales/negotiations/${q.id}`)}
            className="p-1.5 text-slate-400 hover:text-[#714b67] hover:bg-[#f5eff3] rounded-lg transition-colors"
            title="Negotiation Diff"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteQuoteTarget(q)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Quote"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Quotations' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Commercial Quotations & CPQ
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
            Create Quotation
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

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 text-xs font-mono">
                        <span className="text-slate-400">Margin: {q.grossMarginPercentage.toFixed(1)}%</span>
                        <span className="font-bold text-[#252733]">{formatCurrency(q.totalAmount, currency, { compact: true })}</span>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteQuoteTarget(q)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors text-xs"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Quote Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteQuoteTarget)}
        onClose={() => setDeleteQuoteTarget(null)}
        maxWidth="sm"
        title="Delete Commercial Quotation"
        description={`Are you sure you want to delete quotation ${deleteQuoteTarget?.quoteNumber} for ${deleteQuoteTarget?.customerName}?`}
      >
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeleteQuoteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteQuoteTarget && deleteMutation.mutate(deleteQuoteTarget.id)}
          >
            Delete Quotation
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

