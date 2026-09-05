import { useQuery } from '@tanstack/react-query';
import { billingApi } from '../../services/api/billing.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Receipt, Printer, CheckCircle2 } from 'lucide-react';

export function PortalInvoicesPage() {
  const { currency } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingApi.getInvoices(),
  });

  const invoices = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
          Invoices & Commercial Billing Statements
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">
          View official tax invoices, payment due dates, and settlement receipts.
        </p>
      </div>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <Card key={inv.id} className="border-[#eceef5] bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs rounded-2xl shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#252733] font-mono text-sm">{inv.invoiceNumber}</span>
                <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
              </div>
              <p className="text-slate-500 font-sans">
                Issue Date: {formatDate(inv.issueDate)} • Due: {formatDate(inv.dueDate)} • Terms: {inv.paymentTerms}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right font-mono">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Total Amount</span>
                <span className="font-bold text-[#252733] text-sm">{formatCurrency(inv.totalAmount, currency)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1 text-xs border-slate-200 hover:bg-[#f5eff3] hover:text-[#714b67] text-[#252733] rounded-xl font-sans"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
