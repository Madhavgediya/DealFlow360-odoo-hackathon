import * as React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState('30d');

  const conversionChartOption = {
    grid: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 12,
      padding: [8, 12],
      textStyle: { color: '#252733', fontSize: 12, fontFamily: 'Josefin Sans' },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(37,39,51,0.06);',
    },
    xAxis: {
      type: 'category',
      data: ['Inbound Leads', 'Qualified', 'Quotes Gen', 'Approved', 'Won'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6c6e7e', fontSize: 11, fontFamily: 'Josefin Sans' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLabel: { color: '#9fa2b4', fontSize: 11, fontFamily: 'Josefin Sans' },
    },
    series: [
      {
        name: 'Opportunities',
        type: 'bar',
        barWidth: 32,
        data: [48, 32, 24, 18, 14],
        itemStyle: {
          color: '#714b67',
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  const marginChartOption = {
    grid: {
      top: 15,
      right: 30,
      bottom: 20,
      left: 130,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 12,
      padding: [8, 12],
      textStyle: { color: '#252733', fontSize: 12, fontFamily: 'Josefin Sans' },
      formatter: (params: any) => {
        const item = params[0];
        return `<div style="font-weight: 600; color: #252733;">${item.name}</div><div style="color: #714b67; font-weight: 700;">Gross Margin: ${item.value}%</div>`;
      },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(37,39,51,0.06);',
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9fa2b4', fontSize: 11, formatter: '{value}%', fontFamily: 'Josefin Sans' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: ['Laptops (Disc)', 'Networking', 'Compute Servers', 'Cybersecurity', 'Database App', 'SaaS Platform'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6c6e7e', fontSize: 11, fontFamily: 'Josefin Sans' },
    },
    series: [
      {
        name: 'Margin %',
        type: 'bar',
        barWidth: 18,
        data: [16.5, 24.4, 24.3, 28.1, 29.0, 86.1],
        itemStyle: {
          color: '#714b67',
          borderRadius: [0, 6, 6, 0],
        },
      },
    ],
  };

  const vendorChartOption = {
    grid: {
      top: 40,
      right: 25,
      bottom: 30,
      left: 45,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 12,
      padding: [8, 12],
      textStyle: { color: '#252733', fontSize: 12, fontFamily: 'Josefin Sans' },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(37,39,51,0.06);',
    },
    legend: {
      top: 5,
      textStyle: { color: '#6c6e7e', fontSize: 11, fontFamily: 'Josefin Sans' },
    },
    xAxis: {
      type: 'category',
      data: ['Precision Silicon', 'CoreTech Global', 'Velocity Networks', 'Fortress Cyber', 'OmniCompute AI'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6c6e7e', fontSize: 11, fontFamily: 'Josefin Sans' },
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLabel: { color: '#9fa2b4', fontSize: 11, fontFamily: 'Josefin Sans' },
    },
    series: [
      {
        name: 'On-Time Delivery %',
        type: 'bar',
        barWidth: 20,
        data: [99, 94, 89, 96, 85],
        itemStyle: {
          color: '#714b67',
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: 'Quality Score (0-100)',
        type: 'bar',
        barWidth: 20,
        data: [98, 95, 92, 97, 99],
        itemStyle: {
          color: '#252733',
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Analytics' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Commercial Analytics & Operational Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline progression, gross margins by product line, and vendor reliability
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex items-center gap-1 bg-white border border-[#e5e7eb] p-1 rounded-xl text-xs shadow-subtle">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === range
                  ? 'bg-[#714b67] text-white font-semibold shadow-subtle'
                  : 'text-slate-500 hover:text-[#252733] hover:bg-[#f3f4f6]'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Deal Conversion Funnel */}
        <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
          <CardHeader className="p-5 border-b border-[#e5e7eb]">
            <CardTitle className="text-sm font-semibold text-[#252733] flex items-center gap-2 font-display">
              <TrendingUp className="w-4 h-4 text-[#714b67]" />
              End-to-End Deal Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ReactECharts
                option={conversionChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Margin Contribution by Product Category */}
        <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
          <CardHeader className="p-5 border-b border-[#e5e7eb]">
            <CardTitle className="text-sm font-semibold text-[#252733] flex items-center gap-2 font-display">
              <DollarSign className="w-4 h-4 text-[#714b67]" />
              Gross Margin % by Product Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ReactECharts
                option={marginChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Vendor On-Time vs Quality Performance */}
        <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl lg:col-span-2">
          <CardHeader className="p-5 border-b border-[#e5e7eb]">
            <CardTitle className="text-sm font-semibold text-[#252733] flex items-center gap-2 font-display">
              <ShieldCheck className="w-4 h-4 text-[#714b67]" />
              Vendor Fulfillment Reliability & Quality Rating Index
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ReactECharts
                option={vendorChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
