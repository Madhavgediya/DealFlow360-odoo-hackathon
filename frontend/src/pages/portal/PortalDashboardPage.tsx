import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { subscriptionsApi } from '../../services/api/subscriptions.api';
import { billingApi } from '../../services/api/billing.api';
import { shippingApi } from '../../services/api/shipping.api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Repeat,
  Receipt,
  Truck,
  Sparkles,
  ArrowRight,
  Package,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export function PortalDashboardPage() {
  const navigate = useNavigate();

  const { data: quotesData } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getQuotes(),
  });

  const { data: subsData } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingApi.getInvoices(),
  });

  const { data: shipmentsData } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => shippingApi.getShipments(),
  });

  const quotes = quotesData?.data || [];
  const subs = subsData?.data || [];
  const invoices = invoicesData?.data || [];
  const shipments = shipmentsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Portal Welcome Banner */}
      <div className="p-6 rounded-2xl border border-[#eceef5] bg-[#f5eff3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              Welcome, Quantum Cloud Corp
            </h1>
            <Badge variant="indigo" size="sm">Gold Tier Client</Badge>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
            Official commercial client workspace. Review proposals, negotiate custom pricing, track hardware shipments, and manage subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/portal/products')}
            className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white rounded-xl"
          >
            <Package className="w-4 h-4" />
            Browse Catalog & Quote
          </Button>
        </div>
      </div>

      {/* 4 Client KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-5 rounded-2xl border border-[#eceef5] bg-white shadow-sm space-y-1">
          <span className="text-slate-500 font-sans font-medium">Active Proposals</span>
          <div className="text-2xl font-bold text-[#252733] font-display">{quotes.length} Quotes</div>
          <span className="text-[11px] text-[#714b67] font-sans font-semibold">Ready for counter / acceptance</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#ecdfe8] bg-[#f5eff3] shadow-sm space-y-1">
          <span className="text-[#714b67] font-sans font-semibold">7-Day SaaS Trial</span>
          <div className="text-2xl font-bold text-[#252733] font-display">6 Days Remaining</div>
          <span className="text-[11px] text-slate-600 font-sans">QuoteFlow Enterprise Edition</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#eceef5] bg-white shadow-sm space-y-1">
          <span className="text-slate-500 font-sans font-medium">Inbound Hardware</span>
          <div className="text-2xl font-bold text-[#252733] font-display">{shipments.length} Shipments</div>
          <span className="text-[11px] text-emerald-600 font-sans">1 In Transit (Shiprocket)</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#eceef5] bg-white shadow-sm space-y-1">
          <span className="text-slate-500 font-sans font-medium">Total Invoiced</span>
          <div className="text-2xl font-bold text-[#252733] font-display">{invoices.length} Invoices</div>
          <span className="text-[11px] text-slate-500 font-sans">Payment terms: NET 30</span>
        </div>
      </div>

      {/* Main Quotation Review Card */}
      <Card className="border-[#eceef5] bg-white shadow-sm rounded-2xl">
        <CardHeader className="p-5 border-b border-[#eceef5] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#714b67]" />
            <CardTitle className="text-sm font-semibold text-[#252733] font-display">
              Recent Commercial Quotations ({quotes.length})
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/portal/quotes')}
            className="text-xs text-[#714b67] hover:bg-[#f5eff3]"
          >
            View All Quotes
          </Button>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              onClick={() => navigate(`/portal/quotes/${q.id}`)}
              className="p-4 rounded-xl border border-[#eceef5] bg-slate-50/70 hover:border-[#714b67]/40 hover:bg-white cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#252733] font-mono text-sm">{q.quoteNumber}</span>
                  <Badge variant="indigo">{q.status}</Badge>
                </div>
                <p className="text-slate-500 font-sans">
                  {q.lines.length} Line Items • Valid Until: {formatDate(q.validUntil)} • Payment: {q.paymentTerms}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <span className="text-slate-400 block text-[10px] font-sans">Quotation Value</span>
                  <span className="font-bold text-[#252733] text-sm">{formatCurrency(q.totalAmount, q.currency)}</span>
                </div>
                <Button size="sm" className="h-8 text-xs gap-1 bg-[#714b67] hover:bg-[#5e3c54] text-white">
                  <span>Review & Negotiate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
