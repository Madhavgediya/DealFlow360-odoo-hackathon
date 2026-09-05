import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '../../services/api/vendors.api';
import { procurementApi } from '../../services/api/procurement.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShoppingCart,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { cn } from '../../utils/formatting';

export function VendorComparePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency } = useAuthStore();
  const [requiredQuantity, setRequiredQuantity] = React.useState<number>(10);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-comparison', productId, requiredQuantity],
    queryFn: () => vendorsApi.compareVendors(productId || 'prod-1', requiredQuantity),
  });

  const comparison = data?.data;

  const createPoMutation = useMutation({
    mutationFn: (vendorId: string) =>
      procurementApi.createPurchaseOrder({
        vendorId,
        linkedQuoteId: 'q-1024',
        targetWarehouseId: 'wh-surat',
        items: [{ productId: productId || 'prod-1', quantity: requiredQuantity }],
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      toast.success('Purchase Order generated and sent to vendor!');
      navigate('/procurement/purchase-orders');
    },
  });

  if (isLoading || !comparison) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-500">Loading Vendor Intelligence comparison...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Vendors', href: '/vendors' },
              { label: 'Comparison Matrix' },
            ]}
          />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Procurement Intelligence: {comparison.productName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating supply risk, fulfillment speed, and unit pricing for {requiredQuantity} units deficit
          </p>
        </div>
      </div>

      {/* Hero Vendor Recommendation Banner */}
      <div className="p-5 rounded-2xl border border-[#ecdfe8] bg-[#f5eff3] flex items-start gap-4 text-xs text-[#252733] shadow-subtle">
        <div className="p-2.5 rounded-xl bg-white text-[#714b67] border border-[#ecdfe8] shadow-subtle shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#252733] text-sm font-display">
              AI Recommendation: Precision Silicon Distributing Ltd (Vendor A)
            </span>
            <Badge variant="indigo">Optimal Choice</Badge>
          </div>
          <p className="text-slate-600 leading-relaxed">
            <strong className="text-[#252733]">Reasoning:</strong> Fastest lead time (2 Days vs 5 Days avg), 99% stock availability guarantee, and lower unit procurement cost (saving ₹ 3,000 per unit). Total supply risk score: <strong className="text-emerald-700">LOW (4/100)</strong>.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {comparison.vendors.map((v) => (
          <Card
            key={v.vendorId}
            className={cn(
              'border bg-white transition-all flex flex-col justify-between shadow-subtle rounded-2xl',
              v.isRecommended
                ? 'border-[#714b67] ring-2 ring-[#714b67]/10 shadow-md'
                : 'border-[#e5e7eb]'
            )}
          >
            <CardHeader className="p-5 border-b border-[#e5e7eb] flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#252733] font-display">{v.vendorName}</CardTitle>
                <div className="text-[11px] text-slate-500 mt-0.5">Overall Score: {v.overallScore}/100</div>
              </div>
              {v.isRecommended ? (
                <Badge variant="indigo" size="sm" className="gap-1">
                  <Sparkles className="w-3 h-3" /> Recommended
                </Badge>
              ) : (
                <Badge variant="secondary" size="sm">Standard</Badge>
              )}
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs font-mono">
              <div className="space-y-2.5 bg-[#f3f4f6] p-3.5 rounded-xl border border-[#e5e7eb]">
                <div className="flex justify-between text-slate-600">
                  <span>Unit Procurement Cost:</span>
                  <span className="font-bold text-[#252733]">{formatCurrency(v.unitPrice, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Order Value:</span>
                  <span className="font-bold text-[#714b67]">{formatCurrency(v.totalCost, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Guaranteed Lead Time:</span>
                  <span className="font-bold text-emerald-600">{v.leadTimeDays} Days</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Reliability Score:</span>
                  <span className="font-bold text-emerald-600">{v.reliabilityScore}%</span>
                </div>
              </div>

              {v.recommendationReason && (
                <p className="text-[11px] text-[#714b67] bg-[#f5eff3] p-3 rounded-xl border border-[#ecdfe8] font-sans leading-relaxed">
                  ✓ {v.recommendationReason}
                </p>
              )}

              <Button
                onClick={() => createPoMutation.mutate(v.vendorId)}
                isLoading={createPoMutation.isPending}
                size="sm"
                className={cn(
                  'w-full gap-1.5 font-sans mt-2 rounded-xl',
                  v.isRecommended ? 'bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-sm' : 'bg-white border border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#252733]'
                )}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Generate Purchase Order
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
