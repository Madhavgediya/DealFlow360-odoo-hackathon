import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../../services/api/subscriptions.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Repeat, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export function PortalSubscriptionsPage() {
  const { currency } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  });

  const subscriptions = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
          SaaS Subscriptions & 7-Day Trial Status
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">
          Active software licenses, seat allocations, and trial countdowns.
        </p>
      </div>

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="border-[#eceef5] bg-white overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="p-5 bg-slate-50/70 border-b border-[#eceef5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#252733] text-base font-display">{sub.planName}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
                    <Sparkles className="w-3.5 h-3.5" />
                    7-Day Enterprise Trial Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Current Period: {formatDate(sub.currentPeriodStart)} — {formatDate(sub.currentPeriodEnd)}
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Annual License Value</span>
                <span className="font-bold text-[#252733] text-base">{formatCurrency(sub.price, currency)}</span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Trial Days Remaining</span>
                  <span className="text-[#714b67] font-bold text-sm font-display">6 Days Left</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Active User Seats</span>
                  <span className="text-[#252733] font-bold text-sm">{sub.seats} Seats</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Next Scheduled Renewal</span>
                  <span className="text-[#252733] text-sm font-semibold">{formatDate(sub.currentPeriodEnd)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full QuoteFlow platform access enabled with premium SLA and automated revenue operations support.</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
