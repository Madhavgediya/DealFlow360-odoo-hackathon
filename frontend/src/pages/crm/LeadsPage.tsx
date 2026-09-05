import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, CreateLeadPayload } from '../../services/api/leads.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Lead, LeadStage } from '../../types/crm';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../utils/formatting';

export function LeadsPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = React.useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Form State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [industry, setIndustry] = React.useState('Technology & Telecommunications');
  const [budget, setBudget] = React.useState<number>(1500000);
  const [priority, setPriority] = React.useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [requirements, setRequirements] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['leads', selectedStage],
    queryFn: () => leadsApi.getLeads(undefined, selectedStage === 'ALL' ? undefined : selectedStage),
  });

  const leads = data?.data || [];

  const stageTabs = [
    { id: 'ALL', label: 'All Leads', count: leads.length },
    { id: 'NEW', label: 'New' },
    { id: 'QUALIFIED', label: 'Qualified' },
    { id: 'PROPOSAL', label: 'In Proposal' },
    { id: 'CONVERTED', label: 'Converted' },
  ];

  const createMutation = useMutation({
    mutationFn: (payload: CreateLeadPayload) => leadsApi.createLead(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(res.message || 'Lead created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create lead');
    },
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setRequirements('');
    setBudget(1500000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !companyName.trim() || !email.trim()) {
      toast.error('Please fill in First Name, Company Name, and Work Email.');
      return;
    }

    createMutation.mutate({
      firstName,
      lastName,
      companyName,
      email,
      phone,
      industry,
      budget,
      priority,
      requirements,
      source: 'WEBSITE',
    });
  };

  const columns: ColumnDef<Lead>[] = [
    {
      key: 'fullName',
      header: 'Lead Name / Company',
      sortable: true,
      cell: (lead) => (
        <div>
          <div className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors">
            {lead.fullName}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{lead.companyName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'AI Lead Score',
      sortable: true,
      cell: (lead) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#f5eff3] border border-[#ecdfe8] flex items-center justify-center font-mono font-bold text-xs text-[#714b67]">
            {lead.score}
          </div>
          <div className="text-[11px] text-slate-500">
            {lead.score >= 90 ? (
              <span className="text-emerald-600 font-semibold">High Intent</span>
            ) : lead.score >= 70 ? (
              <span className="text-amber-600">Warm</span>
            ) : (
              <span className="text-slate-400">Evaluating</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      sortable: true,
      cell: (lead) => {
        const variants: Record<LeadStage, any> = {
          NEW: 'default',
          CONTACTED: 'secondary',
          QUALIFIED: 'indigo',
          PROPOSAL: 'warning',
          CONVERTED: 'success',
          UNQUALIFIED: 'destructive',
        };
        return <Badge variant={variants[lead.stage] || 'default'}>{lead.stage}</Badge>;
      },
    },
    {
      key: 'budget',
      header: 'Budget Est.',
      sortable: true,
      cell: (lead) => (
        <span className="font-bold text-[#252733]">
          {formatCurrency(lead.budget, currency, { compact: true })}
        </span>
      ),
    },
    {
      key: 'hasTrial',
      header: '7-Day Trial',
      cell: (lead) =>
        lead.hasTrial ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
            <Sparkles className="w-3 h-3" />
            {lead.trialDaysRemaining}d remaining
          </span>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    {
      key: 'assignedToName',
      header: 'Assigned To',
      cell: (lead) => <span className="text-slate-600">{lead.assignedToName}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      cell: (lead) => <span className="text-slate-500">{formatDate(lead.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Leads & Pipeline' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Leads & Pipeline
          </h1>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Create New Lead
        </Button>
      </div>

      {/* Stage Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stageTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStage(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border',
              selectedStage === tab.id
                ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-subtle'
                : 'bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <DataTable
        columns={columns}
        data={leads}
        isLoading={isLoading}
        searchPlaceholder="Search leads by contact, company, email..."
        onRowClick={(lead) => navigate(`/crm/leads/${lead.id}`)}
        emptyTitle="No leads in this stage"
        emptyDescription="All incoming leads for this filter have been qualified or converted."
      />

      {/* Create Lead Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Create Commercial Lead</span>
          </div>
        }
        description="Ingest new enterprise lead with automated AI qualification scoring and budget estimation."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Vikram"
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Mehta"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation Pvt Ltd"
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="v.mehta@acme.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Contact Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Estimated Deal Budget (INR)</label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH (Standard)</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Industry Vertical</label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Cloud SaaS, Manufacturing, Financial Services"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Commercial / Technical Requirements</label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Outline specific customer hardware/SaaS needs, timeline, and decision makers..."
              className="w-full h-20 rounded-xl border border-[#e5e7eb] bg-white p-3 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]/20"
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
              Create Lead
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
