import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Plus, Search, Filter } from 'lucide-react';

export function PortalQuotesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getQuotes(),
  });

  const quotes = data?.data || [];

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalProposalsValue = quotes.reduce((acc, q) => acc + q.totalAmount, 0);
  const activeProposalsCount = quotes.filter((q) => q.status !== 'CONFIRMED' && q.status !== 'REJECTED').length;
  const signedAgreementsCount = quotes.filter((q) => q.status === 'CONFIRMED' || q.status === 'APPROVED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#714b67]" />
            Commercial Quotations & Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Review formal commercial proposals, submit counter-offer concessions, and accept signed agreements.
          </p>
        </div>

        <Button
          onClick={() => navigate('/portal/products')}
          className="bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm gap-1.5 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Assemble New Proposal
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Proposals Value
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-[#252733]">
              {formatCurrency(totalProposalsValue, 'INR')}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {quotes.length} total
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Proposals Under Review
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-[#714b67]">
              {activeProposalsCount}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Review & Sign
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Signed & Executed Deals
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600">
              {signedAgreementsCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Active Orders
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search quotations by quote ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'DRAFT', 'APPROVAL_REQUIRED', 'APPROVAL_IN_PROGRESS', 'APPROVED', 'CONFIRMED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all whitespace-nowrap text-xs ${
                statusFilter === st
                  ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Proposals' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="py-12 text-center text-slate-400">Loading quotations...</div>
        )}
        {!isLoading && filteredQuotes.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            No matching quotations found. Click "Assemble New Proposal" to get started.
          </div>
        )}
        {!isLoading &&
          filteredQuotes.map((q) => (
            <Card
              key={q.id}
              onClick={() => navigate(`/portal/quotes/${q.id}`)}
              className="border-slate-200/80 bg-white hover:border-[#714b67]/40 hover:shadow-md cursor-pointer transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs group rounded-2xl shadow-subtle"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[#252733] font-mono text-base group-hover:text-[#714b67] transition-colors">
                    {q.quoteNumber}
                  </span>
                  <Badge
                    variant={
                      q.status === 'CONFIRMED' || q.status === 'APPROVED'
                        ? 'success'
                        : q.status === 'APPROVAL_REQUIRED' || q.status === 'APPROVAL_IN_PROGRESS' || q.status === 'CUSTOMER_NEGOTIATION'
                        ? 'warning'
                        : 'outline'
                    }
                  >
                    {q.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-slate-500 font-sans">
                  {q.lines.length} Line Item{q.lines.length > 1 ? 's' : ''} • Valid Until: {formatDate(q.validUntil)} • Payment Terms: {q.paymentTerms}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">
                    Total Proposal Amount
                  </span>
                  <span className="font-bold text-[#252733] text-base">
                    {formatCurrency(q.totalAmount, q.currency)}
                  </span>
                </div>
                <Button size="sm" className="gap-1 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white rounded-xl">
                  <span>View & Negotiate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export default PortalQuotesPage;
