import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../../services/api/leads.api';
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
} from 'lucide-react';
import { LeadConversionPayload } from '../../types/crm';
import { cn } from '../../utils/formatting';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency } = useAuthStore();

  const [isConvertWizardOpen, setIsConvertWizardOpen] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState(1);

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
      navigate(`/customers/${res.data.customer.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to convert lead');
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {lead.companyName}
            </h1>
            <Badge variant="indigo" size="md">
              Score: {lead.score}/100
            </Badge>
            <Badge
              variant={
                lead.stage === 'CONVERTED'
                  ? 'success'
                  : lead.stage === 'QUALIFIED'
                  ? 'indigo'
                  : 'warning'
              }
              size="md"
            >
              Stage: {lead.stage}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lead.stage !== 'CONVERTED' ? (
            <Button
              onClick={() => {
                setWizardStep(1);
                setIsConvertWizardOpen(true);
              }}
              className="gap-2 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              <UserCheck className="w-4 h-4" />
              Convert to Customer & Trial
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/${lead.convertedCustomerId || 'cust-1'}`)}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              View Customer Account
            </Button>
          )}
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lead Profile & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Details Card */}
          <Card className="border-[#e5e7eb] bg-white shadow-subtle rounded-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-[#e5e7eb]">
              <CardTitle className="text-sm font-bold text-[#252733] flex items-center gap-2 font-display">
                <Building className="w-4 h-4 text-[#714b67]" />
                Enterprise Lead Profile
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
                    Employees: <strong className="text-[#252733]">{lead.employeeCount}</strong> • Est. Rev: <strong className="text-[#252733]">{formatCurrency(lead.annualRevenue || 0, currency, { compact: true })}</strong>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400">Estimated Deal Budget</span>
                  <p className="text-base font-bold text-emerald-600">
                    {formatCurrency(lead.budget, currency)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400">Assigned Account Exec</span>
                  <p className="font-bold text-[#252733]">{lead.assignedToName}</p>
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
                Interactions & Qualification Timeline
              </CardTitle>
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
                <strong>AI Assessment:</strong> Lead demonstrates high purchase intent with validated IT infrastructure budget and decision authority verified. Recommended for immediate conversion to 7-Day Enterprise Trial.
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-1 border-b border-[#e5e7eb] text-[11px]">
                  <span className="text-slate-500">Decision Authority</span>
                  <span className="text-emerald-600 font-bold">Verified (CTO)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5e7eb] text-[11px]">
                  <span className="text-slate-500">Budget Adequacy</span>
                  <span className="text-emerald-600 font-bold">₹ 4.5M Allocated</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5e7eb] text-[11px]">
                  <span className="text-slate-500">Timeline Urgency</span>
                  <span className="text-amber-600 font-bold">&lt; 30 Days</span>
                </div>
              </div>

              {lead.stage !== 'CONVERTED' && (
                <Button
                  onClick={() => {
                    setWizardStep(1);
                    setIsConvertWizardOpen(true);
                  }}
                  className="w-full mt-3 gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white"
                  size="sm"
                >
                  Launch conversion wizard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
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
    </div>
  );
}
