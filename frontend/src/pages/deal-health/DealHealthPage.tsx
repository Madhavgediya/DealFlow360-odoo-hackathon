import { useQuery } from '@tanstack/react-query';
import { dealHealthApi } from '../../services/api/dealHealth.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { RiskBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/formatting';

export function DealHealthPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['deal-health'],
    queryFn: () => dealHealthApi.getOverview(),
  });

  const overview = data?.data;

  if (isLoading || !overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-500">Loading Deal Health command center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'Deal Health' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              Deal Health & Anomaly Detector
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Live commercial risk alerts, margin erosion monitoring, and automated interventions
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono bg-white px-3 py-1.5 rounded-xl border border-[#eceef5]">
            Tracking {overview.totalDealsTracked} Live Opportunities
          </span>
        </div>
      </div>

      {/* 4 Health Status Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl border border-[#e8f7ee] bg-[#e8f7ee]/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px] font-sans">Healthy Deals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#252733] font-display">{overview.healthyCount} Deals</div>
          <p className="text-[11px] text-slate-600 font-sans">Within target margin and delivery SLAs</p>
        </div>

        <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-bold uppercase tracking-wider text-[11px] font-sans">Watchlist</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#252733] font-display">{overview.watchCount} Deals</div>
          <p className="text-[11px] text-slate-600 font-sans">Minor concessions or pending approvals</p>
        </div>

        <div className="p-4 rounded-2xl border border-[#fef3e9] bg-[#fef3e9]/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-[11px] font-sans">At Risk Deals</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#252733] font-display">{overview.atRiskCount} Deals</div>
          <p className="text-[11px] text-slate-600 font-sans">Inventory shortages or stalled activity</p>
        </div>

        <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-rose-700 font-bold uppercase tracking-wider text-[11px] font-sans">Critical Breaches</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-[#252733] font-display">{overview.criticalCount} Deals</div>
          <p className="text-[11px] text-slate-600 font-sans">Severe margin erosion or SLA breach</p>
        </div>
      </div>

      {/* Active Anomaly Alerts List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#252733] flex items-center gap-2 font-display">
          <Activity className="w-4 h-4 text-[#714b67]" />
          Active Commercial Anomalies Requiring Intervention
        </h3>

        <div className="space-y-3">
          {overview.deals.map((deal) => (
            <Card
              key={deal.id}
              className={cn(
                'border bg-white transition-all p-5 space-y-4 shadow-sm rounded-2xl',
                deal.healthStatus === 'CRITICAL' || deal.healthStatus === 'AT_RISK'
                  ? 'border-amber-300 ring-1 ring-amber-100'
                  : 'border-[#eceef5]'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eceef5] pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#252733] font-mono text-sm">{deal.quoteNumber}</span>
                    <span className="text-slate-500 font-sans">• {deal.customerName}</span>
                    <Badge variant={deal.healthStatus === 'AT_RISK' ? 'warning' : 'indigo'} size="sm">
                      {deal.healthStatus} ({deal.healthScore}/100)
                    </Badge>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold font-sans">{deal.anomalyTitle}</p>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-600 font-sans">Deal Value: <strong className="text-[#252733]">{formatCurrency(deal.totalValue, currency)}</strong></span>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/sales/quotes/${deal.quoteId}`)}
                    className="h-8 text-xs gap-1 bg-[#714b67] hover:bg-[#5e3c54] text-white"
                  >
                    <span>Inspect & Resolve Deal</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Root Cause Anomaly:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{deal.anomalyDescription}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Recommended Action:</span>
                  <p className="text-[#714b67] font-semibold mt-0.5 leading-relaxed">{deal.recommendedAction}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
