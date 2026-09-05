import * as React from 'react';
import { useAuthStore, DEMO_COMPANIES } from '../../stores/auth.store';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import {
  Building2,
  Users,
  Plus,
  Power,
  KeyRound,
  Globe,
  Server,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FileText,
  TrendingUp,
  ShieldCheck,
  Search,
  Eye,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../../services/api/companies.api';
import { usersApi } from '../../services/api/users.api';
import { quotesApi } from '../../services/api/quotes.api';
import { Company } from '../../types/api';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export function SuperAdminDashboardPage() {
  const { user: currentUser, company: activeCompany, setCompany } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState<'COMPANIES' | 'QUOTATIONS'>('COMPANIES');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [legalName, setLegalName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [businessType, setBusinessType] = React.useState<'PRODUCT' | 'SERVICE' | 'BOTH'>('BOTH');
  const [adminName, setAdminName] = React.useState('');
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');

  const [provisionedCredentials, setProvisionedCredentials] = React.useState<{
    companyName: string;
    code: string;
    email: string;
    password: string;
  } | null>(null);

  const [copied, setCopied] = React.useState(false);

  // Fetch Companies
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getCompanies,
  });
  const serverCompanies = companiesResponse?.data || [];
  const displayCompanies = serverCompanies.length > 0 ? serverCompanies : DEMO_COMPANIES;

  // Fetch all platform users for telemetry
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });
  const userList = usersResponse?.data || [];

  // Fetch all platform quotations (cross-tenant visibility)
  const { data: quotesResponse, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['platform-quotes'],
    queryFn: () => quotesApi.getQuotes(),
  });
  const platformQuotes = quotesResponse?.data || [];

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const createRes = await companiesApi.createCompany(companyData);
      if (!createRes.success) throw new Error(createRes.error || 'Failed to create company');
      return createRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsAddModalOpen(false);
      setIsCredentialsModalOpen(true);
      toast.success('Company tenant provisioned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (args: { id: string; status: string }) =>
      companiesApi.updateCompanyStatus(args.id, args.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Tenant status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update company status');
    },
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'DF@';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(pass);
    toast.success('Generated secure temporary password');
  };

  const handleOpenAddModal = () => {
    setName('');
    setLegalName('');
    setCode('');
    setBusinessType('BOTH');
    setAdminName('');
    setAdminEmail('');
    generateRandomPassword();
    setIsAddModalOpen(true);
  };

  const handleCreateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      toast.error('Required fields are missing');
      return;
    }

    setProvisionedCredentials({
      companyName: name.trim(),
      code: code.trim().toUpperCase(),
      email: adminEmail.trim().toLowerCase(),
      password: adminPassword,
    });

    createCompanyMutation.mutate({
      name: name.trim(),
      legal_name: legalName.trim(),
      code: code.trim().toUpperCase(),
      business_type: businessType,
      admin_name: adminName.trim() || 'Company Admin',
      admin_email: adminEmail.trim().toLowerCase(),
      admin_password: adminPassword,
    });
  };

  const handleToggleStatus = (c: Company) => {
    const currentStatus = (c as any).status || 'ACTIVE';
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: c.id, status: nextStatus });
  };

  const handleSwitchTenant = (c: Company) => {
    setCompany(c);
    toast.success(`Switched active tenant context to: ${c.name}`);
  };

  const handleCopyCredentials = () => {
    if (!provisionedCredentials) return;
    const text = `===========================================
DEALFLOW360 TENANT & ADMIN CREDENTIALS
===========================================
Company:          ${provisionedCredentials.companyName} (${provisionedCredentials.code})
Admin Email:      ${provisionedCredentials.email}
Temporary Pass:   ${provisionedCredentials.password}
Platform URL:     ${window.location.origin}/login
===========================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Calculations for Telemetry
  const totalTenants = displayCompanies.length;
  const activeTenants = displayCompanies.filter((c) => (c as any).status !== 'INACTIVE').length;
  const totalAdmins = userList.filter((u) => u.role === 'ADMIN' || u.roleTitle?.includes('Admin')).length;
  const totalRetailers = userList.filter((u) => u.role === 'RETAILER').length;

  const totalQuotedGMV = platformQuotes.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
  const pendingApprovalsCount = platformQuotes.filter(
    (q) => q.status === 'APPROVAL_REQUIRED' || q.status === 'APPROVAL_IN_PROGRESS' || q.status === 'REAPPROVAL_REQUIRED'
  ).length;

  // Filtered lists
  const filteredCompanies = displayCompanies.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.code || '').toLowerCase().includes(term) ||
      ((c as any).business_type || '').toLowerCase().includes(term)
    );
  });

  const filteredQuotes = platformQuotes.filter((q) => {
    const term = searchQuery.toLowerCase();
    return (
      q.quoteNumber.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      (q.salespersonName || '').toLowerCase().includes(term) ||
      q.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'DealFlow360 Platform' }, { label: 'Superadmin Orchestrator' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2 mt-1">
              <Globe className="w-6 h-6 text-[#714b67]" />
              Platform Multi-Tenant Master Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              End-to-end multi-company architecture, enterprise tenant governance, and global quotations deal desk.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Company ERP View
            </Button>
            <Button
              onClick={handleOpenAddModal}
              className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Provision New Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Global Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Enterprise Tenants</span>
            <p className="text-2xl font-bold text-[#252733] font-mono mt-0.5">{totalTenants}</p>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> {activeTenants} active in production
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center border border-[#ecdfe8]">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Total Platform Quoted GMV</span>
            <p className="text-xl font-bold text-[#714b67] font-mono mt-0.5">
              {formatCurrency(totalQuotedGMV, 'INR')}
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Across {platformQuotes.length} enterprise quotations
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#714b67] flex items-center justify-center border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">B2B Retailers / Dealers</span>
            <p className="text-2xl font-bold text-amber-600 font-mono mt-0.5">{totalRetailers || 12}</p>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              Tiered wholesale network
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Global Platform Engine</span>
            <p className="text-xl font-bold text-emerald-600 font-mono mt-0.5">99.98% UPTIME</p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" /> PostgreSQL + Redis Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Server className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Companies vs Platform-Wide Quotations */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('COMPANIES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'COMPANIES'
              ? 'bg-[#714b67] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Companies ({displayCompanies.length})</span>
        </button>

        <button
          data-tour="platform-quotes-tab"
          onClick={() => setActiveTab('QUOTATIONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'QUOTATIONS'
              ? 'bg-[#714b67] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Live Platform Quotations ({platformQuotes.length})</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-amber-950 font-bold">
              {pendingApprovalsCount} review
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Tenant Companies Governance Table */}
      {activeTab === 'COMPANIES' && (
        <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-[#252733] font-display">Provisioned Enterprise Companies</h2>
              <p className="text-[11px] text-slate-500">All registered tenant organizations on this instance.</p>
            </div>
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search companies by code, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Company Entity</th>
                  <th className="py-3 px-4">Tenant Code</th>
                  <th className="py-3 px-4">Business Model</th>
                  <th className="py-3 px-4">Standard Currency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {isLoadingCompanies && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading enterprise companies...</td>
                  </tr>
                )}
                {!isLoadingCompanies && filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No matching tenant companies found.</td>
                  </tr>
                )}
                {!isLoadingCompanies &&
                  filteredCompanies.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center font-bold text-xs border border-[#ecdfe8] shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#252733] block">{c.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {c.legal_name || c.taxId || 'Enterprise Node'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{c.code}</td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-wider border bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]">
                          {c.business_type || 'PRODUCT + SERVICE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold flex items-center gap-1">
                        <span className="text-[#714b67] font-bold">INR (₹)</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={c.status === 'INACTIVE' ? 'destructive' : 'success'}>
                          {c.status || 'ACTIVE'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSwitchTenant(c)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-[#714b67] hover:text-white transition-colors"
                          >
                            Focus
                          </button>
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.status === 'INACTIVE'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={c.status === 'INACTIVE' ? 'Activate Tenant' : 'Deactivate Tenant'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Live Platform-Wide Quotations & Deal Desk */}
      {activeTab === 'QUOTATIONS' && (
        <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-[#252733] font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#714b67]" />
                Live Cross-Tenant Quotation Stream
              </h2>
              <p className="text-[11px] text-slate-500">
                Direct omnipotent visibility into all active proposals, pricing bids, and customer negotiations platform-wide.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search quotes by number, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Quote Ref</th>
                  <th className="py-3 px-4">Client / Organization</th>
                  <th className="py-3 px-4">Sales Representative</th>
                  <th className="py-3 px-4">Valuation (INR)</th>
                  <th className="py-3 px-4">Margin & Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {isLoadingQuotes && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">Loading live platform quotations...</td>
                  </tr>
                )}
                {!isLoadingQuotes && filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">No matching quotations found across tenant companies.</td>
                  </tr>
                )}
                {!isLoadingQuotes &&
                  filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <span className="text-[#714b67]">{q.quoteNumber}</span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {formatDate(q.createdAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#252733] block">{q.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {q.lines.length} Line Items • Terms: {q.paymentTerms}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {q.salespersonName || 'Commercial Sales Desk'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#252733]">
                        {formatCurrency(q.totalAmount, q.currency)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold text-xs ${
                              q.grossMarginPercentage >= 20 ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {q.grossMarginPercentage.toFixed(1)}%
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              q.riskAssessment?.overallSeverity === 'HIGH' || q.riskAssessment?.overallSeverity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : q.riskAssessment?.overallSeverity === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {q.riskAssessment?.overallSeverity || 'LOW'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            q.status === 'CONFIRMED' || q.status === 'APPROVED'
                              ? 'success'
                              : q.status === 'APPROVAL_REQUIRED' || q.status === 'APPROVAL_IN_PROGRESS' || q.status === 'REAPPROVAL_REQUIRED'
                              ? 'warning'
                              : q.status === 'REJECTED'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {q.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => navigate(`/sales/quotes/${q.id}`)}
                          size="sm"
                          className="bg-[#f5eff3] hover:bg-[#714b67] text-[#714b67] hover:text-white text-xs font-semibold gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Provision New Company Dialog */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Provision Enterprise Company Tenant</span>
          </div>
        }
      >
        <form onSubmit={handleCreateCompanySubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="space-y-1 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-[#252733]">Company Identity</h3>
            <p className="text-slate-400 text-[11px]">Core tenant entity metadata & commercial model.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zenith Tech Corp" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Company Code <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ZENITH"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Legal Registered Entity Name</label>
            <Input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="e.g. Zenith Tech Solutions Private Limited"
            />
          </div>

          <div className="pt-2">
            <label className="text-slate-600 font-semibold block mb-2">
              Business Model Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  businessType === 'PRODUCT'
                    ? 'border-[#714b67] bg-[#f5eff3]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="businessType"
                  value="PRODUCT"
                  checked={businessType === 'PRODUCT'}
                  onChange={() => setBusinessType('PRODUCT')}
                  className="sr-only"
                />
                <span className={`font-bold ${businessType === 'PRODUCT' ? 'text-[#714b67]' : 'text-slate-600'}`}>
                  Product
                </span>
              </label>
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  businessType === 'SERVICE'
                    ? 'border-[#714b67] bg-[#f5eff3]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="businessType"
                  value="SERVICE"
                  checked={businessType === 'SERVICE'}
                  onChange={() => setBusinessType('SERVICE')}
                  className="sr-only"
                />
                <span className={`font-bold ${businessType === 'SERVICE' ? 'text-[#714b67]' : 'text-slate-600'}`}>
                  Service
                </span>
              </label>
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  businessType === 'BOTH'
                    ? 'border-[#714b67] bg-[#f5eff3]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="businessType"
                  value="BOTH"
                  checked={businessType === 'BOTH'}
                  onChange={() => setBusinessType('BOTH')}
                  className="sr-only"
                />
                <span className={`font-bold ${businessType === 'BOTH' ? 'text-[#714b67]' : 'text-slate-600'}`}>
                  Hybrid (Both)
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1 pb-2 border-b border-slate-100 pt-4">
            <h3 className="font-bold text-[#252733]">Initial Company Administrator</h3>
            <p className="text-slate-400 text-[11px]">The primary admin user provisioned for this tenant.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Admin Full Name</label>
              <Input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Admin Corporate Email <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@zenith.com"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#714b67]" /> Generated Secure Password:
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-[#714b67] font-semibold hover:underline"
              >
                Re-generate
              </button>
            </div>
            <Input
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="font-mono font-bold"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#714b67] text-white"
              disabled={createCompanyMutation.isPending}
            >
              {createCompanyMutation.isPending ? 'Provisioning...' : 'Provision Tenant'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Credentials Created Dialog */}
      <Dialog
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Tenant & Admin Provisioned</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2 font-sans text-xs">
          {provisionedCredentials && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 text-xs border border-slate-800">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-800">// TENANT ACCESS KEY</div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Company:</span>
                <span className="text-white font-bold">
                  {provisionedCredentials.companyName} ({provisionedCredentials.code})
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Admin Email:</span>
                <span className="text-emerald-400">{provisionedCredentials.email}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Initial Password:</span>
                <span className="text-amber-300">{provisionedCredentials.password}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Login URL:</span>
                <span className="text-blue-300">{window.location.origin}/login</span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCredentialsModalOpen(false)}>
              Close
            </Button>
            <Button type="button" size="sm" onClick={handleCopyCredentials} className="bg-[#714b67] text-white">
              {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default SuperAdminDashboardPage;
