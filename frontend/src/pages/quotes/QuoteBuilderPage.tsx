import * as React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { productsApi } from '../../services/api/products.api';
import { customersApi } from '../../services/api/customers.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { calculateRiskAssessment } from '../../utils/risk';
import { QuoteLineItem, QuoteRiskAssessment, CreateQuotePayload } from '../../types/quote';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { StatusBadge, RiskBadge } from '../../components/common/StatusBadge';
import { RiskBreakdown } from '../../components/common/RiskBreakdown';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Repeat,
  Lock,
  Building,
  Boxes,
  Printer,
  Send,
  ArrowRight,
  Package,
  Search,
  Sparkles,
  Calendar,
  CreditCard,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../utils/formatting';
import { A4DocumentPrintModal } from '../../components/print/A4DocumentPrintModal';

export function QuoteBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [printModalOpen, setPrintModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isProductPickerOpen, setIsProductPickerOpen] = React.useState(false);
  const [productSearchQuery, setProductSearchQuery] = React.useState('');
  const [selectedProductCategory, setSelectedProductCategory] = React.useState('ALL');
  const [showUpsellPanel, setShowUpsellPanel] = React.useState(true);
  const [dismissedUpsells, setDismissedUpsells] = React.useState<Set<string>>(new Set());
  const [upsellSuggestions, setUpsellSuggestions] = React.useState<any[]>([]);
  const [upsellLoading, setUpsellLoading] = React.useState(false);

  const canViewCost = can(user, 'cost.view');

  // URL search params from Lead conversion flow
  const paramLeadId = searchParams.get('leadId');
  const paramCustomerName = searchParams.get('customerName');
  const paramCustomerId = searchParams.get('customerId');

  // Fetch products & customers
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers(),
  });

  // Fetch existing quote if editing
  const { data: quoteData } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => quotesApi.getQuoteById(id || 'q-1024'),
    enabled: !isNew,
  });

  const products = productsData?.data || [];
  const customers = customersData?.data || [];

  // Local Quote State
  const [customerId, setCustomerId] = React.useState<string>('cust-1');
  const [paymentTerms, setPaymentTerms] = React.useState('NET_30');
  const [validUntil, setValidUntil] = React.useState('2026-04-30');
  const [lines, setLines] = React.useState<QuoteLineItem[]>([]);
  const [quoteStatus, setQuoteStatus] = React.useState<string>('DRAFT');
  const [revisionNumber, setRevisionNumber] = React.useState<number>(1);

  // Initialize state when existing quote loads or when creating from lead
  React.useEffect(() => {
    if (quoteData?.data && !isNew) {
      const q = quoteData.data;
      setCustomerId(q.customerId);
      setPaymentTerms(q.paymentTerms);
      setValidUntil(q.validUntil ? q.validUntil.substring(0, 10) : '2026-04-30');
      setLines(q.lines);
      setQuoteStatus(q.status);
      setRevisionNumber(q.currentRevisionNumber);
    } else if (isNew && products.length > 0 && lines.length === 0) {
      if (paramCustomerId) {
        setCustomerId(paramCustomerId);
      } else if (paramCustomerName && customers.length > 0) {
        const found = customers.find((c) =>
          c.name.toLowerCase().includes(paramCustomerName.toLowerCase())
        );
        if (found) setCustomerId(found.id);
      } else if (customers.length > 0) {
        setCustomerId(customers[0].id);
      }

      const firstProd = products[0];
      setLines([
        {
          id: `line-${Date.now()}`,
          productId: firstProd.id,
          productName: firstProd.name,
          productSku: firstProd.sku,
          categoryId: firstProd.categoryId,
          categoryName: firstProd.categoryName,
          quantity: 10,
          unitPrice: Number(firstProd.basePrice) || 25000,
          discountPercentage: 5,
          discountAmount: ((Number(firstProd.basePrice) || 25000) * 10 * 5) / 100,
          taxRate: firstProd.taxRate || 18,
          taxAmount: ((Number(firstProd.basePrice) || 25000) * 10 * 0.95 * 18) / 100,
          lineSubtotal: (Number(firstProd.basePrice) || 25000) * 10,
          lineTotal: (Number(firstProd.basePrice) || 25000) * 10 * 0.95 * 1.18,
          unitCost: Number(firstProd.costPrice) || Math.round((Number(firstProd.basePrice) || 25000) * 0.7),
          totalCost: (Number(firstProd.costPrice) || Math.round((Number(firstProd.basePrice) || 25000) * 0.7)) * 10,
          lineMarginAmount: (Number(firstProd.basePrice) || 25000) * 10 * 0.95 - (Number(firstProd.costPrice) || Math.round((Number(firstProd.basePrice) || 25000) * 0.7)) * 10,
          lineMarginPercentage: 25.5,
          warehouseId: 'wh-surat',
          warehouseName: 'Surat Central Logistics Hub',
          isRecurring: firstProd.isRecurring,
          stockAvailable: firstProd.totalStockAvailable || 50,
          stockShortage: 0,
        },
      ]);
    }
  }, [quoteData, isNew, products, customers, paramCustomerId, paramCustomerName]);

  // Real-time Dynamic Financials
  const subtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
  const totalDiscountAmount = lines.reduce(
    (acc, l) => acc + (l.unitPrice * l.quantity * l.discountPercentage) / 100,
    0
  );
  const netTaxable = subtotal - totalDiscountAmount;
  const totalTaxAmount = lines.reduce((acc, l) => {
    const lineNet = l.unitPrice * l.quantity * (1 - l.discountPercentage / 100);
    return acc + (lineNet * (l.taxRate || 18)) / 100;
  }, 0);
  const totalAmount = netTaxable + totalTaxAmount;
  const totalCost = lines.reduce((acc, l) => acc + (l.unitCost || l.unitPrice * 0.7) * l.quantity, 0);
  const grossMarginAmount = netTaxable - totalCost;
  const grossMarginPercentage = netTaxable > 0 ? (grossMarginAmount / netTaxable) * 100 : 0;
  const overallDiscountPercentage = subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

  // Real-time Risk Assessment Engine
  const liveRisk: QuoteRiskAssessment = React.useMemo(() => {
    return calculateRiskAssessment(lines, subtotal, totalDiscountAmount, totalCost, grossMarginPercentage);
  }, [lines, subtotal, totalDiscountAmount, totalCost, grossMarginPercentage]);

  // Fetch upsell suggestions when lines change
  React.useEffect(() => {
    if (lines.length === 0) return;
    setUpsellLoading(true);
    const existingIds = lines.map(l => l.productId);
    quotesApi.getUpsellSuggestions(id || 'q-1024', existingIds)
      .then(res => {
        if (res.data) {
          setUpsellSuggestions(res.data.filter((s: any) => !dismissedUpsells.has(s.productId)));
        }
      })
      .catch(() => {})
      .finally(() => setUpsellLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length]);

  // Line item handlers
  const handleAddProductFromCatalog = (prod: any) => {
    const newLine: QuoteLineItem = {
      id: `line-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      categoryId: prod.categoryId,
      categoryName: prod.categoryName,
      quantity: 5,
      unitPrice: Number(prod.basePrice) || 20000,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate: prod.taxRate || 18,
      taxAmount: ((Number(prod.basePrice) || 20000) * 5 * (prod.taxRate || 18)) / 100,
      lineSubtotal: (Number(prod.basePrice) || 20000) * 5,
      lineTotal: (Number(prod.basePrice) || 20000) * 5 * (1 + (prod.taxRate || 18) / 100),
      unitCost: Number(prod.costPrice) || Math.round((Number(prod.basePrice) || 20000) * 0.7),
      totalCost: (Number(prod.costPrice) || Math.round((Number(prod.basePrice) || 20000) * 0.7)) * 5,
      lineMarginAmount: (Number(prod.basePrice) || 20000) * 5 - (Number(prod.costPrice) || Math.round((Number(prod.basePrice) || 20000) * 0.7)) * 5,
      lineMarginPercentage: 30,
      warehouseId: 'wh-surat',
      warehouseName: 'Surat Central Logistics Hub',
      isRecurring: prod.isRecurring,
      stockAvailable: prod.totalStockAvailable || 25,
      stockShortage: 0,
    };

    setLines([...lines, newLine]);
    setIsProductPickerOpen(false);
    toast.success(`Added ${prod.name} to quotation lines`);
  };

  const handleUpdateLine = (index: number, updates: Partial<QuoteLineItem>) => {
    const updated = [...lines];
    const item = { ...updated[index], ...updates };

    if (updates.productId) {
      const prod = products.find((p) => p.id === updates.productId);
      if (prod) {
        item.productName = prod.name;
        item.productSku = prod.sku;
        item.categoryId = prod.categoryId;
        item.categoryName = prod.categoryName;
        item.unitPrice = Number(prod.basePrice) || 20000;
        item.unitCost = Number(prod.costPrice) || Math.round((Number(prod.basePrice) || 20000) * 0.7);
        item.taxRate = prod.taxRate || 18;
        item.isRecurring = prod.isRecurring;
        item.stockAvailable = prod.totalStockAvailable || 10;
      }
    }

    const lineSubtotal = item.unitPrice * item.quantity;
    const discountAmount = (lineSubtotal * item.discountPercentage) / 100;
    const taxableAmount = lineSubtotal - discountAmount;
    const taxAmount = (taxableAmount * (item.taxRate || 18)) / 100;
    const lineTotal = taxableAmount + taxAmount;
    const lineTotalCost = (item.unitCost || item.unitPrice * 0.7) * item.quantity;
    const lineMarginAmount = taxableAmount - lineTotalCost;
    const lineMarginPercentage = taxableAmount > 0 ? (lineMarginAmount / taxableAmount) * 100 : 0;
    const stockShortage = Math.max(0, item.quantity - (item.stockAvailable || 0));

    item.lineSubtotal = lineSubtotal;
    item.discountAmount = discountAmount;
    item.taxAmount = taxAmount;
    item.lineTotal = lineTotal;
    item.totalCost = lineTotalCost;
    item.lineMarginAmount = lineMarginAmount;
    item.lineMarginPercentage = lineMarginPercentage;
    item.stockShortage = stockShortage;

    updated[index] = item;
    setLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, idx) => idx !== index));
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: () => {
      const payload: CreateQuotePayload = {
        customerId,
        validUntil,
        paymentTerms: paymentTerms as any,
        currency: 'INR',
        lines: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountPercentage: l.discountPercentage,
          warehouseId: l.warehouseId,
        })),
        notes: paramLeadId ? `Generated from Lead ID ${paramLeadId}` : undefined,
      };
      return quotesApi.createQuote(payload, user?.id, user?.name);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      toast.success(res.message || 'Quotation created successfully!');
      if (res.data?.id) {
        navigate(`/sales/quotes/${res.data.id}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create quotation');
    },
  });

  // Save / Update mutations
  const updateMutation = useMutation({
    mutationFn: () => quotesApi.updateQuoteLines(id || 'q-1024', lines, user?.name, user?.roleTitle),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      if (res.data?.status) {
        setQuoteStatus(res.data.status);
      }
      toast.success('Quote updated and risk re-evaluated!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update quotation');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => quotesApi.submitQuote(id || 'q-1024'),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      if (res.data?.status) {
        setQuoteStatus(res.data.status);
      }
      toast.success('Quotation submitted for review / negotiation!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit quotation');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => quotesApi.confirmQuote(id || 'q-1024'),
    onSuccess: () => {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setQuoteStatus('CONFIRMED');
      toast.success('Quote confirmed as WON DEAL! Order created for fulfillment.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to confirm deal');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => quotesApi.deleteQuote(id || 'q-1024'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['platform-quotes'] });
      toast.success('Quotation deleted');
      navigate('/sales/quotes');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete quotation');
    },
  });

  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Filter products for catalog picker
  const pickerCategories = ['ALL', ...Array.from(new Set(products.map((p) => p.categoryName || 'General')))];
  const filteredPickerProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchesCat = selectedProductCategory === 'ALL' || p.categoryName === selectedProductCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Quotations', href: '/sales/quotes' },
              { label: isNew ? 'New Proposal' : quoteData?.data?.quoteNumber || 'Q-1024' },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              {isNew
                ? 'Create Commercial Quotation (CPQ)'
                : `${quoteData?.data?.quoteNumber || 'Q-1024'} — ${quoteData?.data?.customerName || selectedCustomer?.name || 'Customer'}`}
            </h1>
            {!isNew && <StatusBadge status={quoteStatus} />}
            <RiskBadge severity={liveRisk.overallSeverity} score={liveRisk.overallScore} showScore />
            <span className="text-xs text-slate-400 font-mono">Revision {revisionNumber}</span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isNew && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintModalOpen(true)}
                className="gap-1.5 border-slate-200 hover:bg-slate-50 text-[#252733] font-sans text-xs rounded-xl"
              >
                <Printer className="w-4 h-4 text-[#714b67]" />
                <span className="hidden sm:inline">Print A4 / PDF</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/sales/negotiations/${id || 'q-1024'}`)}
                className="gap-1.5 bg-white text-[#252733] border-slate-200 hover:bg-slate-50 text-xs rounded-xl"
              >
                <Repeat className="w-4 h-4 text-[#714b67]" />
                <span className="hidden sm:inline">Negotiation Room</span>
              </Button>
            </>
          )}

          {isNew ? (
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold rounded-xl"
            >
              <ShieldCheck className="w-4 h-4" />
              Save Quotation Draft
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => updateMutation.mutate()}
                isLoading={updateMutation.isPending}
                className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold rounded-xl"
              >
                <ShieldCheck className="w-4 h-4" />
                Save & Recalculate
              </Button>

              {quoteStatus === 'DRAFT' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => submitMutation.mutate()}
                  isLoading={submitMutation.isPending}
                  className="gap-1.5 border-[#ecdfe8] bg-[#f5eff3] text-[#714b67] hover:bg-[#ecdfe8] text-xs font-semibold rounded-xl"
                >
                  <Send className="w-4 h-4" />
                  Submit for Review
                </Button>
              )}

              {(quoteStatus === 'APPROVED' || quoteStatus === 'DRAFT' || quoteStatus === 'CUSTOMER_NEGOTIATION') && (
                <Button
                  size="sm"
                  onClick={() => confirmMutation.mutate()}
                  isLoading={confirmMutation.isPending}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Won Deal
                </Button>
              )}

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete Quote"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Discount / Reapproval Warning Banner */}
      {liveRisk.requiresApproval && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 flex items-start gap-3 text-xs text-slate-700 shadow-subtle animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-800 text-sm">
                Multi-Tier Approval Triggered (Risk Score: {liveRisk.overallScore}/100)
              </span>
              <Badge variant="destructive">Approval Required</Badge>
            </div>
            <p className="text-slate-600">
              {liveRisk.approvalReasons.join(' ')} Deal exceeds automated thresholds and requires governance review.
            </p>
          </div>
        </div>
      )}

      {/* Split Workspace Layout: Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Quote Info + Line Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Terms Card */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Building className="w-3.5 h-3.5 text-[#714b67]" />
                Customer Account & Commercial Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Customer Account</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry || 'Enterprise'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Commercial Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
                >
                  <option value="NET_15">NET 15 Days</option>
                  <option value="NET_30">NET 30 Days (Standard)</option>
                  <option value="NET_45">NET 45 Days</option>
                  <option value="NET_60">NET 60 Days</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Proposal Expiration Date</label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-9 bg-white text-xs font-mono border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Line Items Card */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden">
            <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#252733] font-display">
                  <Boxes className="w-4 h-4 text-[#714b67]" />
                  Product Line Items ({lines.length})
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Real-time discount calculation and margin floors in Indian Rupees (₹ INR)
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsProductPickerOpen(true)}
                className="gap-1.5 h-8 text-xs bg-[#714b67] hover:bg-[#5e3c54] text-white rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold font-mono">
                    <tr>
                      <th className="px-3 py-2.5">Product Item</th>
                      <th className="px-2 py-2.5 w-20">Qty</th>
                      <th className="px-3 py-2.5">Unit Price</th>
                      <th className="px-2 py-2.5 w-24">Discount %</th>
                      <th className="px-3 py-2.5 text-right">Line Total</th>
                      {canViewCost && <th className="px-3 py-2.5 text-right">Margin %</th>}
                      <th className="px-2 py-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#252733]">
                    {lines.map((line, index) => {
                      const isExcessDiscount = line.discountPercentage > 10;
                      return (
                        <tr key={line.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Product selection */}
                          <td className="px-3 py-3 space-y-1">
                            <select
                              value={line.productId}
                              onChange={(e) => handleUpdateLine(index, { productId: e.target.value })}
                              className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-[#252733] font-medium"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span>SKU: {line.productSku}</span>
                              <span>• Category: {line.categoryName}</span>
                            </div>
                          </td>

                          {/* Quantity */}
                          <td className="px-2 py-3">
                            <Input
                              type="number"
                              min={1}
                              value={line.quantity}
                              onChange={(e) =>
                                handleUpdateLine(index, { quantity: Math.max(1, Number(e.target.value)) })
                              }
                              className="h-8 w-16 px-2 text-xs font-mono text-center bg-white border-slate-200"
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="px-3 py-3 font-mono font-medium text-[#252733]">
                            {formatCurrency(line.unitPrice, 'INR')}
                          </td>

                          {/* Discount % */}
                          <td className="px-2 py-3">
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={line.discountPercentage}
                                onChange={(e) =>
                                  handleUpdateLine(index, {
                                    discountPercentage: Math.min(100, Math.max(0, Number(e.target.value))),
                                  })
                                }
                                className={cn(
                                  'h-8 w-20 px-2 text-xs font-mono text-center bg-white',
                                  isExcessDiscount
                                    ? 'border-rose-500 text-rose-600 font-bold focus-visible:ring-rose-500'
                                    : 'border-slate-200'
                                )}
                              />
                              {isExcessDiscount && (
                                <span className="block text-[9px] text-rose-600 font-bold mt-0.5 whitespace-nowrap">
                                  &gt; 10% Floor
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Line Total */}
                          <td className="px-3 py-3 text-right font-mono font-bold text-[#252733]">
                            {formatCurrency(line.lineTotal, 'INR')}
                          </td>

                          {/* Internal Margin % */}
                          {canViewCost && (
                            <td className="px-3 py-3 text-right font-mono">
                              <span
                                className={cn(
                                  'font-bold',
                                  line.lineMarginPercentage < 18 ? 'text-rose-600' : 'text-emerald-600'
                                )}
                              >
                                {line.lineMarginPercentage.toFixed(1)}%
                              </span>
                            </td>
                          )}

                          {/* Delete */}
                          <td className="px-2 py-3 text-center">
                            <button
                              onClick={() => handleRemoveLine(index)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                              title="Remove Line"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sticky Intelligence Panel */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          {/* Financial Summary Box */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#252733] font-display">
                Financial Breakdown & Margins (₹ INR)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600 font-sans">
                <span>Gross Line Subtotal:</span>
                <span className="font-mono font-semibold">{formatCurrency(subtotal, 'INR')}</span>
              </div>

              <div className="flex justify-between text-amber-600 font-sans font-medium">
                <span>Total Discount ({overallDiscountPercentage.toFixed(1)}%):</span>
                <span className="font-mono">- {formatCurrency(totalDiscountAmount, 'INR')}</span>
              </div>

              <div className="flex justify-between text-slate-600 font-sans">
                <span>Applicable Taxes (18% GST):</span>
                <span className="font-mono">+ {formatCurrency(totalTaxAmount, 'INR')}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#252733] font-display">
                <span>Net Total Proposal:</span>
                <span className="text-[#714b67] font-mono text-base">{formatCurrency(totalAmount, 'INR')}</span>
              </div>

              {/* Internal Margins (Role-gated) */}
              <div className="pt-2 mt-2 border-t border-dashed border-slate-200 text-[11px] space-y-1 bg-slate-50 p-3 rounded-xl font-sans">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">
                  Internal Profitability Telemetry
                </span>
                {canViewCost ? (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span>Total Hardware Cost:</span>
                      <span className="font-mono">{formatCurrency(totalCost, 'INR')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Gross Margin Amount:</span>
                      <span className="text-emerald-600 font-bold font-mono">
                        {formatCurrency(grossMarginAmount, 'INR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-slate-200">
                      <span>Gross Margin %:</span>
                      <span
                        className={cn(
                          'font-mono',
                          grossMarginPercentage < 18 ? 'text-rose-600' : 'text-emerald-600'
                        )}
                      >
                        {grossMarginPercentage.toFixed(1)}% (Floor: 18.0%)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 italic flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Internal cost masked for security
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Dynamic Risk Explainability Breakdown */}
          <RiskBreakdown risk={liveRisk} />

          {/* Dynamic Approval Chain Panel */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#252733] flex items-center gap-1.5 font-display">
                <ShieldCheck className="w-4 h-4 text-[#714b67]" />
                Dynamic Approval Chain
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {liveRisk.requiresApproval ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                    <span className="font-bold">Step 1:</span> Sales Director Review
                    <Badge variant="warning" size="sm" className="ml-auto">
                      Pending
                    </Badge>
                  </div>

                  {(grossMarginPercentage < 18 || liveRisk.overallSeverity === 'CRITICAL') && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                      <span className="font-bold">Step 2:</span> CFO / Finance Controller
                      <Badge variant="destructive" size="sm" className="ml-auto">
                        Pending
                      </Badge>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    Approval triggered because discount ({overallDiscountPercentage.toFixed(1)}%) or margin (
                    {grossMarginPercentage.toFixed(1)}%) crosses risk rules.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>No executive approvals required. Within standard discretionary authority.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upsell / Cross-sell Panel (B5) */}
          {showUpsellPanel && (
            <Card className="border-[#ecdfe8] bg-gradient-to-br from-[#f5eff3] to-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-4 border-b border-[#ecdfe8] flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#714b67] flex items-center gap-1.5 font-display">
                  <Sparkles className="w-4 h-4" />
                  AI Upsell & Cross-Sell Recommendations
                </CardTitle>
                <button
                  onClick={() => setShowUpsellPanel(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-sans"
                >
                  Hide
                </button>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5">
                {upsellLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400 animate-pulse">Computing AI suggestions...</div>
                ) : upsellSuggestions.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">All relevant add-ons already included in quote.</div>
                ) : (
                  upsellSuggestions.slice(0, 4).map((s: any) => (
                    <div
                      key={s.productId}
                      className="p-3 rounded-xl border border-white bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#252733] text-xs truncate">{s.productName}</span>
                            {s.promotionTag && (
                              <span className="text-[10px] bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                                {s.promotionTag}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-sans leading-relaxed">{s.reason}</div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="font-mono font-bold text-[#252733] text-xs">
                              {formatCurrency(s.unitPrice, 'INR')}
                            </span>
                            <span className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                              s.marginDeltaDirection === 'POSITIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            )}>
                              {s.marginDeltaDirection === 'POSITIVE' ? '+' : ''}{s.marginDelta}% margin
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.coPurchaseScore}% co-purchase
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            className="h-7 text-[10px] bg-[#714b67] hover:bg-[#5e3c54] text-white gap-1 px-2.5"
                            onClick={() => {
                              handleAddProductFromCatalog({
                                id: s.productId,
                                name: s.productName,
                                sku: s.productSku,
                                categoryName: s.categoryName,
                                basePrice: s.unitPrice,
                                costPrice: s.unitCost,
                                taxRate: s.taxRate || 18,
                                isRecurring: s.isRecurring,
                                totalStockAvailable: s.stockAvailable,
                              });
                              setDismissedUpsells(prev => new Set([...prev, s.productId]));
                              setUpsellSuggestions(prev => prev.filter(u => u.productId !== s.productId));
                              confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ['#714b67', '#f5eff3'] });
                            }}
                          >
                            <Plus className="w-3 h-3" /> Add
                          </Button>
                          <button
                            onClick={() => {
                              setDismissedUpsells(prev => new Set([...prev, s.productId]));
                              setUpsellSuggestions(prev => prev.filter(u => u.productId !== s.productId));
                            }}
                            className="text-[10px] text-slate-400 hover:text-slate-600 text-center py-0.5"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!upsellLoading && upsellSuggestions.length > 0 && (
                  <p className="text-[10px] text-slate-400 font-sans text-center pt-1">
                    Powered by DealFlow360 AI Copilot • Co-purchase pattern analysis across 1,200+ deals
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fulfillment Split Link */}
          {!isNew && (
            <div className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Boxes className="w-4 h-4 text-[#714b67] shrink-0" />
                <div>
                  <div className="font-semibold text-[#252733]">Multi-Warehouse Fulfillment Split</div>
                  <div className="text-[11px] text-slate-400">View optimal stock allocation across warehouses for this quote</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/sales/quotes/${id || 'q-1024'}/fulfillment-split`)}
                className="gap-1.5 text-xs border-slate-200 shrink-0"
              >
                <ArrowRight className="w-3.5 h-3.5" /> View Split
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Product Picker Modal */}
      <Dialog
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2 font-display text-[#252733]">
            <Package className="w-5 h-5 text-[#714b67]" />
            <span>Select Product from Enterprise Catalog</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2 font-sans text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search products by title, SKU..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="bg-white border-slate-200 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {pickerCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedProductCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-medium border text-xs whitespace-nowrap ${
                    selectedProductCategory === cat
                      ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {filteredPickerProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <span className="font-bold text-[#252733] block">{p.name}</span>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>SKU: {p.sku}</span>
                    <span>• Category: {p.categoryName}</span>
                    <span>• Stock: {p.totalStockAvailable || 50} Units</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-[#252733] text-sm">
                    {formatCurrency(p.basePrice, 'INR')}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAddProductFromCatalog(p)}
                    className="bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="secondary" onClick={() => setIsProductPickerOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>

      {/* A4 Document Print Modal */}
      <A4DocumentPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        documentType="QUOTATION"
        documentNumber={quoteData?.data?.quoteNumber || 'Q-1024'}
        status={quoteStatus}
        issueDate={quoteData?.data?.createdAt || new Date().toISOString()}
        validUntilOrDueDate={validUntil}
        paymentTerms={paymentTerms}
        currency="INR"
        customerName={selectedCustomer?.name || 'Enterprise Customer'}
        lines={lines.map((l) => ({
          id: l.id,
          description: l.productName,
          sku: l.productSku,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountPercentage: l.discountPercentage,
          taxRate: l.taxRate,
          lineTotal: l.lineTotal,
        }))}
        subtotal={subtotal}
        discountTotal={totalDiscountAmount}
        taxTotal={totalTaxAmount}
        totalAmount={totalAmount}
        salespersonName={user?.name || 'Sales Executive'}
        notes="Commercial proposal is valid for 30 calendar days from the date of issuance. All hardware includes standard 3-year enterprise manufacturer warranty and 24/7 technical assistance SLA."
      />

      {/* Delete Quote Modal */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="sm"
        title="Delete Quotation"
        description={`Are you sure you want to permanently delete quotation ${quoteData?.data?.quoteNumber || id}?`}
      >
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete Quotation
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default QuoteBuilderPage;
