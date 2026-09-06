import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Dialog } from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Repeat,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useAuthStore } from '../../stores/auth.store';
import { cn } from '../../utils/formatting';

interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  price: number;
  description: string;
  prorationType: 'DAILY' | 'NONE' | 'FULL_MONTH';
  cancellationPolicy: 'END_OF_CYCLE' | 'IMMEDIATE' | 'NO_REFUND';
  trialDays: number;
  isActive: boolean;
  features: string[];
}

const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-1',
    name: 'Cloud Essentials (Monthly)',
    code: 'CLOUD-ESS-M',
    billingCycle: 'MONTHLY',
    price: 12000,
    description: 'Basic cloud infrastructure access with 99.5% SLA uptime guarantee.',
    prorationType: 'DAILY',
    cancellationPolicy: 'END_OF_CYCLE',
    trialDays: 7,
    isActive: true,
    features: ['5 vCPUs', '16 GB RAM', '200 GB SSD', '99.5% SLA', '24×7 Email Support'],
  },
  {
    id: 'plan-2',
    name: 'Enterprise Cloud Suite (Quarterly)',
    code: 'ENT-CLOUD-Q',
    billingCycle: 'QUARTERLY',
    price: 42000,
    description: 'Full enterprise cloud stack with dedicated account manager and 99.9% SLA.',
    prorationType: 'DAILY',
    cancellationPolicy: 'END_OF_CYCLE',
    trialDays: 14,
    isActive: true,
    features: ['20 vCPUs', '64 GB RAM', '1 TB SSD', '99.9% SLA', 'Dedicated Manager', 'Priority Support'],
  },
  {
    id: 'plan-3',
    name: 'Managed Security Suite (Annual)',
    code: 'SEC-SUITE-Y',
    billingCycle: 'YEARLY',
    price: 85000,
    description: 'Comprehensive managed security: SIEM, SOAR, threat intelligence, and compliance reporting.',
    prorationType: 'DAILY',
    cancellationPolicy: 'NO_REFUND',
    trialDays: 0,
    isActive: true,
    features: ['SIEM Integration', 'Threat Intelligence', 'Compliance Reports', 'Incident Response', '24×7 SOC'],
  },
  {
    id: 'plan-4',
    name: 'Premium Support SLA (Yearly)',
    code: 'SUPP-PREM-Y',
    billingCycle: 'YEARLY',
    price: 120000,
    description: 'Gold-tier managed support with 2-hour response SLA and dedicated engineer.',
    prorationType: 'DAILY',
    cancellationPolicy: 'END_OF_CYCLE',
    trialDays: 0,
    isActive: true,
    features: ['2-Hour Response SLA', 'Dedicated Engineer', 'Quarterly Business Reviews', 'Root Cause Analysis'],
  },
];

const CYCLE_LABEL: Record<string, string> = {
  MONTHLY: 'per month',
  QUARTERLY: 'per quarter',
  YEARLY: 'per year',
};

const CYCLE_BADGE_COLORS: Record<string, string> = {
  MONTHLY: 'bg-blue-50 text-blue-600 border-blue-200',
  QUARTERLY: 'bg-violet-50 text-violet-600 border-violet-200',
  YEARLY: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export function SubscriptionPlansPage() {
  const { currency } = useAuthStore();
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);
  const [prorationModal, setProrationModal] = React.useState(false);
  const [prorateFrom, setProrateFrom] = React.useState<SubscriptionPlan | null>(null);
  const [prorateTo, setProrateTo] = React.useState<SubscriptionPlan | null>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newPlan, setNewPlan] = React.useState<Partial<SubscriptionPlan>>({
    billingCycle: 'MONTHLY',
    price: 10000,
    trialDays: 7,
    prorationType: 'DAILY',
    cancellationPolicy: 'END_OF_CYCLE',
    isActive: true,
    features: [],
  });

  const computeProration = () => {
    if (!prorateFrom || !prorateTo) return null;
    const daysInCycle = prorateFrom.billingCycle === 'MONTHLY' ? 30 : prorateFrom.billingCycle === 'QUARTERLY' ? 90 : 365;
    const daysRemaining = Math.floor(daysInCycle * 0.45); // assume 55% of cycle used
    const dailyRate = prorateFrom.price / daysInCycle;
    const unusedCredit = parseFloat((dailyRate * daysRemaining).toFixed(2));
    const netDue = Math.max(0, prorateTo.price - unusedCredit);
    return { unusedCredit, newCharge: prorateTo.price, netDue, daysRemaining };
  };

  const proration = computeProration();

  const addPlan = () => {
    if (!newPlan.name || !newPlan.code) {
      toast.error('Plan name and code are required');
      return;
    }
    const plan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: newPlan.name!,
      code: newPlan.code!,
      billingCycle: newPlan.billingCycle as SubscriptionPlan['billingCycle'],
      price: newPlan.price || 0,
      description: newPlan.description || '',
      prorationType: newPlan.prorationType as SubscriptionPlan['prorationType'],
      cancellationPolicy: newPlan.cancellationPolicy as SubscriptionPlan['cancellationPolicy'],
      trialDays: newPlan.trialDays || 0,
      isActive: true,
      features: [],
    };
    setPlans(prev => [plan, ...prev]);
    setShowAddForm(false);
    toast.success('Subscription plan created');
  };

  const togglePlan = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs items={[{ label: 'Settings', href: '/settings' }, { label: 'Subscription Plans' }]} />
          <div className="flex items-center gap-3 mt-1.5">
            <Repeat className="w-6 h-6 text-[#714b67]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#252733] font-display">
              Subscription & Recurring Plan Setup
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Define recurring billing plans, proration rules, and cancellation policies for subscription lines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setProrationModal(true)}
            className="gap-1.5 border-[#714b67]/30 text-[#714b67]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Simulate Proration
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <Plus className="w-4 h-4" /> New Plan
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="border-[#714b67]/30 bg-[#f5eff3] shadow-sm">
          <CardHeader className="p-4 border-b border-[#714b67]/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#714b67] font-display flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Subscription Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Plan Name</label>
              <Input placeholder="e.g. Cloud Pro Monthly" value={newPlan.name || ''} onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))} className="bg-white border-slate-200" />
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Plan Code</label>
              <Input placeholder="e.g. CLOUD-PRO-M" value={newPlan.code || ''} onChange={e => setNewPlan(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="bg-white border-slate-200 font-mono" />
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Billing Cycle</label>
              <select value={newPlan.billingCycle} onChange={e => setNewPlan(p => ({ ...p, billingCycle: e.target.value as any }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]">
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Price (₹)</label>
              <Input type="number" min={0} value={newPlan.price} onChange={e => setNewPlan(p => ({ ...p, price: Number(e.target.value) }))} className="bg-white border-slate-200 font-mono" />
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Trial Days</label>
              <Input type="number" min={0} value={newPlan.trialDays} onChange={e => setNewPlan(p => ({ ...p, trialDays: Number(e.target.value) }))} className="bg-white border-slate-200 font-mono" />
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Cancellation Policy</label>
              <select value={newPlan.cancellationPolicy} onChange={e => setNewPlan(p => ({ ...p, cancellationPolicy: e.target.value as any }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]">
                <option value="END_OF_CYCLE">Cancel at End of Cycle</option>
                <option value="IMMEDIATE">Immediate (pro-rated refund)</option>
                <option value="NO_REFUND">No Refund</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="font-semibold text-[#252733] block mb-1">Description</label>
              <Input placeholder="Brief description of this plan..." value={newPlan.description || ''} onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))} className="bg-white border-slate-200" />
            </div>
            <div className="col-span-2 sm:col-span-3 flex gap-2">
              <Button size="sm" onClick={addPlan} className="bg-[#714b67] hover:bg-[#5e3c54] text-white gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Create Plan
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map(plan => (
          <Card
            key={plan.id}
            className={cn(
              'border shadow-sm hover:shadow-md transition-shadow cursor-pointer',
              selectedPlan?.id === plan.id
                ? 'border-[#714b67] ring-2 ring-[#714b67]/20'
                : 'border-[#eceef5]',
              !plan.isActive && 'opacity-60'
            )}
            onClick={() => setSelectedPlan(p => p?.id === plan.id ? null : plan)}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-[#252733] font-display text-sm">{plan.name}</div>
                  <div className="text-[11px] text-[#714b67] font-mono mt-0.5">{plan.code}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', CYCLE_BADGE_COLORS[plan.billingCycle])}>
                    {plan.billingCycle}
                  </span>
                  <Badge variant={plan.isActive ? 'success' : 'secondary'} size="sm" className="text-[10px]">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#714b67]" />
                <span className="text-lg font-bold text-[#252733] font-mono">
                  {formatCurrency(plan.price, 'INR')}
                </span>
                <span className="text-xs text-slate-400">{CYCLE_LABEL[plan.billingCycle]}</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>

              {plan.features.length > 0 && (
                <ul className="space-y-1">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-[11px] text-slate-400">+{plan.features.length - 4} more features</li>
                  )}
                </ul>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                <span>Proration: <strong className="text-[#252733]">{plan.prorationType}</strong></span>
                <span>Cancel: <strong className="text-[#252733]">{plan.cancellationPolicy.replace(/_/g,' ')}</strong></span>
                {plan.trialDays > 0 && (
                  <span className="flex items-center gap-1 text-[#714b67]">
                    <Sparkles className="w-3 h-3" /> {plan.trialDays}-Day Trial
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={e => { e.stopPropagation(); setProrateFrom(plan); setProrateTo(plans.find(p => p.id !== plan.id) || null); setProrationModal(true); }}
                  className="h-7 text-[10px] flex-1 gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Prorate
                </Button>
                <Button
                  size="sm"
                  onClick={e => { e.stopPropagation(); togglePlan(plan.id); toast.success(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`); }}
                  className={`h-7 text-[10px] flex-1 ${plan.isActive ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-[#714b67] hover:bg-[#5e3c54] text-white'}`}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proration Simulator */}
      <Dialog
        isOpen={prorationModal}
        onClose={() => setProrationModal(false)}
        title={<div className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-[#714b67]" /><span>Mid-Cycle Proration Simulator</span></div>}
        description="Simulate the credit note and net charge for a mid-cycle plan change"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Current Plan</label>
              <select
                value={prorateFrom?.id || ''}
                onChange={e => setProrateFrom(plans.find(p => p.id === e.target.value) || null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#714b67]"
              >
                <option value="">Select plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Target Plan</label>
              <select
                value={prorateTo?.id || ''}
                onChange={e => setProrateTo(plans.find(p => p.id === e.target.value) || null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#714b67]"
              >
                <option value="">Select plan...</option>
                {plans.filter(p => p.id !== prorateFrom?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {proration && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Days Remaining in Current Cycle:</span>
                <span className="font-bold text-[#252733]">{proration.daysRemaining} days</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Unused Credit (Pro-rated):</span>
                <span className="font-bold">- {formatCurrency(proration.unusedCredit, 'INR')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>New Plan Charge:</span>
                <span className="font-bold text-[#252733]">+ {formatCurrency(proration.newCharge, 'INR')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#252733]">
                <span>Net Due Now:</span>
                <span className="text-[#714b67]">{formatCurrency(proration.netDue, 'INR')}</span>
              </div>
              {proration.netDue === 0 && (
                <div className="text-emerald-600 text-[10px] flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3" /> Customer has a credit balance — no charge today
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setProrationModal(false)}>Close</Button>
            <Button
              size="sm"
              onClick={() => { toast.success('Proration credit note generated!'); setProrationModal(false); }}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" /> Apply & Generate Credit Note
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
