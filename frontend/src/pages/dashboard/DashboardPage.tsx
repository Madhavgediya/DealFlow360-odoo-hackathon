import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import {
  ArrowUpRight,
  TrendingUp,
  ArrowUp,
  FileText,
  Clock3,
  Check,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const pipelineChartOption = {
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
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const displayName = user?.name?.split(' ')[0] || 'Jordan';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header: Greeting + CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase mb-1 font-sans">
            Monday, October 21, 2024
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252733] flex items-center gap-2 font-display">
            Good morning, {displayName}
            <span className="text-[#714b67] text-lg">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Here's what's happening with your revenue today.
          </p>
        </div>
        <button
          onClick={() => navigate('/sales/quotes/new')}
          className="inline-flex items-center justify-center gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-[#714b67]/20 transition-all active:scale-[0.98] shrink-0 self-start sm:self-center font-sans"
        >
          <Plus className="w-4 h-4" />
          <span>New quotation</span>
        </button>
      </div>

      {/* KPI Cards - 4 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-sans">
        {/* Pipeline value */}
        <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pipeline value</p>
            <span className="w-8 h-8 rounded-xl bg-[#f5eff3] flex items-center justify-center text-[#714b67] border border-[#ecdfe8]">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[#252733] font-display">₹284,650</p>
          <p className="text-xs mt-2 flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
              <ArrowUp className="w-3 h-3" /> 12.8%
            </span>
            <span className="text-slate-400">vs last month</span>
          </p>
        </div>

        {/* Active quotations */}
        <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active quotations</p>
            <span className="w-8 h-8 rounded-xl bg-[#e8f2ff] flex items-center justify-center text-[#2563eb] border border-[#dbeafe]">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[#252733] font-display">38</p>
          <p className="text-xs mt-2 flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
              <ArrowUp className="w-3 h-3" /> 8.4%
            </span>
            <span className="text-slate-400">vs last month</span>
          </p>
        </div>

        {/* Awaiting approval */}
        <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Awaiting approval</p>
            <span className="w-8 h-8 rounded-xl bg-[#fef3e9] flex items-center justify-center text-[#d97706] border border-[#fde4cf]">
              <Clock3 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[#252733] font-display">12</p>
          <p className="text-xs mt-2 flex items-center gap-1">
            <span className="text-[#d97706] font-semibold">3 urgent</span>
            <span className="text-slate-400">need your review</span>
          </p>
        </div>

        {/* Win rate */}
        <div className="bg-white rounded-2xl border border-[#eceef5] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Win rate</p>
            <span className="w-8 h-8 rounded-xl bg-[#e8f7ee] flex items-center justify-center text-[#16a34a] border border-[#d1f2dd]">
              <Check className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[#252733] font-display">64.8%</p>
          <p className="text-xs mt-2 flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
              <ArrowUp className="w-3 h-3" /> 5.2%
            </span>
            <span className="text-slate-400">vs last month</span>
          </p>
        </div>
      </div>

      {/* Main grid: Pipeline chart + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotation pipeline - spans 2 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eceef5] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 pb-3 flex items-start justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">Quotation pipeline</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Track your deals from draft to close</p>
            </div>
            <button
              onClick={() => navigate('/sales/quotes')}
              className="text-xs font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center gap-1 font-sans"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pipeline stages */}
          <div className="px-5 py-4">
            <div className="grid grid-cols-4 gap-2 relative">
              {/* connector lines */}
              <div className="hidden sm:block absolute top-[16px] left-[12%] right-[12%] h-[1px] bg-slate-200" />

              {/* Stage 1 - Draft (active) */}
              <div className="text-center relative">
                <div className="w-8 h-8 rounded-full bg-[#714b67] text-white text-xs font-bold flex items-center justify-center mx-auto shadow-sm border-4 border-[#f5eff3] z-10 relative font-display">
                  1
                </div>
                <p className="text-xs font-bold text-[#252733] mt-2 font-display">Draft</p>
                <p className="text-[11px] text-slate-400 font-sans">14 quotes</p>
                <p className="text-[11px] font-semibold text-[#252733] font-mono">₹86.4k</p>
              </div>
              {/* Stage 2 */}
              <div className="text-center relative">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mx-auto border border-slate-200 z-10 relative font-display">
                  2
                </div>
                <p className="text-xs font-bold text-[#252733] mt-2 font-display">In review</p>
                <p className="text-[11px] text-slate-400 font-sans">8 quotes</p>
                <p className="text-[11px] font-semibold text-[#252733] font-mono">₹54.2k</p>
              </div>
              {/* Stage 3 */}
              <div className="text-center relative">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mx-auto border border-slate-200 z-10 relative font-display">
                  3
                </div>
                <p className="text-xs font-bold text-[#252733] mt-2 font-display">Sent</p>
                <p className="text-[11px] text-slate-400 font-sans">10 quotes</p>
                <p className="text-[11px] font-semibold text-[#252733] font-mono">₹91.8k</p>
              </div>
              {/* Stage 4 */}
              <div className="text-center relative">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mx-auto border border-slate-200 z-10 relative font-display">
                  4
                </div>
                <p className="text-xs font-bold text-[#252733] mt-2 font-display">Won</p>
                <p className="text-[11px] text-slate-400 font-sans">6 quotes</p>
                <p className="text-[11px] font-semibold text-[#252733] font-mono">₹42.3k</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="px-2 sm:px-4 pb-4 flex-1">
            <div className="h-[210px] w-full">
              <ReactECharts
                option={pipelineChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-[#eceef5] shadow-sm flex flex-col font-sans">
          <div className="p-5 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">Recent activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest workspace updates</p>
          </div>
          <div className="p-5 pt-2 flex-1 space-y-4">
            {/* Alex Morgan */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8] flex items-center justify-center text-[11px] font-bold shrink-0 font-display">
                AL
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-tight">
                  <span className="font-bold text-[#252733]">Alex Morgan</span>{' '}
                  <span className="text-slate-500">sent a quotation</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Q-1048 · Acme Corporation</p>
                <p className="text-[10px] text-slate-400 mt-0.5">12 min ago</p>
              </div>
            </div>
            {/* Riley Kim */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fef3e9] text-[#d97706] flex items-center justify-center text-[11px] font-bold shrink-0 font-display">
                RK
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-tight">
                  <span className="font-bold text-[#252733]">Riley Kim</span>{' '}
                  <span className="text-slate-500">requested approval</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Q-1046 · Northstar Labs</p>
                <p className="text-[10px] text-slate-400 mt-0.5">38 min ago</p>
              </div>
            </div>
            {/* Quotation approved */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#e8f7ee] text-[#16a34a] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-tight">
                  <span className="font-bold text-[#252733]">Quotation Q-1042</span>{' '}
                  <span className="text-slate-500">was approved</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Summit Industries · ₹18,400</p>
                <p className="text-[10px] text-slate-400 mt-0.5">1 hour ago</p>
              </div>
            </div>
            {/* Sam Miller */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#e8f2ff] text-[#2563eb] flex items-center justify-center text-[11px] font-bold shrink-0 font-display">
                SM
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-tight">
                  <span className="font-bold text-[#252733]">Sam Miller</span>{' '}
                  <span className="text-slate-500">added a customer</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Brightline Systems</p>
                <p className="text-[10px] text-slate-400 mt-0.5">2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/analytics')}
              className="w-full text-center text-xs font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center justify-center gap-1 font-sans"
            >
              View activity log <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom grid: Priority quotations + AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority quotations - spans 2 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eceef5] shadow-sm overflow-hidden font-sans">
          <div className="p-5 pb-3 flex items-start justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">Priority quotations</h2>
              <p className="text-xs text-slate-500 mt-0.5">Quotes that need your attention</p>
            </div>
            <button
              onClick={() => navigate('/sales/quotes')}
              className="text-xs font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center gap-1 font-sans"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-5 pb-4 overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase py-3 px-2">Quotation</th>
                  <th className="text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase py-3 px-2">Customer</th>
                  <th className="text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase py-3 px-2">Value</th>
                  <th className="text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase py-3 px-2">Status</th>
                  <th className="text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase py-3 px-2">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => navigate('/sales/quotes/Q-1048')}>
                  <td className="py-3.5 px-2">
                    <p className="text-xs font-bold text-[#252733] font-mono">Q-1048</p>
                    <p className="text-[11px] text-slate-400">Updated 12 min ago</p>
                  </td>
                  <td className="py-3.5 px-2 text-xs text-slate-600">Acme Corporation</td>
                  <td className="py-3.5 px-2 text-xs font-bold text-[#252733] font-mono">₹24,850</td>
                  <td className="py-3.5 px-2">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-[#f5eff3] text-[#714b67] text-[11px] font-semibold border border-[#ecdfe8]">
                      In review
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-xs text-slate-600">Alex Morgan</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => navigate('/sales/quotes/Q-1046')}>
                  <td className="py-3.5 px-2">
                    <p className="text-xs font-bold text-[#252733] font-mono">Q-1046</p>
                    <p className="text-[11px] text-slate-400">Updated 38 min ago</p>
                  </td>
                  <td className="py-3.5 px-2 text-xs text-slate-600">Northstar Labs</td>
                  <td className="py-3.5 px-2 text-xs font-bold text-[#252733] font-mono">₹18,400</td>
                  <td className="py-3.5 px-2">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-[#fef3e9] text-[#d97706] text-[11px] font-medium border border-[#fde4cf]">
                      Needs approval
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-xs text-slate-600">Riley Kim</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => navigate('/sales/quotes/Q-1042')}>
                  <td className="py-3.5 px-2">
                    <p className="text-xs font-bold text-[#252733] font-mono">Q-1042</p>
                    <p className="text-[11px] text-slate-400">Updated 1 hour ago</p>
                  </td>
                  <td className="py-3.5 px-2 text-xs text-slate-600">Summit Industries</td>
                  <td className="py-3.5 px-2 text-xs font-bold text-[#252733] font-mono">₹32,100</td>
                  <td className="py-3.5 px-2">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-[#e8f7ee] text-[#16a34a] text-[11px] font-medium border border-[#d1f2dd]">
                      Approved
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-xs text-slate-600">Sam Miller</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI insights */}
        <div className="bg-white rounded-2xl border border-[#eceef5] shadow-sm flex flex-col font-sans">
          <div className="p-5 pb-3 flex items-start justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#252733] font-display">AI insights</h2>
              <p className="text-xs text-slate-500 mt-0.5">Smart recommendations for your team</p>
            </div>
            <span className="text-[#714b67]">
              <Sparkles className="w-4 h-4 fill-[#714b67]" />
            </span>
          </div>

          <div className="p-5 pt-0 flex-1 divide-y divide-slate-100">
            {/* Upsell */}
            <div className="py-4 flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#f5eff3] flex items-center justify-center text-[#714b67] border border-[#ecdfe8] shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#252733]">Upsell opportunity</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">3 customers may need an extended support plan.</p>
                <button onClick={() => navigate('/customers')} className="text-[11px] font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center gap-1 mt-2">
                  Review customers <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Margin alert */}
            <div className="py-4 flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#fef3e9] flex items-center justify-center text-[#d97706] border border-[#fde4cf] shrink-0 mt-0.5">
                <span className="text-xs font-bold">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#252733]">Margin alert</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Q-1046 is below your recommended 25% margin.</p>
                <button onClick={() => navigate('/sales/quotes/Q-1046')} className="text-[11px] font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center gap-1 mt-2">
                  View quotation <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stock available */}
            <div className="py-4 flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#e8f7ee] flex items-center justify-center text-[#16a34a] border border-[#d1f2dd] shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#252733]">Stock available</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">All products in Q-1042 are ready to fulfill.</p>
                <button onClick={() => navigate('/shipping')} className="text-[11px] font-semibold text-[#714b67] hover:text-[#5e3c54] inline-flex items-center gap-1 mt-2">
                  Plan fulfillment <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
