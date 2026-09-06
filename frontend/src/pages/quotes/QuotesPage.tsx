import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Quote, QuoteStatus } from '../../types/quote';
import { StatusBadge, RiskBadge } from '../../components/common/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  LayoutGrid,
  List,
  Building,
  FileEdit,
  Repeat,
  Trash2,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../utils/formatting';

export function QuotesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = React.useState<'table' | 'kanban'>('table');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [deleteQuoteTarget, setDeleteQuoteTarget] = React.useState<Quote | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', selectedStatus],
    queryFn: () => quotesApi.getQuotes(undefined, selectedStatus === 'ALL' ? undefined : selectedStatus),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotesApi.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      toast.success('Quotation deleted successfully');
      setDeleteQuoteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete quote');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (args: { id: string; status: QuoteStatus }) =>
      quotesApi.updateQuoteStatus(args.id, args.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      toast.success('Quotation status updated');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update status');
    },
  });

  const quotes = data?.data || [];

  // Live Pipeline Financial Analytics
  const totalPipelineGMV = quotes
    .filter((q) => q.status !== 'REJECTED')
    .reduce((acc, q) => acc + q.totalAmount, 0);
  const activeProposalsCount = quotes.filter(
    (q) => q.status === 'DRAFT' || q.status === 'CUSTOMER_NEGOTIATION'
  ).length;
  const pendingApprovalsCount = quotes.filter(
    (q) => q.status === 'APPROVAL_REQUIRED' || q.status === 'REAPPROVAL_REQUIRED' || q.status === 'APPROVAL_IN_PROGRESS'
  ).length;
  const wonDealsCount = quotes.filter((q) => q.status === 'CONFIRMED' || q.status === 'APPROVED').length;

  const filteredQuotes = quotes.filter((q) => {
    const term = searchQuery.toLowerCase();
    return (
      q.quoteNumber.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      (q.salespersonName || '').toLowerCase().includes(term) ||
      q.status.toLowerCase().includes(term)
    );
  });

  const statusTabs = [
    { id: 'ALL', label: 'All Quotes', count: quotes.length },
    { id: 'DRAFT', label: 'Draft', count: quotes.filter((q) => q.status === 'DRAFT').length },
    { id: 'APPROVAL_REQUIRED', label: 'Needs Approval', count: pendingApprovalsCount },
    { id: 'APPROVED', label: 'Approved', count: quotes.filter((q) => q.status === 'APPROVED').length },
    { id: 'CUSTOMER_NEGOTIATION', label: 'In Negotiation', count: quotes.filter((q) => q.status === 'CUSTOMER_NEGOTIATION').length },
    { id: 'CONFIRMED', label: 'Won Deals', count: quotes.filter((q) => q.status === 'CONFIRMED').length },
  ];

  const columns: ColumnDef<Quote>[] = [
    {
      key: 'quoteNumber',
      header: 'Quote # / Customer',
      sortable: true,
      cell: (q) => (
        <div>
          <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors font-mono">
            {q.quoteNumber}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-sans">
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
      header: 'Net Total (₹ INR)',
      sortable: true,
      cell: (q) => (
        <span className="font-bold text-[#252733] font-mono text-sm">
          {formatCurrency(q.totalAmount, 'INR')}
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
      header: 'Risk Level',
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
      key: 'salespersonName',
      header: 'Sales Rep',
      cell: (q) => <span className="text-slate-600">{q.salespersonName || 'Sales Desk'}</span>,
    },
    {
      key: 'validUntil',
      header: 'Expiry Date',
      sortable: true,
      cell: (q) => <span className="text-slate-500 font-mono">{formatDate(q.validUntil)}</span>,
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
            className="h-7 px-2.5 text-xs gap-1 border-[#ecdfe8] bg-[#f5eff3] text-[#714b67] hover:bg-[#ecdfe8] rounded-lg"
            title="Open Quote Builder"
          >
            <FileEdit className="w-3 h-3" />
            <span>Edit</span>
          </Button>
          <button
            onClick={() => navigate(`/sales/negotiations/${q.id}`)}
            className="p-1.5 text-slate-400 hover:text-[#714b67] hover:bg-[#f5eff3] rounded-lg transition-colors"
            title="Negotiation Room"
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

  const kanbanColumns: { id: QuoteStatus; title: string; color: string }[] = [
    { id: 'DRAFT', title: 'Draft Proposals', color: 'border-slate-300' },
    { id: 'APPROVAL_REQUIRED', title: 'Governance Review', color: 'border-amber-400' },
    { id: 'APPROVED', title: 'Approved / Ready', color: 'border-blue-400' },
    { id: 'CUSTOMER_NEGOTIATION', title: 'Customer Negotiation', color: 'border-purple-400' },
    { id: 'CONFIRMED', title: 'Won Deals', color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Quotations' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display flex items-center gap-2">
            Commercial Quotations & CPQ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-line proposals in Indian Rupees (₹ INR), enforce margin governance, and track revisions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle (Table / Kanban) */}
          <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'table' ? 'bg-[#f5eff3] text-[#714b67]' : 'text-slate-400 hover:text-slate-600'
              )}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'kanban' ? 'bg-[#f5eff3] text-[#714b67]' : 'text-slate-400 hover:text-slate-600'
              )}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => navigate('/sales/quotes/new')}
            className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create Quotation
          </Button>
        </div>
      </div>

      {/* KPI Metrics Summary Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Pipeline Value
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-[#252733]">
              {formatCurrency(totalPipelineGMV, 'INR')}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {quotes.length} deals
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Proposals
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-[#714b67]">
              {activeProposalsCount}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              In Draft / Neg.
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Governance Review
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-600">
              {pendingApprovalsCount}
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Requires Approval
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Won Deals / Signed
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600">
              {wonDealsCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Converted
            </span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search by quote #, customer, rep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl font-medium border text-xs whitespace-nowrap transition-all',
                selectedStatus === tab.id
                  ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Kanban */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredQuotes}
          isLoading={isLoading}
          onRowClick={(q) => navigate(`/sales/quotes/${q.id}`)}
          searchKey="customerName"
        />
      ) : (
        /* Dynamic Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kanbanColumns.map((col) => {
            const colQuotes = filteredQuotes.filter((q) => {
              if (col.id === 'APPROVAL_REQUIRED') {
                return (
                  q.status === 'APPROVAL_REQUIRED' ||
                  q.status === 'APPROVAL_IN_PROGRESS' ||
                  q.status === 'REAPPROVAL_REQUIRED'
                );
              }
              return q.status === col.id;
            });

            return (
              <div
                key={col.id}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[450px]"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs text-[#252733] font-display">{col.title}</span>
                  <Badge variant="outline" className="text-[10px] bg-white font-mono font-bold">
                    {colQuotes.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {colQuotes.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => navigate(`/sales/quotes/${q.id}`)}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-[#714b67]/40 hover:shadow-md cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#714b67] font-mono text-xs">{q.quoteNumber}</span>
                        <RiskBadge
                          severity={q.riskAssessment?.overallSeverity || 'LOW'}
                          score={q.riskAssessment?.overallScore}
                        />
                      </div>
                      <div className="font-bold text-[#252733] truncate">{q.customerName}</div>
                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-100">
                        <span className="text-slate-400">Total (₹):</span>
                        <span className="font-bold text-[#252733]">{formatCurrency(q.totalAmount, 'INR')}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Margin: {q.grossMarginPercentage.toFixed(1)}%</span>
                        <span>Rev {q.currentRevisionNumber}</span>
                      </div>
                    </div>
                  ))}
                  {colQuotes.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs italic">
                      No proposals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteQuoteTarget}
        onClose={() => setDeleteQuoteTarget(null)}
        maxWidth="sm"
        title="Delete Quotation"
        description={`Are you sure you want to delete quotation ${deleteQuoteTarget?.quoteNumber}?`}
      >
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 font-sans text-xs">
          <Button variant="secondary" size="sm" onClick={() => setDeleteQuoteTarget(null)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(deleteQuoteTarget!.id)}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default QuotesPage;
