import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { negotiationsApi } from '../../services/api/negotiations.api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  FileText,
  Repeat,
  CheckCircle2,
  Building,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function PortalQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [negotiateModalOpen, setNegotiateModalOpen] = React.useState(false);
  const [customerMessage, setCustomerMessage] = React.useState(
    'We are ready to commit to 15 laptops upfront instead of 10. Can you match 18% volume discount on the hardware lines?'
  );
  const [customDiscount, setCustomDiscount] = React.useState<number>(18);
  const [customQty, setCustomQty] = React.useState<number>(15);

  const { data, isLoading } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => quotesApi.getQuoteById(id || 'q-1024'),
  });

  const quote = data?.data;

  const submitNegotiationMutation = useMutation({
    mutationFn: () =>
      negotiationsApi.submitCustomerNegotiation({
        quoteId: quote!.id,
        customerMessage,
        lineModifications: [
          {
            productId: quote!.lines[0].productId,
            requestedQuantity: customQty,
            requestedDiscount: customDiscount,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      toast.success('Your requested changes have been sent for review. Your updated quotation is under review.');
      setNegotiateModalOpen(false);
    },
  });

  if (isLoading || !quote) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-500">Loading formal quotation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              Commercial Quotation: {quote.quoteNumber}
            </h1>
            <Badge variant="indigo" size="md">{quote.status}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Valid until {formatDate(quote.validUntil)} • Commercial Payment Terms: {quote.paymentTerms}
          </p>
        </div>

        {/* Customer Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNegotiateModalOpen(true)}
            className="gap-1.5 bg-[#f5eff3] border-[#ecdfe8] text-[#714b67] hover:bg-[#ecdfe8] rounded-xl"
          >
            <Repeat className="w-4 h-4" />
            Request Changes & Custom Terms
          </Button>

          <Button
            size="sm"
            onClick={() => {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              toast.success('Quotation accepted! Contract countersigned.');
            }}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-sm text-white rounded-xl"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept & Sign Quotation
          </Button>
        </div>
      </div>

      {/* Quote Review Document */}
      <Card className="border-[#eceef5] bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-5 sm:p-6 border-b border-[#eceef5] bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-[#252733] font-mono text-sm">QuoteFlow Commercial Proposal</span>
            <p className="text-xs text-slate-500 font-sans">Prepared for: {quote.customerName}</p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Net Payable Amount</span>
            <span className="font-bold text-[#714b67] text-lg">{formatCurrency(quote.totalAmount, quote.currency)}</span>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="pb-3 font-sans">Product / Specification</th>
                  <th className="pb-3 text-center font-sans">Quantity</th>
                  <th className="pb-3 text-right font-sans">Unit Price</th>
                  <th className="pb-3 text-right font-sans">Applied Discount</th>
                  <th className="pb-3 text-right font-sans">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {quote.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3.5 font-sans font-medium text-[#252733]">
                      <div>{l.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{l.productSku}</div>
                    </td>
                    <td className="py-3.5 text-center font-bold text-[#252733]">{l.quantity}</td>
                    <td className="py-3.5 text-right">{formatCurrency(l.unitPrice, quote.currency)}</td>
                    <td className="py-3.5 text-right text-emerald-600 font-bold">{l.discountPercentage}%</td>
                    <td className="py-3.5 text-right font-bold text-[#252733]">{formatCurrency(l.lineTotal, quote.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="pt-4 border-t border-[#eceef5] flex justify-end">
            <div className="w-72 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-500 font-sans">
                <span>Subtotal:</span>
                <span className="text-[#252733] font-semibold">{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold font-sans">
                <span>Volume Discount Savings:</span>
                <span>- {formatCurrency(quote.discountAmount, quote.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-sans">
                <span>Taxes (18% GST):</span>
                <span className="text-[#252733]">+ {formatCurrency(quote.taxAmount, quote.currency)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#252733] font-display">
                <span>Total Quotation:</span>
                <span className="text-[#714b67]">{formatCurrency(quote.totalAmount, quote.currency)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Negotiation & Counter-Proposal Modal */}
      <Dialog
        isOpen={negotiateModalOpen}
        onClose={() => setNegotiateModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2 text-[#252733] font-display">
            <Repeat className="w-5 h-5 text-[#714b67]" />
            <span>Submit Counter-Proposal / Discount Request</span>
          </div>
        }
        description={`Quotation: ${quote.quoteNumber} • Submit adjusted quantities or requested concessions`}
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#252733] font-semibold block mb-1 font-sans">Requested Laptop Units</label>
              <Input
                type="number"
                min={1}
                value={customQty}
                onChange={(e) => setCustomQty(Number(e.target.value))}
                className="bg-white font-mono text-center border-slate-200"
              />
            </div>
            <div>
              <label className="text-[#252733] font-semibold block mb-1 font-sans">Requested Hardware Discount %</label>
              <Input
                type="number"
                min={0}
                max={50}
                value={customDiscount}
                onChange={(e) => setCustomDiscount(Number(e.target.value))}
                className="bg-white font-mono text-center text-[#714b67] font-bold border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-[#252733] font-semibold block mb-1 font-sans">Customer Commercial Message</label>
            <textarea
              rows={3}
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#252733] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#714b67]/20 focus:border-[#714b67] font-sans"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed font-sans">
            ℹ️ Your counter-proposal will be sent directly to your assigned Account Executive and Commercial Director for fast evaluation.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setNegotiateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => submitNegotiationMutation.mutate()}
              isLoading={submitNegotiationMutation.isPending}
              className="gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Counter-Proposal
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
