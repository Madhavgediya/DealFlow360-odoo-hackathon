import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '../../services/api/leads.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Lead, LeadStage } from '../../types/crm';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building } from 'lucide-react';
import { cn } from '../../utils/formatting';

export function LeadsPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = React.useState<string>('ALL');

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
    </div>
  );
}
