import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Building, Building2, Plus, Power, KeyRound, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../../services/api/companies.api';
import { Company } from '../../types/api';

export function AdminCompaniesPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = React.useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = React.useState(false);

  // Add Company Form State
  const [name, setName] = React.useState('');
  const [legalName, setLegalName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [businessType, setBusinessType] = React.useState('BOTH');
  const [adminName, setAdminName] = React.useState('');
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');

  // Generated Credentials for sharing
  const [provisionedCredentials, setProvisionedCredentials] = React.useState<{
    companyName: string;
    email: string;
    password: string;
  } | null>(null);

  const [copied, setCopied] = React.useState(false);

  // Fetch Companies
  const { data: companiesResponse, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getCompanies,
  });
  const companyList = companiesResponse?.data || [];

  // Mutations
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
      toast.success('Company created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (args: { id: string, status: string }) => companiesApi.updateCompanyStatus(args.id, args.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update company status');
    }
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
      email: adminEmail.trim().toLowerCase(),
      password: adminPassword,
    });

    createCompanyMutation.mutate({
      name: name.trim(),
      legal_name: legalName.trim(),
      code: code.trim().toUpperCase(),
      business_type: businessType,
      admin_name: adminName.trim(),
      admin_email: adminEmail.trim().toLowerCase(),
      admin_password: adminPassword,
    });
  };

  const handleToggleStatus = (c: Company) => {
    const nextStatus = (c as any).status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: c.id, status: nextStatus });
  };

  const handleCopyCredentials = () => {
    if (!provisionedCredentials) return;
    const text = `===========================================
DEALFLOW360 COMPANY CREDENTIALS
===========================================
Company Name:     ${provisionedCredentials.companyName}
Admin Email:      ${provisionedCredentials.email}
Initial Password: ${provisionedCredentials.password}
Login URL:        ${window.location.origin}/login
===========================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredCompanies = companyList.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.code || '').toLowerCase().includes(term) ||
      ((c as any).business_type || '').toLowerCase().includes(term)
    );
  });

  const totalCompanies = companyList.length;
  const activeCompanies = companyList.filter(c => (c as any).status === 'ACTIVE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Platform Management' }, { label: 'Tenant Companies' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
              <Building className="w-6 h-6 text-[#714b67]" />
              Tenant Companies
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage platform tenants and their company details.
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Company
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Total Companies</span>
            <p className="text-2xl font-bold text-[#252733] font-mono mt-0.5">{totalCompanies}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Active Companies</span>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">{activeCompanies}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Companies Table */}
      <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Business Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading companies...</td>
                </tr>
              )}
              {!isLoading && filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No companies found.</td>
                </tr>
              )}
              {!isLoading && filteredCompanies.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 text-[#252733] font-bold">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-[#252733] block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {c.id.split('-')[0]}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{c.code}</td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-wider border bg-[#f5eff3] text-[#714b67]">
                      {c.business_type || 'BOTH'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={c.status === 'ACTIVE' ? 'success' : 'destructive'}>
                      {c.status || 'ACTIVE'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.status === 'ACTIVE'
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={c.status === 'ACTIVE' ? 'Deactivate Company' : 'Activate Company'}
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

      {/* Add Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <Building className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Create New Company</span>
          </div>
        }
      >
        <form onSubmit={handleCreateCompanySubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="space-y-1 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-[#252733]">Company Details</h3>
            <p className="text-slate-400 text-[11px]">Basic information about the new tenant.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Company Name <span className="text-rose-500">*</span></label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Company Code <span className="text-rose-500">*</span></label>
              <Input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. ACME" />
            </div>
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Legal Name</label>
            <Input value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="e.g. Acme Corporation Ltd." />
          </div>

          <div className="pt-2">
            <label className="text-slate-600 font-semibold block mb-2">Business Type <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${businessType === 'PRODUCT' ? 'border-[#714b67] bg-[#f5eff3]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input type="radio" name="businessType" value="PRODUCT" checked={businessType === 'PRODUCT'} onChange={() => setBusinessType('PRODUCT')} className="sr-only" />
                <span className={`font-bold ${businessType === 'PRODUCT' ? 'text-[#714b67]' : 'text-slate-600'}`}>Product</span>
              </label>
              <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${businessType === 'SERVICE' ? 'border-[#714b67] bg-[#f5eff3]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input type="radio" name="businessType" value="SERVICE" checked={businessType === 'SERVICE'} onChange={() => setBusinessType('SERVICE')} className="sr-only" />
                <span className={`font-bold ${businessType === 'SERVICE' ? 'text-[#714b67]' : 'text-slate-600'}`}>Service</span>
              </label>
              <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${businessType === 'BOTH' ? 'border-[#714b67] bg-[#f5eff3]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input type="radio" name="businessType" value="BOTH" checked={businessType === 'BOTH'} onChange={() => setBusinessType('BOTH')} className="sr-only" />
                <span className={`font-bold ${businessType === 'BOTH' ? 'text-[#714b67]' : 'text-slate-600'}`}>Product + Service</span>
              </label>
            </div>
          </div>

          <div className="space-y-1 pb-2 border-b border-slate-100 pt-4">
            <h3 className="font-bold text-[#252733]">Company Admin</h3>
            <p className="text-slate-400 text-[11px]">Primary administrator for this company.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Admin Name</label>
              <Input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Admin Email <span className="text-rose-500">*</span></label>
              <Input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="john@acme.com" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#714b67]" /> Admin Password:
              </label>
              <button type="button" onClick={generateRandomPassword} className="text-[11px] text-[#714b67] font-semibold hover:underline">
                Re-generate
              </button>
            </div>
            <Input value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="font-mono font-bold" required />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#714b67] text-white" disabled={createCompanyMutation.isPending}>
              {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Company & Admin Created</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2 font-sans text-xs">
          {provisionedCredentials && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 text-xs border border-slate-800">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-800">// CREDENTIALS</div>
              <div className="flex justify-between py-0.5"><span className="text-slate-400">Company:</span><span className="text-white">{provisionedCredentials.companyName}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-slate-400">Admin Email:</span><span className="text-emerald-400">{provisionedCredentials.email}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-slate-400">Password:</span><span className="text-amber-300">{provisionedCredentials.password}</span></div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCredentialsModalOpen(false)}>Close</Button>
            <Button type="button" size="sm" onClick={handleCopyCredentials} className="bg-[#714b67] text-white">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
