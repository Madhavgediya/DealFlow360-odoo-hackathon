import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Save,
  AlertTriangle,
  TrendingDown,
  Users,
  Package,
} from 'lucide-react';
import { cn } from '../../utils/formatting';

interface DiscountRule {
  id: string;
  customerTier: string;
  categoryName: string;
  maxDiscountPercent: number;
  requiresManagerAbove: number;
  requiresFinanceAbove: number;
  isActive: boolean;
}

const CUSTOMER_TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const TIER_COLORS: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-700 border-amber-200',
  SILVER: 'bg-slate-100 text-slate-600 border-slate-200',
  GOLD: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PLATINUM: 'bg-violet-100 text-violet-700 border-violet-200',
};

const INITIAL_RULES: DiscountRule[] = [
  { id: 'dt-1', customerTier: 'BRONZE',   categoryName: 'Hardware',      maxDiscountPercent: 5,  requiresManagerAbove: 5,  requiresFinanceAbove: 12, isActive: true },
  { id: 'dt-2', customerTier: 'BRONZE',   categoryName: 'Services',      maxDiscountPercent: 3,  requiresManagerAbove: 3,  requiresFinanceAbove: 8,  isActive: true },
  { id: 'dt-3', customerTier: 'SILVER',   categoryName: 'Hardware',      maxDiscountPercent: 10, requiresManagerAbove: 10, requiresFinanceAbove: 18, isActive: true },
  { id: 'dt-4', customerTier: 'SILVER',   categoryName: 'Services',      maxDiscountPercent: 7,  requiresManagerAbove: 7,  requiresFinanceAbove: 15, isActive: true },
  { id: 'dt-5', customerTier: 'GOLD',     categoryName: 'Hardware',      maxDiscountPercent: 15, requiresManagerAbove: 15, requiresFinanceAbove: 22, isActive: true },
  { id: 'dt-6', customerTier: 'GOLD',     categoryName: 'Services',      maxDiscountPercent: 10, requiresManagerAbove: 10, requiresFinanceAbove: 20, isActive: true },
  { id: 'dt-7', customerTier: 'GOLD',     categoryName: 'Subscriptions', maxDiscountPercent: 12, requiresManagerAbove: 12, requiresFinanceAbove: 20, isActive: true },
  { id: 'dt-8', customerTier: 'PLATINUM', categoryName: 'Hardware',      maxDiscountPercent: 20, requiresManagerAbove: 20, requiresFinanceAbove: 28, isActive: true },
  { id: 'dt-9', customerTier: 'PLATINUM', categoryName: 'Services',      maxDiscountPercent: 15, requiresManagerAbove: 15, requiresFinanceAbove: 25, isActive: true },
  { id: 'dt-10',customerTier: 'PLATINUM', categoryName: 'Subscriptions', maxDiscountPercent: 18, requiresManagerAbove: 18, requiresFinanceAbove: 25, isActive: true },
];

export function DiscountTiersPage() {
  const { user } = useAuthStore();
  const [rules, setRules] = React.useState<DiscountRule[]>(INITIAL_RULES);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<Partial<DiscountRule>>({});
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newRule, setNewRule] = React.useState<Partial<DiscountRule>>({
    customerTier: 'GOLD',
    categoryName: 'Hardware',
    maxDiscountPercent: 10,
    requiresManagerAbove: 10,
    requiresFinanceAbove: 20,
    isActive: true,
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';

  const startEdit = (rule: DiscountRule) => {
    setEditingId(rule.id);
    setEditValues({ ...rule });
  };

  const saveEdit = () => {
    setRules(prev => prev.map(r => r.id === editingId ? { ...r, ...editValues } : r));
    setEditingId(null);
    toast.success('Discount tier rule updated successfully');
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success('Rule removed');
  };

  const addRule = () => {
    if (!newRule.categoryName || !newRule.customerTier) {
      toast.error('Customer tier and category are required');
      return;
    }
    const rule: DiscountRule = {
      id: `dt-${Date.now()}`,
      customerTier: newRule.customerTier!,
      categoryName: newRule.categoryName!,
      maxDiscountPercent: newRule.maxDiscountPercent || 10,
      requiresManagerAbove: newRule.requiresManagerAbove || 10,
      requiresFinanceAbove: newRule.requiresFinanceAbove || 20,
      isActive: true,
    };
    setRules(prev => [rule, ...prev]);
    setShowAddForm(false);
    toast.success('New discount tier rule created');
  };

  const groupedByTier = CUSTOMER_TIERS.map(tier => ({
    tier,
    rules: rules.filter(r => r.customerTier === tier),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs items={[{ label: 'Settings', href: '/settings' }, { label: 'Discount Governance' }]} />
          <div className="flex items-center gap-3 mt-1.5">
            <ShieldCheck className="w-6 h-6 text-[#714b67]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#252733] font-display">
              Discount Governance & Approval Chains
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Configure per-tier, per-category discount ceilings and approval escalation thresholds
          </p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </Button>
        )}
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <div>
          <span className="font-bold block mb-0.5">Blended Risk Score Engine</span>
          When a quote mixes product categories with different ceilings, the system computes a{' '}
          <strong>blended weighted overage score</strong> across all lines. Small per-line violations aggregate
          into a portfolio-level risk score — preventing reps from spreading discounts to avoid individual triggers.
        </div>
      </div>

      {/* Approval Chain Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Auto-Approved', desc: 'Risk Score = 0 · All lines within ceiling', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <ShieldCheck className="w-4 h-4" /> },
          { label: 'Sales Manager Required', desc: 'Risk Score 1–8 · Discount 10–20%', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <Users className="w-4 h-4" /> },
          { label: 'Dual Approval (SM + CFO)', desc: 'Risk Score > 8 · Margin < 15%', color: 'bg-rose-50 border-rose-200 text-rose-700', icon: <TrendingDown className="w-4 h-4" /> },
        ].map(item => (
          <div key={item.label} className={cn('p-4 rounded-2xl border', item.color)}>
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              {item.icon}
              {item.label}
            </div>
            <p className="text-[11px] leading-relaxed opacity-80">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Add Rule Form */}
      {showAddForm && (
        <Card className="border-[#714b67]/30 bg-[#f5eff3] shadow-sm">
          <CardHeader className="p-4 border-b border-[#714b67]/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#714b67] font-display flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Discount Governance Rule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Customer Tier</label>
              <select
                value={newRule.customerTier}
                onChange={e => setNewRule(p => ({ ...p, customerTier: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]"
              >
                {CUSTOMER_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Product Category</label>
              <Input
                placeholder="e.g. Hardware, Services"
                value={newRule.categoryName}
                onChange={e => setNewRule(p => ({ ...p, categoryName: e.target.value }))}
                className="bg-white border-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Max Discount %</label>
              <Input
                type="number" min={0} max={100}
                value={newRule.maxDiscountPercent}
                onChange={e => setNewRule(p => ({ ...p, maxDiscountPercent: Number(e.target.value) }))}
                className="bg-white border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Manager Trigger Above %</label>
              <Input
                type="number" min={0} max={100}
                value={newRule.requiresManagerAbove}
                onChange={e => setNewRule(p => ({ ...p, requiresManagerAbove: Number(e.target.value) }))}
                className="bg-white border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-[#252733] block mb-1">Finance Trigger Above %</label>
              <Input
                type="number" min={0} max={100}
                value={newRule.requiresFinanceAbove}
                onChange={e => setNewRule(p => ({ ...p, requiresFinanceAbove: Number(e.target.value) }))}
                className="bg-white border-slate-200 font-mono"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button size="sm" onClick={addRule} className="bg-[#714b67] hover:bg-[#5e3c54] text-white gap-1.5 flex-1">
                <Save className="w-3.5 h-3.5" /> Save Rule
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowAddForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules grouped by customer tier */}
      {groupedByTier.map(({ tier, rules: tierRules }) => (
        <Card key={tier} className="border-[#eceef5] bg-white shadow-sm">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#252733] font-display">
                <Users className="w-4 h-4 text-[#714b67]" />
                <span className={cn('px-3 py-0.5 rounded-full text-xs font-bold border', TIER_COLORS[tier])}>
                  {tier} TIER
                </span>
                <span className="text-xs text-slate-400 font-normal">({tierRules.length} rules)</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tierRules.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No rules configured for this tier</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Product Category', 'Max Discount', 'Manager Trigger', 'Finance Trigger', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500 uppercase text-[10px] tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tierRules.map(rule => (
                      <tr key={rule.id} className="hover:bg-slate-50/50 group transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-[#714b67]" />
                            <span className="font-semibold text-[#252733]">{rule.categoryName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {editingId === rule.id ? (
                            <Input
                              type="number" min={0} max={100}
                              value={editValues.maxDiscountPercent}
                              onChange={e => setEditValues(p => ({ ...p, maxDiscountPercent: Number(e.target.value) }))}
                              className="w-20 h-7 text-xs font-mono"
                            />
                          ) : (
                            <span className="font-bold text-[#714b67] text-sm">{rule.maxDiscountPercent}%</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {editingId === rule.id ? (
                            <Input
                              type="number" min={0} max={100}
                              value={editValues.requiresManagerAbove}
                              onChange={e => setEditValues(p => ({ ...p, requiresManagerAbove: Number(e.target.value) }))}
                              className="w-20 h-7 text-xs font-mono"
                            />
                          ) : (
                            <span className="text-amber-600 font-semibold">&gt; {rule.requiresManagerAbove}%</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {editingId === rule.id ? (
                            <Input
                              type="number" min={0} max={100}
                              value={editValues.requiresFinanceAbove}
                              onChange={e => setEditValues(p => ({ ...p, requiresFinanceAbove: Number(e.target.value) }))}
                              className="w-20 h-7 text-xs font-mono"
                            />
                          ) : (
                            <span className="text-rose-600 font-semibold">&gt; {rule.requiresFinanceAbove}%</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={rule.isActive ? 'success' : 'secondary'} size="sm">
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              {editingId === rule.id ? (
                                <Button size="sm" onClick={saveEdit} className="h-7 px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px]">
                                  <Save className="w-3 h-3" /> Save
                                </Button>
                              ) : (
                                <Button size="sm" variant="secondary" onClick={() => startEdit(rule)} className="h-7 px-2.5 gap-1 text-[10px]">
                                  <Edit2 className="w-3 h-3" /> Edit
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteRule(rule.id)}
                                className="h-7 px-2 text-[10px]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
