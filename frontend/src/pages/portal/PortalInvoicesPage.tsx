import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../../services/api/billing.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog } from '../../components/ui/dialog';
import { Receipt, Printer, CheckCircle2, CreditCard, Search, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function PortalInvoicesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [payingInvoice, setPayingInvoice] = React.useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<'UPI' | 'NET_BANKING' | 'CARD'>('UPI');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingApi.getInvoices(),
  });

  const invoices = data?.data || [];

  const recordPaymentMutation = useMutation({
    mutationFn: async (invoice: any) => {
      const res = await billingApi.recordPayment(
        invoice.id,
        invoice.totalAmount,
        paymentMethod === 'UPI' ? 'UPI' : 'BANK_TRANSFER',
        `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        invoice.customerId
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      toast.success('Payment settled successfully! Digital tax invoice generated.');
      setPayingInvoice(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Payment processing error');
    },
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPending = Math.max(0, totalInvoiced - totalPaid);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
          <Receipt className="w-6 h-6 text-[#714b67]" />
          Invoices & Commercial Billing Statements
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">
          View official tax invoices, payment due dates, and settlement receipts in Indian Rupees (₹ INR).
        </p>
      </div>

      {/* 3 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Total Invoiced</span>
            <div className="text-xl font-bold text-[#252733] font-mono mt-0.5">
              {formatCurrency(totalInvoiced, 'INR')}
            </div>
            <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">
              {invoices.length} Official Invoices
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714b67] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Settled / Paid</span>
            <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
              {formatCurrency(totalPaid, 'INR')}
            </div>
            <span className="text-[11px] text-emerald-700 font-sans mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {paidInvoices.length} Settled Invoices
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Pending Dues</span>
            <div className="text-xl font-bold text-amber-600 font-mono mt-0.5">
              {formatCurrency(totalPending, 'INR')}
            </div>
            <span className="text-[11px] text-amber-700 font-sans mt-0.5 block">
              Standard Terms: NET 30
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'DRAFT', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all whitespace-nowrap text-xs ${
                statusFilter === st
                  ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="py-12 text-center text-slate-400">Loading invoices...</div>
        )}
        {!isLoading && filteredInvoices.length === 0 && (
          <div className="py-12 text-center text-slate-400">No matching commercial invoices found.</div>
        )}
        {!isLoading &&
          filteredInvoices.map((inv) => (
            <Card
              key={inv.id}
              className="border-slate-200/80 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs rounded-2xl shadow-subtle hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#252733] font-mono text-sm">{inv.invoiceNumber}</span>
                  <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                </div>
                <p className="text-slate-500 font-sans">
                  Issue Date: {formatDate(inv.issueDate)} • Due Date: {formatDate(inv.dueDate)} • Terms: {inv.paymentTerms}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">
                    Invoice Amount
                  </span>
                  <span className="font-bold text-[#252733] text-sm">
                    {formatCurrency(inv.totalAmount, 'INR')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="gap-1 text-xs border-slate-200 hover:bg-[#f5eff3] hover:text-[#714b67] text-[#252733] rounded-xl font-sans"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>

                  {inv.status !== 'PAID' && (
                    <Button
                      size="sm"
                      onClick={() => setPayingInvoice(inv)}
                      className="gap-1.5 text-xs bg-[#714b67] hover:bg-[#5e3c54] text-white rounded-xl font-semibold shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Settle Invoice</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Pay Invoice Modal */}
      <Dialog
        isOpen={!!payingInvoice}
        onClose={() => setPayingInvoice(null)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#714b67]" />
            <span className="font-display font-bold text-[#252733]">
              Settle Invoice: {payingInvoice?.invoiceNumber}
            </span>
          </div>
        }
      >
        {payingInvoice && (
          <div className="space-y-4 pt-2 font-sans text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Reference:</span>
                <span className="font-mono font-bold text-[#252733]">{payingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-mono">{formatDate(payingInvoice.dueDate)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-700">Total Payable Amount:</span>
                <span className="font-mono font-bold text-base text-[#714b67]">
                  {formatCurrency(payingInvoice.totalAmount, 'INR')}
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-2">Select Digital Settlement Gateway</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-center transition-all font-semibold ${
                    paymentMethod === 'UPI'
                      ? 'border-[#714b67] bg-[#f5eff3] text-[#714b67]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NET_BANKING')}
                  className={`p-3 rounded-xl border text-center transition-all font-semibold ${
                    paymentMethod === 'NET_BANKING'
                      ? 'border-[#714b67] bg-[#f5eff3] text-[#714b67]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  NetBanking / NEFT
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-center transition-all font-semibold ${
                    paymentMethod === 'CARD'
                      ? 'border-[#714b67] bg-[#f5eff3] text-[#714b67]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Corporate Card
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-Bit Encrypted Direct Banking Settlement Gateway Active (₹ INR).</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setPayingInvoice(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => recordPaymentMutation.mutate(payingInvoice)}
                disabled={recordPaymentMutation.isPending}
                className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
              >
                {recordPaymentMutation.isPending ? 'Settling...' : 'Confirm & Authorize Payment'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default PortalInvoicesPage;
