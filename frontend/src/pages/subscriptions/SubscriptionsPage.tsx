import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../../services/api/subscriptions.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Subscription, SubscriptionPlan, ProrationPreview } from '../../types/subscription';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Repeat, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SubscriptionsPage() {
  const { currency } = useAuthStore();
  const [prorationModal, setProrationModal] = React.useState<{ sub: Subscription; plan: SubscriptionPlan } | null>(null);

  const { data: subsData, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  });

  const { data: plansData } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getPlans(),
  });

  const subscriptions = subsData?.data || [];
  const plans = plansData?.data || [];

  const columns: ColumnDef<Subscription>[] = [
    {
      key: 'customerName',
      header: 'Customer / Plan',
      sortable: true,
      cell: (sub) => (
        <div>
          <div className="font-semibold text-[#252733]">{sub.customerName}</div>
          <div className="text-xs text-[#714b67] font-mono mt-0.5">{sub.planName}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Subscription Status',
      sortable: true,
      cell: (sub) =>
        sub.status === 'TRIALING' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5eff3] text-[#714b67]">
            <Sparkles className="w-3 h-3" />
            7-Day Trial ({sub.trialDaysRemaining}d remaining)
          </span>
        ) : (
          <Badge variant="success">ACTIVE SAAS</Badge>
        ),
    },
    {
      key: 'price',
      header: 'Recurring Price',
      sortable: true,
      cell: (sub) => (
        <span className="font-mono font-semibold text-[#252733]">
          {formatCurrency(sub.price, currency)} / {sub.billingCycle}
        </span>
      ),
    },
    {
      key: 'currentPeriodEnd',
      header: 'Current Period Renewal',
      sortable: true,
      cell: (sub) => <span className="font-mono text-slate-500">{formatDate(sub.currentPeriodEnd)}</span>,
    },
    {
      key: 'seats',
      header: 'Seats',
      cell: (sub) => <span className="font-mono text-slate-700">{sub.seats} Users</span>,
    },
    {
      key: 'actions',
      header: 'Proration Preview',
      cell: (sub) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const enterprisePlan = plans.find((p) => p.id === 'sub-plan-2') || plans[0];
            setProrationModal({ sub, plan: enterprisePlan });
          }}
          className="h-7 text-xs gap-1 border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#252733]"
        >
          <Repeat className="w-3 h-3 text-[#714b67]" />
          Preview Upgrade Proration
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'Billing', href: '/invoices' }, { label: 'Subscriptions' }]} />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
          Subscriptions & SaaS Contracts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage recurrent software licensing, plan tiers, user seats, and automated proration
        </p>
      </div>

      {/* Subscription Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl border border-[#e5e7eb] bg-white shadow-subtle space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#252733] font-display">{p.name}</span>
              <Badge variant="indigo">{p.billingCycle}</Badge>
            </div>
            <div className="text-xl font-bold font-mono text-[#252733]">
              {formatCurrency(p.price, currency)} <span className="text-xs text-slate-500 font-normal">/ period</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 pt-1">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={subscriptions}
        isLoading={isLoading}
        searchPlaceholder="Search active subscriptions by customer or plan..."
      />

      {/* Proration Calculation Preview Modal */}
      {prorationModal && (
        <Dialog
          isOpen={prorationModal !== null}
          onClose={() => setProrationModal(null)}
          title="Subscription Upgrade Proration Preview"
          description={`Customer: ${prorationModal.sub.customerName}`}
        >
          <div className="space-y-4 pt-2 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb] space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Current Plan:</span>
                <span className="text-[#252733] font-semibold">{prorationModal.sub.planName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Target Plan:</span>
                <span className="text-[#714b67] font-bold">{prorationModal.plan.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Unused Plan Credit:</span>
                <span className="text-emerald-600 font-semibold">- ₹ 162,000 (45% remaining)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>New Plan Base Charge:</span>
                <span className="text-slate-900">₹ 360,000</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Net Due on Upgrade:</span>
                <span className="text-emerald-600">₹ 198,000</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
              <Button variant="secondary" size="sm" onClick={() => setProrationModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast.success('Subscription plan upgraded with proration adjustments.');
                  setProrationModal(null);
                }}
              >
                Confirm Upgrade
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
