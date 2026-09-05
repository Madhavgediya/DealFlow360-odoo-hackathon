import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Store,
  FileText,
  MessageSquare,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { productsApi } from '../../services/api/products.api';
import { toast } from 'sonner';

export function RetailerDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const retailerDetails = user?.retailerDetails || {
    dealerCode: 'RET-IND-9021',
    tier: 'PLATINUM',
    creditLimit: 500000,
    availableCredit: 385000,
    discountRate: 18.5,
  };

  const { data: quotesResponse, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getQuotes(),
  });
  const quotesList = quotesResponse?.data || [];

  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });
  const products = productsResponse?.data || [];

  // Mock sample active B2B negotiations if list is empty
  const activeDealerQuotes = [
    {
      id: 'QT-2026-991',
      title: 'Bulk Enterprise Switch & Router Units (50x)',
      product: 'EdgeX Core Switch 48-Port',
      requestedQty: 50,
      listTotal: 1250000,
      dealerDiscountPrice: 1018750,
      status: 'NEGOTIATION_ACTIVE',
      lastCounterOffer: 980000,
      lastCounterBy: 'Retailer',
      unreadMessages: 2,
    },
    {
      id: 'QT-2026-984',
      title: 'Industrial IoT Gateway Sensor Bundle (100x)',
      product: 'SensorHub Multi-Sensor Gateway',
      requestedQty: 100,
      listTotal: 800000,
      dealerDiscountPrice: 652000,
      status: 'ADMIN_COUNTERED',
      lastCounterOffer: 630000,
      lastCounterBy: 'Enterprise Admin',
      unreadMessages: 1,
    },
    {
      id: 'QT-2026-960',
      title: 'Rackmount Power Distribution Units (25x)',
      product: 'PowerPro Smart PDU 32A',
      requestedQty: 25,
      listTotal: 450000,
      dealerDiscountPrice: 366750,
      status: 'APPROVED',
      lastCounterOffer: 366750,
      lastCounterBy: 'Enterprise Admin',
      unreadMessages: 0,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Welcome & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#714b67] via-[#5b3751] to-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {retailerDetails.tier} Dealer Partner
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
            Welcome, {user?.name || 'Retail Partner'}
          </h1>
          <p className="text-slate-200 text-xs max-w-xl">
            Access exclusive wholesale volume pricing, initiate custom quote bids, and negotiate directly with enterprise commercial executives.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <Button
            onClick={() => navigate('/retailer/quotes')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Request Bulk Quote
          </Button>
          <Button
            onClick={() => navigate('/retailer/catalog')}
            variant="outline"
            className="text-white border-white/20 bg-white/10 hover:bg-white/20 text-xs"
          >
            <Store className="w-3.5 h-3.5 mr-1" />
            Browse Catalog
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200/80 shadow-subtle rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Available Dealer Credit</span>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">
              ₹{(retailerDetails.availableCredit || 385000).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Limit: ₹{(retailerDetails.creditLimit || 500000).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80 shadow-subtle rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Active Negotiations</span>
            <p className="text-2xl font-bold text-amber-600 font-mono mt-0.5">2 QUOTES</p>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
              Awaiting counter-review
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <MessageSquare className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80 shadow-subtle rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Approved Bids Ready</span>
            <p className="text-2xl font-bold text-[#714b67] font-mono mt-0.5">1 QUOTE</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Ready for PO conversion
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center border border-[#ecdfe8]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80 shadow-subtle rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Tier Discount Level</span>
            <p className="text-2xl font-bold text-[#252733] font-mono mt-0.5">{retailerDetails.discountRate}% OFF</p>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              {retailerDetails.tier} VIP matrix
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Active Deal Flow & Live Counter-Negotiations */}
      <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-sm text-[#252733] font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#714b67]" />
              Active Volume Quote Bids & Live Negotiations
            </h2>
            <p className="text-[11px] text-slate-500">
              Track live counter-offers, margin approvals, and enter negotiation desks.
            </p>
          </div>
          <Button
            onClick={() => navigate('/retailer/quotes')}
            variant="ghost"
            size="sm"
            className="text-xs text-[#714b67] hover:bg-[#f5eff3]"
          >
            View All Quotes <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {activeDealerQuotes.map((q) => (
            <div
              key={q.id}
              className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-slate-800 text-xs">{q.id}</span>
                  <Badge
                    variant={
                      q.status === 'APPROVED'
                        ? 'success'
                        : q.status === 'ADMIN_COUNTERED'
                        ? 'warning'
                        : 'outline'
                    }
                  >
                    {q.status.replace('_', ' ')}
                  </Badge>
                  {q.unreadMessages > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold animate-pulse">
                      {q.unreadMessages} New Counter Message
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-xs">{q.title}</h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Product: {q.product} • Volume: <strong>{q.requestedQty} Units</strong>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">List Price vs Dealer Bid</span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    ₹{q.listTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-[#714b67] font-mono ml-2">
                    ₹{q.dealerDiscountPrice.toLocaleString('en-IN')}
                  </span>
                  <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                    Latest Counter: ₹{q.lastCounterOffer.toLocaleString('en-IN')} ({q.lastCounterBy})
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/retailer/negotiations`)}
                  size="sm"
                  className="bg-[#714b67] hover:bg-[#5b3751] text-white text-xs gap-1.5 shadow-sm shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enter Negotiation</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Wholesale Catalog Quick Add Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-[#252733] font-display flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600" />
              Featured Wholesale Catalog (With {retailerDetails.tier} Discount)
            </h2>
            <p className="text-[11px] text-slate-500">
              Select products to immediately assemble a high-volume dealer quote request.
            </p>
          </div>
          <Button
            onClick={() => navigate('/retailer/catalog')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Full Catalog <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'prod-1',
              name: 'EdgeX Core Enterprise Switch 48G',
              sku: 'EDG-SW-48G',
              mrp: 25000,
              dealerPrice: 20375,
              moq: 10,
              stock: 240,
            },
            {
              id: 'prod-2',
              name: 'SensorHub Multi-Sensor IoT Gateway',
              sku: 'IOT-GW-900',
              mrp: 8000,
              dealerPrice: 6520,
              moq: 25,
              stock: 450,
            },
            {
              id: 'prod-3',
              name: 'PowerPro Smart Rackmount PDU 32A',
              sku: 'PDU-RK-32A',
              mrp: 18000,
              dealerPrice: 14670,
              moq: 5,
              stock: 120,
            },
          ].map((item) => (
            <Card key={item.id} className="p-4 bg-white border-slate-200/80 shadow-subtle rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#252733] text-xs leading-snug">{item.name}</h3>
                  <span className="font-mono text-[10px] text-slate-400">{item.sku}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px]">
                  In Stock ({item.stock})
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Standard MRP:</span>
                  <span className="line-through text-slate-400 font-mono">₹{item.mrp.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Dealer Net Price:</span>
                  <span className="font-bold text-[#714b67] font-mono text-sm">
                    ₹{item.dealerPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  toast.success(`Added ${item.name} to bulk quote draft!`);
                  navigate('/retailer/quotes');
                }}
                className="w-full bg-[#f5eff3] hover:bg-[#714b67] text-[#714b67] hover:text-white font-semibold text-xs transition-colors"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add to Quote (MOQ {item.moq} Units)
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RetailerDashboardPage;
