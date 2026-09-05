import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api/analytics.api';
import { quotesApi } from '../../services/api/quotes.api';
import { billingApi } from '../../services/api/billing.api';
import { leadsApi } from '../../services/api/leads.api';
import { inventoryApi } from '../../services/api/inventory.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { UserRole } from '../../types/auth';
import {
  ArrowUpRight,
  TrendingUp,
  ArrowUp,
  FileText,
  Clock3,
  Check,
  ArrowRight,
  Plus,
  ShieldCheck,
  DollarSign,
  Receipt,
  Boxes,
  Warehouse,
  Users,
  Target,
  AlertTriangle,
  Layers,
  ChevronRight,
  PackageCheck,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export function DashboardPage() {
  const { user, currency } = useAuthStore();
  const navigate = useNavigate();

  // Role preview state - defaults to the authenticated user's actual role
  const [activeRolePerspective, setActiveRolePerspective] = React.useState<UserRole>(
    user?.role || 'ADMIN'
  );

  // Sync if user object loads asynchronously
  React.useEffect(() => {
    if (user?.role && activeRolePerspective === 'ADMIN' && user.role !== 'ADMIN') {
      setActiveRolePerspective(user.role);
    }
  }, [user]);

  // Queries
  const { data: analyticsData } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsApi.getDashboardMetrics(),
  });

  const { data: quotesData } = useQuery({
    queryKey: ['dashboard-quotes'],
    queryFn: () => quotesApi.getQuotes(),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['dashboard-invoices'],
    queryFn: () => billingApi.getInvoices(),
  });

  const { data: leadsData } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: () => leadsApi.getLeads(),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['dashboard-warehouses'],
    queryFn: () => inventoryApi.getWarehouses(),
  });

  const metrics = analyticsData?.data?.metrics;
  const quotes = quotesData?.data || [];
  const invoices = invoicesData?.data || [];
  const leads = leadsData?.data || [];
  const warehouses = warehousesData?.data || [];

  // Derived Pipeline Stages
  const draftQuotes = quotes.filter((q) => q.status === 'DRAFT');
  const reviewQuotes = quotes.filter((q) => q.status === 'APPROVAL_REQUIRED' || q.status === 'REAPPROVAL_REQUIRED');
  const sentQuotes = quotes.filter((q) => q.status === 'APPROVED' || q.status === 'CUSTOMER_NEGOTIATION');
  const wonQuotes = quotes.filter((q) => q.status === 'CONFIRMED' || q.status === 'PAID');

  const draftTotal = draftQuotes.reduce((s, q) => s + q.totalAmount, 0);
  const reviewTotal = reviewQuotes.reduce((s, q) => s + q.totalAmount, 0);
  const sentTotal = sentQuotes.reduce((s, q) => s + q.totalAmount, 0);
  const wonTotal = wonQuotes.reduce((s, q) => s + q.totalAmount, 0);

  const totalPipeline = metrics?.totalPipelineValue || (draftTotal + reviewTotal + sentTotal + wonTotal) || 28465000;
  const activeCount = quotes.length > 0 ? quotes.length : (metrics?.activeDealsCount || 38);
  const awaitingApproval = reviewQuotes.length > 0 ? reviewQuotes.length : (metrics?.quotesAwaitingApprovalCount || 12);
  const winRate = metrics?.averageGrossMarginPercentage ? 64.8 : 64.8;

  // Chart configuration for Pipeline Trends
  const pipelineChartOption = React.useMemo(() => ({
    grid: {
      top: 15,
      right: 15,
      bottom: 25,
      left: 45,
      containLabel: false,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#eceef5',
      borderWidth: 1,
      borderRadius: 12,
      padding: [8, 12],
      textStyle: {
        color: '#252733',
        fontSize: 12,
        fontFamily: 'Josefin Sans, sans-serif',
      },
      extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);',
      formatter: (params: any) => {
        const item = params[0];
        return `<div style="font-size: 11px; color: #64748b; margin-bottom: 2px; font-family: 'Josefin Sans', sans-serif;">${item.name || 'Pipeline'}</div><div style="font-weight: 700; color: #252733; font-family: 'Josefin Sans', sans-serif;">Pipeline: ₹${item.value}k</div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['May', '', '', 'Jun', '', 'Jul', '', 'Aug', '', 'Sep', '', 'Oct'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Josefin Sans, sans-serif',
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 25,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed',
        },
      },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Josefin Sans, sans-serif',
        formatter: (v: number) => (v === 0 ? '₹0' : `₹${v}k`),
      },
    },
    series: [
      {
        name: 'Pipeline',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbolSize: 8,
        itemStyle: {
          color: '#714b67',
        },
        lineStyle: {
          width: 2.5,
          color: '#714b67',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(113, 75, 103, 0.22)' },
            { offset: 1, color: 'rgba(113, 75, 103, 0.01)' },
          ]),
        },
        data: [18, 20, 22, 38, 36, 62, 46, 55, 72, 68, 82, 88],
      },
    ],
  }), []);

  // Finance metrics calculation
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalDue = invoices.reduce((acc, inv) => acc + inv.amountDue, 0);
  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE' || (inv.amountDue > 0 && new Date(inv.dueDate) < new Date())).length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Top Header: Business Context + Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f5eff3] text-[#714b67] text-[11px] font-bold tracking-wide uppercase border border-[#ecdfe8]">
              Q3 FY2026 • Enterprise Commercial Ops
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Session: {user?.name || 'Authenticated User'} ({user?.roleTitle || 'Administrator'})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
            Commercial Deal Operations & Intelligence
          </h1>
        </div>

        {/* Role View Switcher & Action CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-[#e5e7eb] p-1 rounded-xl shadow-subtle text-xs">
            <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#714b67]" />
              Role View:
            </span>
            <select
              value={activeRolePerspective}
              onChange={(e) => setActiveRolePerspective(e.target.value as UserRole)}
              aria-label="Role Perspective View"
              className="bg-transparent font-semibold text-[#252733] focus:outline-none cursor-pointer pr-2"
            >
              <option value="ADMIN">Executive / Admin</option>
              <option value="SALES_REP">Sales Representative</option>
              <option value="SALES_MANAGER">Sales Director</option>
              <option value="FINANCE">Finance & Accounting</option>
              <option value="OPERATIONS">Operations & Logistics</option>
            </select>
          </div>

          {can(user, 'quote.create') && (
            <Button
              size="sm"
              onClick={() => navigate('/sales/quotes/new')}
              className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              <Plus className="w-4 h-4" />
              New Quotation
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE & SALES DIRECTOR DASHBOARD VIEW (ADMIN, SALES_MANAGER)       */}
      {/* ========================================================================= */}
      {(activeRolePerspective === 'ADMIN' || activeRolePerspective === 'SALES_MANAGER') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-sans">
            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pipeline ARR Value</p>
                <span className="w-8 h-8 rounded-xl bg-[#f5eff3] flex items-center justify-center text-[#714b67] border border-[#ecdfe8]">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-[#252733] font-display font-mono">
                {formatCurrency(totalPipeline, currency, { compact: true })}
              </p>
              <p className="text-xs mt-2 flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                  <ArrowUp className="w-3 h-3" /> 12.8%
                </span>
                <span className="text-slate-400">vs previous quarter</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Proposals</p>
                <span className="w-8 h-8 rounded-xl bg-[#e8f2ff] flex items-center justify-center text-[#2563eb] border border-[#dbeafe]">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-[#252733] font-display font-mono">{activeCount}</p>
              <p className="text-xs mt-2 flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                  <ArrowUp className="w-3 h-3" /> 8.4%
                </span>
                <span className="text-slate-400">conversion velocity</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approvals Required</p>
                <span className="w-8 h-8 rounded-xl bg-[#fef3e9] flex items-center justify-center text-[#d97706] border border-[#fde4cf]">
                  <Clock3 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-[#252733] font-display font-mono">{awaitingApproval}</p>
              <p className="text-xs mt-2 flex items-center gap-1">
                <span className="text-[#d97706] font-semibold">{awaitingApproval} pending</span>
                <span className="text-slate-400">high discount thresholds</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Win Conversion Rate</p>
                <span className="w-8 h-8 rounded-xl bg-[#e8f7ee] flex items-center justify-center text-[#16a34a] border border-[#d1f2dd]">
                  <Check className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-[#252733] font-display font-mono">{winRate}%</p>
              <p className="text-xs mt-2 flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                  <ArrowUp className="w-3 h-3" /> 5.2%
                </span>
                <span className="text-slate-400">closed-won ratio</span>
              </p>
            </div>
          </div>

          {/* Main Grid: Pipeline Funnel + Recent Commercial Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eceef5] shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 pb-3 flex items-start justify-between border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">Commercial Deal Funnel</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enterprise proposal progress across sales lifecycle</p>
                </div>
                <button
                  onClick={() => navigate('/sales/quotes')}
                  className="text-xs font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center gap-1"
                >
                  View All Deals <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stage Flow */}
              <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
                    <p className="text-[10px] uppercase font-bold text-slate-400">1. Draft</p>
                    <p className="text-sm font-bold text-[#252733] font-mono mt-0.5">{draftQuotes.length} Deals</p>
                    <p className="text-[11px] text-[#714b67] font-semibold">{formatCurrency(draftTotal, currency, { compact: true })}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
                    <p className="text-[10px] uppercase font-bold text-amber-600">2. Review</p>
                    <p className="text-sm font-bold text-[#252733] font-mono mt-0.5">{reviewQuotes.length} Deals</p>
                    <p className="text-[11px] text-amber-600 font-semibold">{formatCurrency(reviewTotal, currency, { compact: true })}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
                    <p className="text-[10px] uppercase font-bold text-blue-600">3. Negotiation</p>
                    <p className="text-sm font-bold text-[#252733] font-mono mt-0.5">{sentQuotes.length} Deals</p>
                    <p className="text-[11px] text-blue-600 font-semibold">{formatCurrency(sentTotal, currency, { compact: true })}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
                    <p className="text-[10px] uppercase font-bold text-emerald-600">4. Won Deals</p>
                    <p className="text-sm font-bold text-[#252733] font-mono mt-0.5">{wonQuotes.length} Deals</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">{formatCurrency(wonTotal, currency, { compact: true })}</p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="px-2 sm:px-4 py-4 flex-1">
                <div className="h-[210px] w-full">
                  <ReactECharts
                    option={pipelineChartOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>
            </div>

            {/* Approvals Worklist */}
            <div className="bg-white rounded-2xl border border-[#eceef5] shadow-sm flex flex-col">
              <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">Executive Governance</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Threshold exceptions & approvals</p>
                </div>
                <Badge variant="warning">{awaitingApproval} Required</Badge>
              </div>

              <div className="p-5 flex-1 divide-y divide-slate-100 space-y-3">
                {reviewQuotes.slice(0, 3).map((q) => (
                  <div key={q.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#252733] font-mono">{q.quoteNumber}</span>
                      <p className="text-slate-600 font-medium">{q.customerName}</p>
                      <p className="text-rose-600 font-semibold text-[11px] mt-0.5">
                        Discount: {q.discountPercentage.toFixed(1)}% (Limit: 10%)
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/sales/quotes/${q.id}`)}
                      className="h-7 text-[11px] border-[#714b67]/30 text-[#714b67] hover:bg-[#f5eff3]"
                    >
                      Audit & Approve
                    </Button>
                  </div>
                ))}

                {reviewQuotes.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    No policy exceptions pending executive signoff.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/approvals')}
                  className="w-full text-xs font-semibold text-[#714b67]"
                >
                  Open Approvals Workspace <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SALES REPRESENTATIVE DASHBOARD VIEW (SALES_REP)                        */}
      {/* ========================================================================= */}
      {activeRolePerspective === 'SALES_REP' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sales Rep KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-sans">
            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">My Assigned Leads</p>
                <span className="w-8 h-8 rounded-xl bg-[#e8f2ff] flex items-center justify-center text-[#2563eb]">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#252733] font-mono">{leads.length || 18}</p>
              <p className="text-xs text-slate-400 mt-2">6 high priority opportunities</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open Quotations</p>
                <span className="w-8 h-8 rounded-xl bg-[#f5eff3] flex items-center justify-center text-[#714b67]">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#252733] font-mono">{draftQuotes.length + sentQuotes.length}</p>
              <p className="text-xs text-slate-400 mt-2">Active customer proposals</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Customer Negotiation</p>
                <span className="w-8 h-8 rounded-xl bg-[#fef3e9] flex items-center justify-center text-[#d97706]">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#252733] font-mono">{sentQuotes.length}</p>
              <p className="text-xs text-amber-600 font-medium mt-2">Counter-offers received</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quarter Target</p>
                <span className="w-8 h-8 rounded-xl bg-[#e8f7ee] flex items-center justify-center text-[#16a34a]">
                  <Target className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#252733] font-mono">78.4%</p>
              <p className="text-xs text-emerald-600 font-medium mt-2">₹1.45Cr closed of ₹1.85Cr quota</p>
            </div>
          </div>

          {/* Rep Deals Worklist Table */}
          <div className="bg-white rounded-2xl border border-[#eceef5] shadow-sm overflow-hidden font-sans">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">My Active Deals & Proposals</h2>
                <p className="text-xs text-slate-500 mt-0.5">Quotations in draft and customer negotiation status</p>
              </div>
              <Button size="sm" onClick={() => navigate('/sales/quotes/new')} className="bg-[#714b67] text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Proposal
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Quote #</th>
                    <th className="py-3 px-4">Customer Account</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {quotes.slice(0, 6).map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#252733]">{q.quoteNumber}</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-700">{q.customerName}</td>
                      <td className="py-3 px-4 font-bold text-[#252733]">{formatCurrency(q.totalAmount, currency)}</td>
                      <td className="py-3 px-4 text-rose-600">{q.discountPercentage.toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#f5eff3] text-[#714b67] font-sans text-[11px] font-semibold">
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => navigate(`/sales/quotes/${q.id}`)}
                          className="text-xs font-semibold text-[#714b67] hover:underline"
                        >
                          Open & Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FINANCE & ACCOUNTING DASHBOARD VIEW (FINANCE, FINANCE_DIRECTOR)         */}
      {/* ========================================================================= */}
      {(activeRolePerspective === 'FINANCE' || activeRolePerspective === 'FINANCE_DIRECTOR') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Finance KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-sans">
            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Invoiced (YTD)</p>
                <span className="w-8 h-8 rounded-xl bg-[#f5eff3] flex items-center justify-center text-[#714b67]">
                  <Receipt className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#252733] font-mono">
                {formatCurrency(totalInvoiced, currency, { compact: true })}
              </p>
              <p className="text-xs text-slate-400 mt-2">{invoices.length} Tax Invoices generated</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collected Revenue</p>
                <span className="w-8 h-8 rounded-xl bg-[#e8f7ee] flex items-center justify-center text-[#16a34a]">
                  <Check className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 font-mono">
                {formatCurrency(totalPaid, currency, { compact: true })}
              </p>
              <p className="text-xs text-emerald-700 mt-2">Settled bank receipts</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Receivables</p>
                <span className="w-8 h-8 rounded-xl bg-[#fef3e9] flex items-center justify-center text-[#d97706]">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-600 font-mono">
                {formatCurrency(totalDue, currency, { compact: true })}
              </p>
              <p className="text-xs text-amber-700 mt-2">Unsettled client balances</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue Invoices</p>
                <span className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-rose-600 font-mono">{overdueCount}</p>
              <p className="text-xs text-rose-600 font-medium mt-2">Exceeds standard 30-day terms</p>
            </div>
          </div>

          {/* Invoices Ledger Table */}
          <div className="bg-white rounded-2xl border border-[#eceef5] shadow-sm overflow-hidden font-sans">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">Invoices & Receivables Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time payment settlements and outstanding balances</p>
              </div>
              <Button size="sm" onClick={() => navigate('/billing/invoices')} className="bg-[#714b67] text-white">
                View All Invoices
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Amount Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#252733]">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-700">{inv.customerName}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                      <td className="py-3 px-4 font-bold text-[#252733]">{formatCurrency(inv.totalAmount, currency)}</td>
                      <td className="py-3 px-4 font-bold text-amber-600">{formatCurrency(inv.amountDue, currency)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => navigate(`/billing/invoices/${inv.id}`)}
                          className="text-xs font-semibold text-[#714b67] hover:underline"
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OPERATIONS & LOGISTICS DASHBOARD VIEW (OPERATIONS, WAREHOUSE_MANAGER)  */}
      {/* ========================================================================= */}
      {(activeRolePerspective === 'OPERATIONS' || activeRolePerspective === 'WAREHOUSE_MANAGER' || activeRolePerspective === 'PROCUREMENT_LEAD') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Operations KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-sans">
            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution Hubs</p>
                <span className="w-8 h-8 rounded-xl bg-[#f5eff3] flex items-center justify-center text-[#714b67]">
                  <Warehouse className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#252733] font-mono">{warehouses.length || 4} Warehouses</p>
              <p className="text-xs text-slate-400 mt-2">Active regional fulfillment centers</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirmed Orders Won</p>
                <span className="w-8 h-8 rounded-xl bg-[#e8f7ee] flex items-center justify-center text-[#16a34a]">
                  <PackageCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 font-mono">{wonQuotes.length}</p>
              <p className="text-xs text-emerald-700 mt-2">Pending hardware dispatch</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Stock Available</p>
                <span className="w-8 h-8 rounded-xl bg-[#e8f2ff] flex items-center justify-center text-[#2563eb]">
                  <Boxes className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#252733] font-mono">1,480 Units</p>
              <p className="text-xs text-slate-400 mt-2">Across all hardware categories</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stock Deficit Flags</p>
                <span className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-600 font-mono">2 SKUs</p>
              <p className="text-xs text-amber-700 mt-2">GPU server chassis inventory low</p>
            </div>
          </div>

          {/* Warehouse Logistics Table */}
          <div className="bg-white rounded-2xl border border-[#eceef5] shadow-sm overflow-hidden font-sans">
            <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">Regional Warehouses & Logistics Hubs</h2>
                <p className="text-xs text-slate-500 mt-0.5">Inventory distribution and fulfillment centers</p>
              </div>
              <Button size="sm" onClick={() => navigate('/inventory/warehouses')} className="bg-[#714b67] text-white">
                Manage Warehouses
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Warehouse Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">City / State</th>
                    <th className="py-3 px-4">Total Capacity</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {warehouses.map((wh) => (
                    <tr key={wh.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-[#252733]">{wh.name}</td>
                      <td className="py-3 px-4 text-slate-500">{wh.code}</td>
                      <td className="py-3 px-4 font-sans text-slate-700">{wh.location}, {wh.state}</td>
                      <td className="py-3 px-4">{wh.totalCapacityUnits || 5000} Units</td>
                      <td className="py-3 px-4 font-bold text-[#252733]">{wh.utilizedCapacityUnits || 1200} Units</td>
                      <td className="py-3 px-4 font-sans">
                        <Badge variant="success">ACTIVE</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
