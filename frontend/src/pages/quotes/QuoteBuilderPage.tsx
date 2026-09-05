import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { productsApi } from '../../services/api/products.api';
import { customersApi } from '../../services/api/customers.api';
import { useAuthStore } from '../../stores/auth.store';
import { can } from '../../utils/permissions';
import { formatCurrency } from '../../utils/currency';
import { calculateRiskAssessment } from '../../utils/risk';
import { QuoteLineItem, QuoteRiskAssessment } from '../../types/quote';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
} from 'lucide-react';
import { cn } from '../../utils/formatting';

export function QuoteBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, user } = useAuthStore();

  const canViewCost = can(user, 'cost.view');

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
  const [validUntil, setValidUntil] = React.useState('2026-03-31');
  const [lines, setLines] = React.useState<QuoteLineItem[]>([]);
  const [quoteStatus, setQuoteStatus] = React.useState<string>('DRAFT');
  const [revisionNumber, setRevisionNumber] = React.useState<number>(1);

  // Initialize state when existing quote loads
  React.useEffect(() => {
    if (quoteData?.data && !isNew) {
      const q = quoteData.data;
      setCustomerId(q.customerId);
      setPaymentTerms(q.paymentTerms);
      setValidUntil(q.validUntil ? q.validUntil.substring(0, 10) : '2026-03-31');
      setLines(q.lines);
      setQuoteStatus(q.status);
      setRevisionNumber(q.currentRevisionNumber);
    } else if (isNew && products.length > 0 && lines.length === 0) {
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
          unitPrice: firstProd.basePrice,
          discountPercentage: 10,
          discountAmount: (firstProd.basePrice * 10 * 10) / 100,
          taxRate: firstProd.taxRate,
          taxAmount: (firstProd.basePrice * 10 * 0.9 * firstProd.taxRate) / 100,
          lineSubtotal: firstProd.basePrice * 10,
          lineTotal: firstProd.basePrice * 10 * 0.9 * 1.18,
          unitCost: firstProd.costPrice,
          totalCost: firstProd.costPrice * 10,
          lineMarginAmount: firstProd.basePrice * 10 * 0.9 - firstProd.costPrice * 10,
          lineMarginPercentage: 22.5,
          warehouseId: 'wh-surat',
          warehouseName: 'Surat Central Logistics Hub',
          isRecurring: firstProd.isRecurring,
          stockAvailable: firstProd.totalStockAvailable || 15,
          stockShortage: 0,
        },
      ]);
    }
  }, [quoteData, isNew, products]);

  // Real-time Dynamic Financials & Risk Calculation
  const subtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
  const totalDiscountAmount = lines.reduce((acc, l) => acc + (l.unitPrice * l.quantity * l.discountPercentage) / 100, 0);
  const netTaxable = subtotal - totalDiscountAmount;
  const totalTaxAmount = lines.reduce((acc, l) => {
    const lineNet = l.unitPrice * l.quantity * (1 - l.discountPercentage / 100);
    return acc + (lineNet * l.taxRate) / 100;
  }, 0);
  const totalAmount = netTaxable + totalTaxAmount;
  const totalCost = lines.reduce((acc, l) => acc + l.unitCost * l.quantity, 0);
  const grossMarginAmount = netTaxable - totalCost;
  const grossMarginPercentage = netTaxable > 0 ? (grossMarginAmount / netTaxable) * 100 : 0;
  const overallDiscountPercentage = subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

  // Real-time Risk Assessment Engine
  const liveRisk: QuoteRiskAssessment = React.useMemo(() => {
    return calculateRiskAssessment(lines, subtotal, totalDiscountAmount, totalCost, grossMarginPercentage);
  }, [lines, subtotal, totalDiscountAmount, totalCost, grossMarginPercentage]);

  // Line item handlers
  const handleAddProduct = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;

    const newLine: QuoteLineItem = {
      id: `line-${Date.now()}`,
      productId: defaultProd.id,
      productName: defaultProd.name,
      productSku: defaultProd.sku,
      categoryId: defaultProd.categoryId,
      categoryName: defaultProd.categoryName,
      quantity: 5,
      unitPrice: defaultProd.basePrice,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate: defaultProd.taxRate,
      taxAmount: (defaultProd.basePrice * 5 * defaultProd.taxRate) / 100,
      lineSubtotal: defaultProd.basePrice * 5,
      lineTotal: defaultProd.basePrice * 5 * (1 + defaultProd.taxRate / 100),
      unitCost: defaultProd.costPrice,
      totalCost: defaultProd.costPrice * 5,
      lineMarginAmount: defaultProd.basePrice * 5 - defaultProd.costPrice * 5,
      lineMarginPercentage: ((defaultProd.basePrice - defaultProd.costPrice) / defaultProd.basePrice) * 100,
      warehouseId: 'wh-surat',
      warehouseName: 'Surat Central Logistics Hub',
      isRecurring: defaultProd.isRecurring,
      stockAvailable: defaultProd.totalStockAvailable || 10,
      stockShortage: 0,
    };

    setLines([...lines, newLine]);
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
        item.unitPrice = prod.basePrice;
        item.unitCost = prod.costPrice;
        item.taxRate = prod.taxRate;
        item.isRecurring = prod.isRecurring;
        item.stockAvailable = prod.totalStockAvailable || 10;
      }
    }

    const lineSubtotal = item.unitPrice * item.quantity;
    const discountAmount = (lineSubtotal * item.discountPercentage) / 100;
    const taxableAmount = lineSubtotal - discountAmount;
    const taxAmount = (taxableAmount * item.taxRate) / 100;
    const lineTotal = taxableAmount + taxAmount;
    const lineTotalCost = item.unitCost * item.quantity;
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

  // Submit mutations
  const updateMutation = useMutation({
    mutationFn: () => quotesApi.updateQuoteLines(id || 'q-1024', lines, user?.name, user?.roleTitle),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      if (res.data?.status) {
        setQuoteStatus(res.data.status);
      }
      toast.success('Quote updated and risk re-evaluated!');
    },

  });

  const confirmMutation = useMutation({
    mutationFn: () => quotesApi.confirmQuote(id || 'q-1024'),
    onSuccess: () => {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setQuoteStatus('CONFIRMED');
      toast.success('Quote confirmed as WON DEAL! Order sent to Fulfillment.');
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Quotations', href: '/sales/quotes' },
              { label: isNew ? 'New Quotation' : quoteData?.data?.quoteNumber || 'Q-1024' },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {isNew ? 'Create Commercial Quotation' : `${quoteData?.data?.quoteNumber} — ${quoteData?.data?.customerName}`}
            </h1>
            {!isNew && <StatusBadge status={quoteStatus} />}
            <RiskBadge severity={liveRisk.overallSeverity} score={liveRisk.overallScore} showScore />
            <span className="text-xs text-slate-400 font-mono">Revision {revisionNumber}</span>
          </div>
        </div>          {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isNew && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/sales/negotiations/${id || 'q-1024'}`)}
              className="gap-1.5 bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]"
            >
              <Repeat className="w-4 h-4 text-[#714b67]" />
              Negotiation Diff View
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => updateMutation.mutate()}
            isLoading={updateMutation.isPending}
            className="gap-1.5 shadow-subtle bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <ShieldCheck className="w-4 h-4" />
            Save & Recalculate Risk
          </Button>

          {quoteStatus === 'APPROVED' && (
            <Button
              size="sm"
              onClick={() => confirmMutation.mutate()}
              isLoading={confirmMutation.isPending}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Won Deal
            </Button>
          )}
        </div>
      </div>

      {/* Hero Discount / Reapproval Warning Banner if risk is HIGH or CRITICAL */}
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
              {liveRisk.approvalReasons.join(' ')} Deal cannot be confirmed until authorized by <strong>Sales Director</strong> and <strong>Finance Controller</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Quote Info + Line Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Metadata Card */}
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 border-b border-[#e5e7eb]">
              <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Building className="w-3.5 h-3.5 text-[#714b67]" />
                Customer & Commercial Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Customer Account</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
                >
                  <option value="NET_15">NET 15 Days</option>
                  <option value="NET_30">NET 30 Days (Standard)</option>
                  <option value="NET_45">NET 45 Days</option>
                  <option value="NET_60">NET 60 Days</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Valid Until Date</label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-9 bg-white text-xs font-mono border-[#e5e7eb]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Line Items Card */}
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl overflow-hidden">
            <CardHeader className="p-4 bg-[#f3f4f6]/50 border-b border-[#e5e7eb] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#252733] font-display">
                  <Boxes className="w-4 h-4 text-[#714b67]" />
                  Product & Hardware Line Items ({lines.length})
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Real-time discount limits enforced per category
                </p>
              </div>
              <Button size="sm" onClick={handleAddProduct} className="gap-1.5 h-8 text-xs bg-[#714b67] hover:bg-[#5e3c54] text-white">
                <Plus className="w-3.5 h-3.5" />
                Add Line Item
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f3f4f6] border-b border-[#e5e7eb] text-slate-500 uppercase tracking-wider font-semibold font-mono">
                    <tr>
                      <th className="px-3 py-2.5">Product / Category</th>
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
                        <tr key={line.id} className="hover:bg-[#f3f4f6]/70 transition-colors">
                          {/* Product selection */}
                          <td className="px-3 py-3 space-y-1">
                            <select
                              value={line.productId}
                              onChange={(e) => handleUpdateLine(index, { productId: e.target.value })}
                              className="w-full h-8 rounded-lg border border-[#e5e7eb] bg-white px-2 text-xs text-[#252733] font-medium"
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
                              {line.stockShortage ? (
                                <span className="text-amber-600 font-bold">
                                  ({line.stockShortage} units deficit)
                                </span>
                              ) : null}
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
                              className="h-8 w-16 px-2 text-xs font-mono text-center bg-white border-[#e5e7eb]"
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="px-3 py-3 font-mono font-medium text-[#252733]">
                            {formatCurrency(line.unitPrice, currency)}
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
                                    : 'border-[#e5e7eb]'
                                )}
                              />
                              {isExcessDiscount && (
                                <span className="block text-[9px] text-rose-600 font-bold mt-0.5 whitespace-nowrap">
                                  &gt; 10% Policy Limit!
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Line Total */}
                          <td className="px-3 py-3 text-right font-mono font-bold text-[#252733]">
                            {formatCurrency(line.lineTotal, currency)}
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
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-[#f3f4f6] transition-colors"
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
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 bg-[#f3f4f6]/50 border-b border-[#e5e7eb]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#252733] font-display">
                Financial Breakdown & Margins
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Gross Line Subtotal:</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>

              <div className="flex justify-between text-amber-600">
                <span>Total Discount ({overallDiscountPercentage.toFixed(1)}%):</span>
                <span>- {formatCurrency(totalDiscountAmount, currency)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Applicable Taxes (18% GST):</span>
                <span>+ {formatCurrency(totalTaxAmount, currency)}</span>
              </div>

              <div className="pt-2 border-t border-[#e5e7eb] flex justify-between text-sm font-bold text-[#252733]">
                <span>Net Total Quotation:</span>
                <span className="text-[#714b67]">{formatCurrency(totalAmount, currency)}</span>
              </div>

              {/* Internal Margins (Role-gated) */}
              <div className="pt-2 mt-2 border-t border-dashed border-[#e5e7eb] text-[11px] space-y-1 bg-[#f3f4f6] p-2.5 rounded-xl">
                <span className="text-slate-400 uppercase font-bold block">Internal Profitability Metrics</span>
                {canViewCost ? (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span>Total Hardware Cost:</span>
                      <span>{formatCurrency(totalCost, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Gross Profit Contribution:</span>
                      <span className="text-emerald-600 font-bold">{formatCurrency(grossMarginAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-[#e5e7eb]">
                      <span>Gross Margin Percentage:</span>
                      <span className={cn(grossMarginPercentage < 18 ? 'text-rose-600' : 'text-emerald-600')}>
                        {grossMarginPercentage.toFixed(1)}% (Floor: 18.0%)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 italic flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Internal cost & margin masked for {user?.roleTitle}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Dynamic Risk Explainability Breakdown */}
          <RiskBreakdown risk={liveRisk} />

          {/* Dynamic Approval Chain Panel */}
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 bg-[#f3f4f6]/50 border-b border-[#e5e7eb]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#252733] flex items-center gap-1.5 font-display">
                <ShieldCheck className="w-4 h-4 text-[#714b67]" />
                Dynamic Approval Chain
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {liveRisk.requiresApproval ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#fef3e9] border border-[#fde4cf] text-[#d97706]">
                    <span className="font-bold">Step 1:</span> Sales Director (Vikram Mehta)
                    <Badge variant="warning" size="sm" className="ml-auto">Pending</Badge>
                  </div>

                  {(grossMarginPercentage < 18 || liveRisk.overallSeverity === 'CRITICAL') && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                      <span className="font-bold">Step 2:</span> CFO / Finance Controller (Rajesh Singhania)
                      <Badge variant="destructive" size="sm" className="ml-auto">Pending</Badge>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    "Why am I seeing this approval?" — Because discount ({overallDiscountPercentage.toFixed(1)}%) exceeds 10% policy limit and compressed margin ({grossMarginPercentage.toFixed(1)}%) is below 18.0% hurdle floor.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>No executive approvals required. Within standard rep discretionary authority.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
