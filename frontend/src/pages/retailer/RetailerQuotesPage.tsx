import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import {
  FileText,
  Plus,
  MessageSquare,
  CheckCircle2,
  Filter,
  Search,
  Store,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export function RetailerQuotesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [isNewQuoteOpen, setIsNewQuoteOpen] = React.useState(false);

  // Form State for new quote request
  const [selectedProduct, setSelectedProduct] = React.useState('EdgeX Core Enterprise Switch 48G');
  const [quantity, setQuantity] = React.useState(25);
  const [targetUnitPrice, setTargetUnitPrice] = React.useState(19500);
  const [notes, setNotes] = React.useState('');

  // Fetch Quotes from Server
  const { data: quotesResponse, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getQuotes(),
  });

  const quotes = quotesResponse?.data || [];

  const createQuoteMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await quotesApi.createQuote(payload, user?.id, user?.name);
      if (!res.success) throw new Error(res.error || 'Failed to submit quote');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      setIsNewQuoteOpen(false);
      toast.success('Wholesale volume quote submitted directly to company commercial desk!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error creating quotation');
    },
  });

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const estUnitPrice = Number(targetUnitPrice) || 20000;
    const qty = Number(quantity) || 1;

    createQuoteMutation.mutate({
      customerId: user?.id || 'cust-retailer-1',
      priceListId: 'pl-wholesale-tier1',
      paymentTerms: 'NET_30',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      notes: notes || `Wholesale Volume Bid for ${selectedProduct}`,
      lines: [
        {
          productId: 'prod-hardware-node-01',
          productName: selectedProduct,
          quantity: qty,
          unitPrice: estUnitPrice,
          discountPercentage: 0,
        },
      ],
    });
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalWholesaleValue = quotes.reduce((acc, q) => acc + q.totalAmount, 0);
  const activeBidsCount = quotes.filter((q) => q.status === 'DRAFT' || q.status === 'CUSTOMER_NEGOTIATION').length;
  const approvedBidsCount = quotes.filter((q) => q.status === 'APPROVED' || q.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#714b67]" />
            B2B Wholesale Quotations & Deals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit custom bulk volume bids, track counter-offers from company admins, and convert approved quotes to orders.
          </p>
        </div>

        <Button
          onClick={() => setIsNewQuoteOpen(true)}
          className="bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Request New Volume Quote
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Wholesale Deal Flow
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-[#252733]">
              {formatCurrency(totalWholesaleValue, 'INR')}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {quotes.length} bids
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Bids & Negotiations
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-[#714b67]">
              {activeBidsCount}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              In Review
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Approved / Won Orders
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600">
              {approvedBidsCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Ready to Order
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search quotes by ID, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVAL_REQUIRED', 'APPROVED', 'CONFIRMED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all whitespace-nowrap text-xs ${
                statusFilter === st
                  ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Quotes' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Table Card */}
      <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Quote Ref</th>
                <th className="py-3 px-4">Deal Details</th>
                <th className="py-3 px-4">Items / Quantity</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading your wholesale quotes...</td>
                </tr>
              )}
              {!isLoading && filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No matching quotations found.</td>
                </tr>
              )}
              {!isLoading &&
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <span className="text-[#714b67]">{q.quoteNumber}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {formatDate(q.createdAt)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#252733] block">
                        {q.lines[0]?.productName || 'Wholesale Hardware Package'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Valid Until: {formatDate(q.validUntil)} • Terms: {q.paymentTerms}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {q.lines.reduce((acc, l) => acc + l.quantity, 0)} Units ({q.lines.length} lines)
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#252733] text-sm">
                      {formatCurrency(q.totalAmount, q.currency)}
                    </td>

                    <td className="py-3.5 px-4">
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
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => navigate(`/sales/negotiations/${q.id}`)}
                          size="sm"
                          className="bg-[#f5eff3] hover:bg-[#714b67] text-[#714b67] hover:text-white text-xs font-semibold gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Negotiate</span>
                        </Button>
                        {q.status === 'APPROVED' && (
                          <Button
                            onClick={() => {
                              quotesApi.confirmQuote(q.id).then(() => {
                                queryClient.invalidateQueries({ queryKey: ['quotes'] });
                                queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
                                toast.success(`Quote ${q.quoteNumber} confirmed into active purchase order!`);
                                navigate('/retailer/orders');
                              });
                            }}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Order</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Quote Request Modal */}
      <Dialog
        isOpen={isNewQuoteOpen}
        onClose={() => setIsNewQuoteOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Assemble High-Volume Dealer Quote</span>
          </div>
        }
      >
        <form onSubmit={handleCreateQuote} className="space-y-4 pt-2 font-sans text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Select Hardware / Product Line</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
            >
              <option value="EdgeX Core Enterprise Switch 48G">EdgeX Core Enterprise Switch 48G (List: ₹25,000)</option>
              <option value="SensorHub Multi-Sensor IoT Gateway">SensorHub Multi-Sensor IoT Gateway (List: ₹8,000)</option>
              <option value="PowerPro Smart Rackmount PDU 32A">PowerPro Smart Rackmount PDU 32A (List: ₹18,000)</option>
              <option value="RackMaster 42U Server Rack">RackMaster 42U Server Rack (List: ₹55,000)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Requested Volume Quantity (Units) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Target Dealer Bid Unit Price (₹) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={targetUnitPrice}
                onChange={(e) => setTargetUnitPrice(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Estimated List Total:</span>
              <span className="font-mono">{formatCurrency(quantity * 25000, 'INR')}</span>
            </div>
            <div className="flex justify-between font-bold text-[#714b67]">
              <span>Proposed Dealer Order Total:</span>
              <span className="font-mono text-sm">{formatCurrency(quantity * targetUnitPrice, 'INR')}</span>
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Commercial Notes & Delivery Terms</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specify delivery locations, SLA expectations, or target payment terms..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#252733]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewQuoteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#714b67] text-white"
              disabled={createQuoteMutation.isPending}
            >
              {createQuoteMutation.isPending ? 'Submitting Bid...' : 'Submit Wholesale Bid'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default RetailerQuotesPage;
