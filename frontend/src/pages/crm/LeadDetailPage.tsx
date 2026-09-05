import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, CreateLeadPayload } from '../../services/api/leads.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Building,
  Mail,
  Phone,
  UserCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquarePlus,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { LeadConversionPayload, LeadStage } from '../../types/crm';
import { cn } from '../../utils/formatting';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, user: currentUser } = useAuthStore();

  const [isConvertWizardOpen, setIsConvertWizardOpen] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState(1);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Interaction state
  const [interactionType, setInteractionType] = React.useState<'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'>('CALL');
  const [interactionSubject, setInteractionSubject] = React.useState('');
  const [interactionNotes, setInteractionNotes] = React.useState('');
  const [interactionOutcome, setInteractionOutcome] = React.useState('Interested');
  const [interactionFollowup, setInteractionFollowup] = React.useState('');

  // Edit lead state
  const [editFirstName, setEditFirstName] = React.useState('');
  const [editLastName, setEditLastName] = React.useState('');
  const [editCompanyName, setEditCompanyName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editBudget, setEditBudget] = React.useState(1500000);
  const [editPriority, setEditPriority] = React.useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [editRequirements, setEditRequirements] = React.useState('');

  // Conversion wizard state
  const [tier, setTier] = React.useState<'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM'>('GOLD');
  const [paymentTerms, setPaymentTerms] = React.useState<'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'IMMEDIATE'>('NET_30');
  const [creditLimit, setCreditLimit] = React.useState<number>(10000000);
  const [enableTrial, setEnableTrial] = React.useState(true);
  const [sendPortalInvite, setSendPortalInvite] = React.useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getLeadById(id || 'lead-101'),
  });

  const lead = data?.data;

  // Initialize edit fields when lead loads
  React.useEffect(() => {
    if (lead) {
      setEditFirstName(lead.firstName || '');
      setEditLastName(lead.lastName || '');
      setEditCompanyName(lead.companyName || '');
      setEditEmail(lead.email || '');
      setEditPhone(lead.phone || '');
      setEditBudget(lead.budget || 1500000);
      setEditRequirements(lead.requirements || '');
    }
  }, [lead]);

  const convertMutation = useMutation({
    mutationFn: (payload: LeadConversionPayload) => leadsApi.convertLead(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success('Lead converted to Customer and 7-Day Trial activated!');
      setIsConvertWizardOpen(false);
      if (res.data?.customer?.id) {
        navigate(`/customers/${res.data.customer.id}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to convert lead');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStage: LeadStage) => leadsApi.updateLeadStatus(lead!.id, newStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead stage updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update lead status');
    },
  });

  const interactionMutation = useMutation({
    mutationFn: () =>
      leadsApi.addInteraction(lead!.id, {
        type: interactionType,
        subject: interactionSubject,
        notes: interactionNotes,
        outcome: interactionOutcome,
        nextFollowup: interactionFollowup || undefined,
        performedBy: currentUser?.name || 'Account Exec',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      toast.success('Interaction logged successfully!');
      setIsInteractionModalOpen(false);
      setInteractionSubject('');
      setInteractionNotes('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to log interaction');
    },
  });

  const editMutation = useMutation({
    mutationFn: () =>
      leadsApi.updateLead(lead!.id, {
        firstName: editFirstName,
        lastName: editLastName,
        companyName: editCompanyName,
        email: editEmail,
        phone: editPhone,
        budget: editBudget,
        priority: editPriority,
        requirements: editRequirements,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead details updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => leadsApi.deleteLead(lead!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
      navigate('/crm/leads');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete lead');
    },
  });

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-400">Loading Lead data...</span>
      </div>
    );
  }

  const handleConvertSubmit = () => {
    convertMutation.mutate({
      leadId: lead.id,
      customerName: lead.companyName,
      contactEmail: lead.email,
      contactPhone: lead.phone,
      tier,
      paymentTerms,
      creditLimit,
      enableTrial,
      sendPortalInvite,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Leads & Pipeline', href: '/crm/leads' },
              { label: lead.companyName },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
              {lead.companyName}
            </h1>
            <Badge variant="indigo" size="md">
              Score: {lead.score}/100
            </Badge>
            <select
              value={lead.stage}
              onChange={(e) => statusMutation.mutate(e.target.value as LeadStage)}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-[#ecdfe8] bg-[#f5eff3] text-[#714b67] cursor-pointer"
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL">IN PROPOSAL</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="UNQUALIFIED">LOST / UNQUALIFIED</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-1.5 border-[#e5e7eb] text-slate-700 hover:bg-[#f3f4f6]"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            Edit Lead
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInteractionModalOpen(true)}
            className="gap-1.5 border-[#e5e7eb] text-slate-700 hover:bg-[#f3f4f6]"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#714b67]" />
            Log Activity
          </Button>

          {/* 1-Click Generate Commercial Quote Button */}
          <Button
            size="sm"
            onClick={() =>
              navigate(
                `/sales/quotes/new?leadId=${lead.id}&customerName=${encodeURIComponent(
                  lead.companyName
                )}&budget=${lead.budget}&contactEmail=${encodeURIComponent(lead.email)}`
              )
            }
            className="gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-subtle"
          >
            <FileText className="w-4 h-4" />
            Generate Commercial Quote
          </Button>

          {lead.stage !== 'CONVERTED' ? (
            <Button
              size="sm"
              onClick={() => {
                setWizardStep(1);
                setIsConvertWizardOpen(true);
              }}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              Convert to Customer
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/customers/${lead.convertedCustomerId || 'cust-1'}`)}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              View Customer
            </Button>
          )}

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Delete Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lead Profile & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Details Card */}
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-[#e5e7eb] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#252733] flex items-center gap-2 font-display">
                <Building className="w-4 h-4 text-[#714b67]" />
                Enterprise Lead Profile & Commercial Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400">Primary Contact</span>
                  <p className="font-bold text-[#252733] text-sm">{lead.fullName}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {lead.email}
                  </p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {lead.phone}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400">Company & Industry</span>
                  <p className="font-bold text-[#252733]">{lead.companyName}</p>
                  <p className="text-slate-500">{lead.industry}</p>
                  <p className="text-slate-500">
                    Employees: <strong className="text-[#252733]">{lead.employeeCount}</strong> • Est. Rev:{' '}
                    <strong className="text-[#252733]">
                      {formatCurrency(lead.annualRevenue || 0, currency, { compact: true })}
                    </strong>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400">Estimated Deal Budget</span>
                  <p className="text-base font-bold text-emerald-600 font-mono">
                    {formatCurrency(lead.budget, currency)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400">Assigned Account Exec</span>
                  <p className="font-bold text-[#252733]">{lead.assignedToName || 'Ananya Sharma'}</p>
                  <p className="text-slate-500">Target Close: {formatDate(lead.expectedCloseDate)}</p>
                </div>
              </div>

              {/* Requirements & Notes */}
              <div className="pt-3 border-t border-[#e5e7eb]">
                <span className="text-xs font-bold text-[#252733] block mb-1">
                  Commercial & Technical Requirements:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-[#f3f4f6] p-3 rounded-xl border border-[#e5e7eb]">
                  {lead.requirements}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-[#e5e7eb] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#252733] font-display">
                <Clock className="w-4 h-4 text-[#714b67]" />
                Interactions & Qualification Timeline ({lead.activities.length})
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsInteractionModalOpen(true)}
                className="h-7 text-xs gap-1 border-[#ecdfe8] text-[#714b67] bg-[#f5eff3]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Entry
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3 font-sans">
              {lead.activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs bg-[#f3f4f6]/70 p-3 rounded-xl border border-[#e5e7eb]">
                  <div className="p-1.5 rounded-lg bg-[#f5eff3] text-[#714b67] h-fit border border-[#ecdfe8]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#252733]">{act.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600">{act.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      By: {act.performedBy} ({act.performedByRole})
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: AI Score Summary & Next Steps */}
        <div className="space-y-4 font-sans">
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 border-b border-[#e5e7eb]">
              <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Sparkles className="w-3.5 h-3.5 text-[#714b67]" />
                AI Qualification Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#f5eff3] border border-[#ecdfe8] text-[#714b67] leading-relaxed">
                <strong>AI Assessment:</strong> Lead demonstrates high purchase intent with validated IT infrastructure budget and decision authority verified. Recommended for immediate conversion or quote generation.
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-1 border-b border-[#e5e7eb] text-[11px]">
                  <span className="text-slate-500">Decision Authority</span>
                  <span className="text-emerald-600 font-bold">Verified (Decision Maker)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5e7eb] text-[11px]">
                  <span className="text-slate-500">Budget Adequacy</span>
                  <span className="text-emerald-600 font-bold">{formatCurrency(lead.budget, currency)} Allocated</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5e7eb] text-[11px]">
                  <span className="text-slate-500">Timeline Urgency</span>
                  <span className="text-amber-600 font-bold">&lt; 30 Days</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  onClick={() =>
                    navigate(
                      `/sales/quotes/new?leadId=${lead.id}&customerName=${encodeURIComponent(
                        lead.companyName
                      )}&budget=${lead.budget}&contactEmail=${encodeURIComponent(lead.email)}`
                    )
                  }
                  className="w-full gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-subtle"
                  size="sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Generate Quote for this Lead
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>

                {lead.stage !== 'CONVERTED' && (
                  <Button
                    onClick={() => {
                      setWizardStep(1);
                      setIsConvertWizardOpen(true);
                    }}
                    variant="outline"
                    className="w-full gap-1.5 border-[#ecdfe8] text-[#714b67] hover:bg-[#f5eff3]"
                    size="sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Launch Customer Conversion Wizard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5-Step Customer Conversion Wizard Modal */}
      <Dialog
        isOpen={isConvertWizardOpen}
        onClose={() => setIsConvertWizardOpen(false)}
        maxWidth="xl"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Lead to Customer Conversion Wizard (Step {wizardStep}/5)</span>
          </div>
        }
        description="Transform qualified lead into an enterprise customer account with 7-day trial and portal access"
      >
        <div className="space-y-6 pt-2 font-sans">
          {/* Progress bar steps */}
          <div className="flex items-center justify-between text-[11px] font-semibold border-b border-[#e5e7eb] pb-3">
            <span className={cn(wizardStep >= 1 ? 'text-[#714b67]' : 'text-slate-400')}>1. Lead Data</span>
            <span className={cn(wizardStep >= 2 ? 'text-[#714b67]' : 'text-slate-400')}>2. Customer Tier</span>
            <span className={cn(wizardStep >= 3 ? 'text-[#714b67]' : 'text-slate-400')}>3. 7-Day Trial</span>
            <span className={cn(wizardStep >= 4 ? 'text-[#714b67]' : 'text-slate-400')}>4. Portal Access</span>
            <span className={cn(wizardStep >= 5 ? 'text-[#714b67]' : 'text-slate-400')}>5. Confirm</span>
          </div>

          {/* STEP 1: Verify Lead Info */}
          {wizardStep === 1 && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#252733]">Step 1: Verify Account Credentials</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Company Name</label>
                  <Input value={lead.companyName} readOnly className="bg-[#f3f4f6]" />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Primary Contact Name</label>
                  <Input value={lead.fullName} readOnly className="bg-[#f3f4f6]" />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Official Email</label>
                  <Input value={lead.email} readOnly className="bg-[#f3f4f6]" />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Contact Phone</label>
                  <Input value={lead.phone} readOnly className="bg-[#f3f4f6]" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Tier & Payment Terms */}
          {wizardStep === 2 && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#252733]">Step 2: Commercial Tier & Credit Limit</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Customer Tier</label>
                  <select
                    value={tier}
                    onChange={(e: any) => setTier(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
                  >
                    <option value="STANDARD">STANDARD Tier</option>
                    <option value="SILVER">SILVER Tier</option>
                    <option value="GOLD">GOLD Tier (Recommended)</option>
                    <option value="PLATINUM">PLATINUM Strategic Tier</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e: any) => setPaymentTerms(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
                  >
                    <option value="NET_15">NET 15 Days</option>
                    <option value="NET_30">NET 30 Days (Standard)</option>
                    <option value="NET_45">NET 45 Days</option>
                    <option value="NET_60">NET 60 Days</option>
                    <option value="IMMEDIATE">Immediate on Invoice</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-slate-500 block mb-1">Approved Credit Limit (INR)</label>
                  <Input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="bg-white font-mono border-[#e5e7eb]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 7-Day Trial Setup */}
          {wizardStep === 3 && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#252733]">Step 3: 7-Day Enterprise SaaS Trial</h4>
              <div className="p-4 rounded-2xl border border-[#ecdfe8] bg-[#f5eff3] space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableTrial"
                    checked={enableTrial}
                    onChange={(e) => setEnableTrial(e.target.checked)}
                    className="w-4 h-4 rounded text-[#714b67] focus:ring-[#714b67]"
                  />
                  <label htmlFor="enableTrial" className="font-bold text-[#252733] cursor-pointer">
                    Activate 7-Day Free Trial of QuoteFlow Enterprise Deal OS
                  </label>
                </div>
                <p className="text-slate-600 text-xs pl-6">
                  Grants customer full access to SaaS licenses, quotation workbench, and priority SLA for 7 days without upfront invoicing.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Portal Access */}
          {wizardStep === 4 && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#252733]">Step 4: Customer Portal Access Provisioning</h4>
              <div className="p-4 rounded-2xl border border-[#e5e7eb] bg-[#f3f4f6] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendPortalInvite"
                    checked={sendPortalInvite}
                    onChange={(e) => setSendPortalInvite(e.target.checked)}
                    className="w-4 h-4 rounded text-[#714b67] focus:ring-[#714b67]"
                  />
                  <label htmlFor="sendPortalInvite" className="font-bold text-[#252733] cursor-pointer">
                    Send secure magic login link to {lead.email}
                  </label>
                </div>
                <p className="text-slate-500 text-xs pl-6">
                  Customer will be able to browse catalogs, review quotations, submit counter-offers, and track order fulfillment. (Strictly isolated from internal margins and risk scores).
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Confirmation */}
          {wizardStep === 5 && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#252733]">Step 5: Review & Convert</h4>
              <div className="p-4 rounded-2xl border border-[#e5e7eb] bg-[#f3f4f6] space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-[#252733]">{lead.companyName}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Tier / Terms:</span>
                  <span>{tier} / {paymentTerms}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Credit Limit:</span>
                  <span className="text-emerald-600 font-bold">{formatCurrency(creditLimit, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">7-Day Trial:</span>
                  <span className="text-[#714b67] font-semibold">{enableTrial ? 'Enabled (7 Days)' : 'None'}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Portal Access:</span>
                  <span>{sendPortalInvite ? 'Enabled (Magic Link Sent)' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {wizardStep > 1 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setWizardStep((s) => s - 1)}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {wizardStep < 5 ? (
              <Button
                size="sm"
                onClick={() => setWizardStep((s) => s + 1)}
                className="gap-1.5"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleConvertSubmit}
                isLoading={convertMutation.isPending}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Conversion
              </Button>
            )}
          </div>
        </div>
      </Dialog>

      {/* Log Activity / Interaction Modal */}
      <Dialog
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Log Sales Activity & Interaction</span>
          </div>
        }
        description="Record phone calls, product demos, commercial emails, and next follow-up dates."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!interactionSubject.trim() || !interactionNotes.trim()) {
              toast.error('Please enter subject and interaction notes');
              return;
            }
            interactionMutation.mutate();
          }}
          className="space-y-4 pt-2 font-sans text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Interaction Type</label>
              <select
                value={interactionType}
                onChange={(e: any) => setInteractionType(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="CALL">Discovery Phone Call</option>
                <option value="MEETING">Product Demo / Meeting</option>
                <option value="EMAIL">Commercial Email / Proposal</option>
                <option value="NOTE">Internal Account Note</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Outcome</label>
              <Input
                value={interactionOutcome}
                onChange={(e) => setInteractionOutcome(e.target.value)}
                placeholder="e.g. Budget Confirmed, Follow-up Required"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">
              Subject / Topic <span className="text-rose-500">*</span>
            </label>
            <Input
              value={interactionSubject}
              onChange={(e) => setInteractionSubject(e.target.value)}
              placeholder="e.g. Discussed 50-node server cluster requirements"
              required
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">
              Detailed Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={interactionNotes}
              onChange={(e) => setInteractionNotes(e.target.value)}
              placeholder="Key discussion points, customer objections, next milestones..."
              className="w-full h-24 rounded-xl border border-[#e5e7eb] bg-white p-3 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]/20"
              required
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Next Follow-up Target Date</label>
            <Input
              type="datetime-local"
              value={interactionFollowup}
              onChange={(e) => setInteractionFollowup(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsInteractionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={interactionMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              Save Activity Entry
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Lead Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <Edit className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Edit Enterprise Lead Profile</span>
          </div>
        }
        description="Update commercial parameters, budget in ₹ INR, and contact coordinates."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editMutation.mutate();
          }}
          className="space-y-4 pt-2 font-sans text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">First Name</label>
              <Input
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Last Name</label>
              <Input
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Company Name</label>
              <Input
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Work Email</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Contact Phone</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Estimated Budget (₹ INR)</label>
              <Input
                type="number"
                value={editBudget}
                onChange={(e) => setEditBudget(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Priority</label>
              <select
                value={editPriority}
                onChange={(e: any) => setEditPriority(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Commercial & Technical Requirements</label>
            <textarea
              value={editRequirements}
              onChange={(e) => setEditRequirements(e.target.value)}
              className="w-full h-24 rounded-xl border border-[#e5e7eb] bg-white p-3 text-xs text-[#252733] focus:outline-none focus:ring-2 focus:ring-[#714b67]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={editMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Lead Modal */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="sm"
        title="Delete Lead Record"
        description={`Are you sure you want to delete ${lead.companyName}? This action cannot be undone.`}
      >
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete Lead
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
