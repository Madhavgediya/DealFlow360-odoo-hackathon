import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../../services/api/billing.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Receipt,
  CheckCircle2,
  DollarSign,
  Printer,
  Building,
  CreditCard,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency } = useAuthStore();

  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [payAmount, setPayAmount] = React.useState<number>(0);
  const [payMethod, setPayMethod] = React.useState<string>('BANK_TRANSFER');
  const [payRef, setPayRef] = React.useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => billingApi.getInvoiceById(id || 'inv-1024'),
  });

  const invoice = data?.data;

  React.useEffect(() => {
    if (invoice) {
      setPayAmount(invoice.amountDue);
      setPayRef(`NEFT-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [invoice]);

  const paymentMutation = useMutation({
    mutationFn: () =>
      billingApi.recordPayment(invoice!.id, payAmount, payMethod, payRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      toast.success('Payment recorded successfully!');
      setPaymentModalOpen(false);
    },
  });

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-500">Loading invoice details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Invoices', href: '/billing/invoices' },
              { label: invoice.invoiceNumber },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
              Tax Invoice: {invoice.invoiceNumber}
            </h1>
            <Badge variant={invoice.status === 'PAID' ? 'success' : 'warning'} size="md">
              {invoice.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 border-slate-200 hover:bg-slate-50 text-[#252733] font-sans"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </Button>

          {invoice.amountDue > 0 && (
            <Button
              size="sm"
              onClick={() => setPaymentModalOpen(true)}
              className="gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-sm font-sans"
            >
              <DollarSign className="w-4 h-4" />
              Record Customer Payment
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document Box */}
      <Card className="border-[#eceef5] bg-white max-w-4xl mx-auto shadow-sm overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[#eceef5] bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-lg text-[#252733] font-display">QuoteFlow Enterprise</span>
            <p className="text-xs text-slate-500 mt-1 font-sans">Apex Enterprise Solutions Ltd • GSTIN24AAACA1234F1Z5</p>
          </div>
          <div className="text-right font-mono text-xs space-y-1">
            <div className="font-bold text-[#714b67] text-sm font-display">{invoice.invoiceNumber}</div>
            <div className="text-slate-500 font-sans">Issue Date: {formatDate(invoice.issueDate)}</div>
            <div className="text-rose-600 font-semibold font-sans">Payment Due: {formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        {/* Billed To */}
        <div className="p-6 sm:p-8 grid grid-cols-2 gap-6 text-xs border-b border-[#eceef5] font-sans">
          <div>
            <span className="text-slate-400 uppercase font-bold block text-[10px] tracking-wider">Billed To:</span>
            <p className="font-bold text-[#252733] text-sm mt-0.5">{invoice.customerName}</p>
            <p className="text-slate-500">Quantum Cloud Corp, Mindspace Tech Park, Mumbai</p>
            <p className="text-slate-500 font-mono mt-1">Payment Terms: {invoice.paymentTerms}</p>
          </div>
          <div className="text-right font-mono space-y-1">
            <span className="text-slate-400 uppercase font-bold block text-[10px] tracking-wider font-sans">Financial Summary:</span>
            <div className="text-slate-500">Total: {formatCurrency(invoice.totalAmount, currency)}</div>
            <div className="text-emerald-600 font-bold">Paid: {formatCurrency(invoice.amountPaid, currency)}</div>
            <div className="text-amber-600 font-bold text-sm">Balance Due: {formatCurrency(invoice.amountDue, currency)}</div>
          </div>
        </div>

        {/* Lines */}
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="pb-3 font-sans">Description</th>
                  <th className="pb-3 text-center font-sans">Qty</th>
                  <th className="pb-3 text-right font-sans">Unit Price</th>
                  <th className="pb-3 text-right font-sans">Disc %</th>
                  <th className="pb-3 text-right font-sans">Tax (18%)</th>
                  <th className="pb-3 text-right font-sans">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoice.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 font-sans font-medium text-[#252733]">{l.description}</td>
                    <td className="py-3 text-center">{l.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(l.unitPrice, currency)}</td>
                    <td className="py-3 text-right text-rose-500">{l.discountPercentage}%</td>
                    <td className="py-3 text-right">{l.taxRate}%</td>
                    <td className="py-3 text-right font-bold text-[#252733]">{formatCurrency(l.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Receipts History */}
          {invoice.payments.length > 0 && (
            <div className="pt-4 border-t border-[#eceef5] space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#252733] font-display">
                Recorded Transactions & Settlements ({invoice.payments.length})
              </h4>
              <div className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-[#252733] font-semibold">{p.paymentMethod}</span>
                      <span className="text-slate-500">({p.transactionReference})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-600 font-bold">{formatCurrency(p.amount, currency)}</span>
                      <span className="text-slate-400 text-[10px]">{formatDateTime(p.paidAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Dialog
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Customer Payment Receipt"
        description={`Invoice: ${invoice.invoiceNumber} • Outstanding: ${formatCurrency(invoice.amountDue, currency)}`}
      >
        <div className="space-y-4 pt-2 text-xs font-mono">
          <div>
            <label className="text-[#252733] font-semibold block mb-1 font-sans">Settlement Amount (INR)</label>
            <Input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="bg-white font-mono text-emerald-600 font-bold border-slate-200"
            />
          </div>

          <div>
            <label className="text-[#252733] font-semibold block mb-1 font-sans">Payment Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-sans focus:outline-none focus:ring-2 focus:ring-[#714b67]/20 focus:border-[#714b67]"
            >
              <option value="BANK_TRANSFER">Bank Wire / NEFT / RTGS</option>
              <option value="UPI">UPI Instant Payment</option>
              <option value="CREDIT_CARD">Corporate Credit Card</option>
              <option value="CHECK">Commercial Check</option>
            </select>
          </div>

          <div>
            <label className="text-[#252733] font-semibold block mb-1 font-sans">Bank Reference / TX ID</label>
            <Input
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              className="bg-white font-mono border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
            <Button variant="secondary" size="sm" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => paymentMutation.mutate()}
              isLoading={paymentMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              Confirm Settlement
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
