import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, CreateCustomerPayload } from '../../services/api/customers.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Customer, CustomerTier, PaymentTerms } from '../../types/customer';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export function CustomersPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Form state
  const [name, setName] = React.useState('');
  const [industry, setIndustry] = React.useState('Technology & Telecommunications');
  const [tier, setTier] = React.useState<CustomerTier>('GOLD');
  const [paymentTerms, setPaymentTerms] = React.useState<PaymentTerms>('NET_30');
  const [creditLimit, setCreditLimit] = React.useState<number>(10000000);
  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [address, setAddress] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers(),
  });

  const customers = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customersApi.createCustomer(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(res.message || 'Customer created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create customer');
    },
  });

  const resetForm = () => {
    setName('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setAddress('');
    setCreditLimit(10000000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    createMutation.mutate({
      name,
      industry,
      tier,
      paymentTerms,
      creditLimit,
      contactName,
      contactEmail,
      contactPhone,
      address,
    });
  };

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Account / Code',
      sortable: true,
      cell: (c) => (
        <div>
          <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors">
            {c.name}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{c.code}</div>
        </div>
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      sortable: true,
      cell: (c) => {
        const variants: Record<string, any> = {
          PLATINUM: 'indigo',
          GOLD: 'warning',
          SILVER: 'secondary',
          STANDARD: 'default',
        };
        return <Badge variant={variants[c.tier] || 'default'}>{c.tier}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      cell: (c) =>
        c.status === 'TRIAL' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
            <Sparkles className="w-3 h-3" />
            7-Day Trial ({c.trialDaysRemaining}d left)
          </span>
        ) : (
          <Badge variant="success">ACTIVE</Badge>
        ),
    },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      sortable: true,
      cell: (c) => (
        <span className="text-[#252733] font-mono">
          {formatCurrency(c.creditLimit, currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      cell: (c) => <span className="font-mono text-xs text-slate-600">{c.paymentTerms}</span>,
    },
    {
      key: 'totalRevenue',
      header: 'Lifetime Spend',
      sortable: true,
      cell: (c) => (
        <span className="font-bold text-emerald-600 font-mono">
          {formatCurrency(c.totalRevenue, currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Onboarded',
      sortable: true,
      cell: (c) => <span className="text-slate-500">{formatDate(c.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Customers' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Customers & Enterprise Accounts
          </h1>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Create Customer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchPlaceholder="Search customer accounts by name or code..."
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
      />

      {/* Create Customer Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Onboard New Customer Account</span>
          </div>
        }
        description="Register a corporate customer with commercial tier, credit ceiling, and payment terms."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tata Digital Ventures Ltd"
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Industry Vertical</label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Cloud SaaS, Telecom, Healthcare"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Customer Tier</label>
              <select
                value={tier}
                onChange={(e: any) => setTier(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="STANDARD">STANDARD</option>
                <option value="SILVER">SILVER</option>
                <option value="GOLD">GOLD (Standard)</option>
                <option value="PLATINUM">PLATINUM (Strategic)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e: any) => setPaymentTerms(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="IMMEDIATE">Immediate on Invoice</option>
                <option value="NET_15">NET 15 Days</option>
                <option value="NET_30">NET 30 Days (Standard)</option>
                <option value="NET_45">NET 45 Days</option>
                <option value="NET_60">NET 60 Days</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Credit Limit (INR)</label>
              <Input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Contact Name</label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Contact Email</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="billing@tatadigital.com"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Contact Phone</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Official Address / Headquarters</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. World Trade Centre, Cuffe Parade, Mumbai"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              Onboard Customer
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
