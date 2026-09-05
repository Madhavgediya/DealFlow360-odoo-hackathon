import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../../services/api/customers.api';
import { quotesApi } from '../../services/api/quotes.api';
import { subscriptionsApi } from '../../services/api/subscriptions.api';
import { billingApi } from '../../services/api/billing.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs } from '../../components/ui/tabs';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building,
  Mail,
  CreditCard,
  FileText,
  Repeat,
  Receipt,
  Plus,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState('quotes');

  const { data: customerData, isLoading: isCustLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getCustomerById(id || 'cust-1'),
  });

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

  const customer = customerData?.data;
  const customerQuotes = (quotesData?.data || []).filter((q) => q.customerId === id);
  const customerSubs = (subsData?.data || []).filter((s) => s.customerId === id);
  const customerInvoices = (invoicesData?.data || []).filter((i) => i.customerId === id);

  if (isCustLoading || !customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-400">Loading Customer profile...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'quotes', label: 'Quotations & Deals', count: customerQuotes.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'subscriptions', label: 'Subscriptions (Trial)', count: customerSubs.length, icon: <Repeat className="w-3.5 h-3.5" /> },
    { id: 'invoices', label: 'Invoices & Payments', count: customerInvoices.length, icon: <Receipt className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Customers', href: '/customers' },
              { label: customer.name },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              {customer.name}
            </h1>
            <Badge variant="indigo" size="md">{customer.tier} Tier</Badge>
            {customer.status === 'TRIAL' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
                <Sparkles className="w-3 h-3" />
                7-Day Trial Active ({customer.trialDaysRemaining}d remaining)
              </span>
            ) : (
              <Badge variant="success" size="md">ACTIVE</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/sales/quotes/new')}
            className="gap-1.5 shadow-subtle bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <Plus className="w-4 h-4" />
            New quote for customer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/portal')}
            className="gap-1.5 bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]"
          >
            <span>Customer portal view</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Customer 360 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
        {/* Card 1: Account Terms */}
        <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
          <CardHeader className="p-4 border-b border-[#e5e7eb]">
            <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
              <CreditCard className="w-3.5 h-3.5 text-[#714b67]" />
              Commercial & Billing Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Terms:</span>
              <span className="text-[#252733] font-bold">{customer.paymentTerms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Credit Limit:</span>
              <span className="text-emerald-600 font-bold">{formatCurrency(customer.creditLimit, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Credit Utilized:</span>
              <span className="text-slate-800">{formatCurrency(customer.creditUsed, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Price List:</span>
              <span className="text-[#714b67] font-semibold truncate max-w-[150px]">{customer.priceListName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Primary Contacts */}
        <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
          <CardHeader className="p-4 border-b border-[#e5e7eb]">
            <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Building className="w-3.5 h-3.5 text-[#714b67]" />
              Primary Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {customer.contacts.map((cnt) => (
              <div key={cnt.id} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#252733]">{cnt.name}</span>
                  {cnt.isPrimary && <Badge variant="secondary" size="sm">Primary</Badge>}
                </div>
                <p className="text-slate-500 text-[11px]">{cnt.role}</p>
                <p className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {cnt.email}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 3: Address & Dispatch */}
        <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
          <CardHeader className="p-4 border-b border-[#e5e7eb]">
            <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
              <MapPin className="w-3.5 h-3.5 text-[#714b67]" />
              Billing & Delivery Site
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs text-[#252733]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Address</span>
              <p>{customer.billingAddress.street}, {customer.billingAddress.city}, {customer.billingAddress.state} - {customer.billingAddress.postalCode}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Shipping Delivery Site</span>
              <p>{customer.shippingAddress.street}, {customer.shippingAddress.city}, {customer.shippingAddress.state} - {customer.shippingAddress.postalCode}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Quotes, Subscriptions, Invoices */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* TAB 1: Quotations */}
        {activeTab === 'quotes' && (
          <div className="space-y-3">
            {customerQuotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No quotes created for this customer yet.</p>
            ) : (
              customerQuotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/sales/quotes/${q.id}`)}
                  className="p-4 rounded-2xl border border-[#e5e7eb] bg-white hover:border-[#714b67]/50 hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-subtle"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#252733] text-sm">{q.quoteNumber}</span>
                      <StatusBadge status={q.status} />
                    </div>
                    <p className="text-slate-500">
                      {q.lines.length} Line Items • Sales Rep: {q.salespersonName} • Valid Until: {formatDate(q.validUntil)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Net Total</span>
                      <span className="font-bold text-[#252733] text-sm">{formatCurrency(q.totalAmount, currency)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-3">
            {customerSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl border border-[#e5e7eb] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-subtle"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#252733] text-sm">{sub.planName}</span>
                    <Badge variant="indigo">{sub.status}</Badge>
                  </div>
                  <p className="text-slate-500">
                    Period: {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)} • {sub.seats} Seats Allocated
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Plan Price</span>
                  <span className="font-bold text-[#252733]">{formatCurrency(sub.price, currency)} / {sub.billingCycle}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {customerInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/billing/invoices/${inv.id}`)}
                className="p-4 rounded-2xl border border-[#e5e7eb] bg-white hover:border-[#714b67]/50 hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-subtle"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#252733] text-sm">{inv.invoiceNumber}</span>
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </div>
                  <p className="text-slate-500">Due: {formatDate(inv.dueDate)} • Issued: {formatDate(inv.issueDate)}</p>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Amount Due</span>
                  <span className="font-bold text-emerald-600 text-sm">{formatCurrency(inv.totalAmount, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
