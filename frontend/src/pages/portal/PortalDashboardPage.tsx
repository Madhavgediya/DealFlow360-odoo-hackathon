import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { subscriptionsApi } from '../../services/api/subscriptions.api';
import { billingApi } from '../../services/api/billing.api';
import { shippingApi } from '../../services/api/shipping.api';
import { useAuthStore } from '../../stores/auth.store';
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
  Clock,
  CreditCard,
  Building2,
  TrendingUp,
} from 'lucide-react';

export function PortalDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: quotesData, isLoading: isLoadingQuotes } = useQuery({
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

  // Live Metrics
  const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const pendingInvoices = invoices.filter((inv) => inv.status !== 'PAID');
  const activeProposals = quotes.filter((q) => q.status !== 'CANCELLED' && q.status !== 'REJECTED');
  const inTransitShipments = shipments.filter((s) => s.status !== 'DELIVERED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Portal Welcome Banner */}
      <div className="p-6 rounded-3xl border border-[#ecdfe8] bg-gradient-to-r from-[#f5eff3] via-white to-[#f5eff3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#714b67] text-white shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Commercial Account
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
              Gold Tier Partner
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
            Welcome back, {user?.name || 'Commercial Client'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Your dedicated buyer & client portal. Review formal quotations, submit counter-proposals with real-time concessions, track hardware delivery milestones, and manage SaaS licenses.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/portal/products')}
            className="gap-2 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white rounded-xl text-xs font-semibold px-4 py-2"
          >
            <Package className="w-4 h-4" />
            Browse Catalog & Quote
          </Button>
        </div>
      </div>

      {/* 4 Client KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
        <div
          onClick={() => navigate('/portal/quotes')}
          className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle hover:border-[#714b67]/40 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Commercial Proposals</span>
            <div className="w-8 h-8 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#252733] font-mono">{activeProposals.length}</div>
            <span className="text-[11px] text-[#714b67] font-semibold mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Proposals in Review
            </span>
          </div>
        </div>

        <div
          onClick={() => navigate('/portal/subscriptions')}
          className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle hover:border-[#714b67]/40 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">SaaS Trial & Licenses</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#252733] font-mono">{subs.length > 0 ? '6 Days Left' : 'Active'}</div>
            <span className="text-[11px] text-purple-700 font-semibold mt-0.5 block">
              Enterprise Cloud Edition
            </span>
          </div>
        </div>

        <div
          onClick={() => navigate('/portal/orders')}
          className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle hover:border-[#714b67]/40 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Inbound Shipments</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#252733] font-mono">{shipments.length}</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {inTransitShipments.length} In Transit
            </span>
          </div>
        </div>

        <div
          onClick={() => navigate('/portal/invoices')}
          className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle hover:border-[#714b67]/40 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Total Billing Valuation</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-[#252733] font-mono">
              {formatCurrency(totalInvoicedAmount || 1850000, 'INR')}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
              {pendingInvoices.length} Pending Settlement
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Proposals & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Quotations */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#714b67]" />
                <CardTitle className="text-sm font-bold text-[#252733] font-display">
                  Active Commercial Quotations ({quotes.length})
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/portal/quotes')}
                className="text-xs text-[#714b67] hover:bg-[#f5eff3] gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              {isLoadingQuotes && (
                <div className="py-8 text-center text-slate-400">Loading quotations...</div>
              )}
              {!isLoadingQuotes && quotes.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  No quotations created yet. Click "Browse Catalog" to assemble your first proposal.
                </div>
              )}
              {!isLoadingQuotes &&
                quotes.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => navigate(`/portal/quotes/${q.id}`)}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#714b67]/40 hover:shadow-sm cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#252733] font-mono text-sm group-hover:text-[#714b67]">
                          {q.quoteNumber}
                        </span>
                        <Badge
                          variant={
                            q.status === 'CONFIRMED' || q.status === 'APPROVED'
                              ? 'success'
                              : q.status === 'APPROVAL_REQUIRED' || q.status === 'CUSTOMER_NEGOTIATION'
                              ? 'warning'
                              : 'outline'
                          }
                        >
                          {q.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-slate-500 font-sans">
                        {q.lines.length} Line Items • Valid: {formatDate(q.validUntil)} • Terms: {q.paymentTerms}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <span className="text-slate-400 block text-[10px] font-sans uppercase font-bold tracking-wider">
                          Net Valuation
                        </span>
                        <span className="font-bold text-[#252733] text-sm">
                          {formatCurrency(q.totalAmount, q.currency)}
                        </span>
                      </div>
                      <Button size="sm" className="h-8 text-xs gap-1 bg-[#714b67] hover:bg-[#5e3c54] text-white">
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Inbound Hardware Delivery Status */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#714b67]" />
                <CardTitle className="text-sm font-bold text-[#252733] font-display">
                  Recent Deliveries & Shipments
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/portal/orders')}
                className="text-xs text-[#714b67] hover:bg-[#f5eff3]"
              >
                Track All
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              {shipments.slice(0, 2).map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate('/portal/orders')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#252733] block font-mono">{s.shipmentNumber}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Carrier: {s.carrierProvider} • AWB: {s.trackingNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-emerald-700 font-bold font-mono">
                      ETA: {formatDate(s.estimatedDeliveryDate)}
                    </span>
                    <Badge variant="indigo">{s.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Quick Actions & SaaS License */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#252733] font-display">Commercial Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/portal/products')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-[#f5eff3] hover:border-[#ecdfe8] hover:text-[#714b67] text-[#252733] transition-all font-semibold text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#714b67]" />
                  <span>Browse Product Catalog</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/portal/invoices')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-[#f5eff3] hover:border-[#ecdfe8] hover:text-[#714b67] text-[#252733] transition-all font-semibold text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-[#714b67]" />
                  <span>View Tax Invoices</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/portal/subscriptions')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-[#f5eff3] hover:border-[#ecdfe8] hover:text-[#714b67] text-[#252733] transition-all font-semibold text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Repeat className="w-4 h-4 text-[#714b67]" />
                  <span>Manage SaaS Licenses</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </Card>

          {/* Account Executive Contact Card */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-[#252733] font-display">Assigned Sales Executive</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5eff3] text-[#714b67] font-bold text-sm flex items-center justify-center border border-[#ecdfe8]">
                AS
              </div>
              <div>
                <span className="font-bold text-[#252733] block">Ananya Sharma</span>
                <span className="text-[11px] text-slate-400">Enterprise Commercial Director</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-500 font-mono text-[11px]">
              <div>Email: ananya.sharma@dealflow360.com</div>
              <div>Phone: +91 (022) 8901-4433</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PortalDashboardPage;
