import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export function PortalQuotesPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getQuotes(),
  });

  const quotes = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
            Commercial Quotations & Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Review formal proposals, submit concession requests, and accept quotes.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {quotes.map((q) => (
          <Card
            key={q.id}
            onClick={() => navigate(`/portal/quotes/${q.id}`)}
            className="border-[#eceef5] bg-white hover:border-[#714b67]/40 hover:shadow-md cursor-pointer transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs group rounded-2xl shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#252733] font-mono text-base group-hover:text-[#714b67] transition-colors">
                  {q.quoteNumber}
                </span>
                <Badge variant="indigo" size="sm">{q.status}</Badge>
              </div>
              <p className="text-slate-500 font-sans">
                {q.lines.length} Line Items • Valid Until: {formatDate(q.validUntil)} • Payment Terms: {q.paymentTerms}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right font-mono">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Total Proposal Amount</span>
                <span className="font-bold text-[#252733] text-base">{formatCurrency(q.totalAmount, q.currency)}</span>
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
