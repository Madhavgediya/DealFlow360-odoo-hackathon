import * as React from 'react';
import { useAuthStore, DEMO_USERS } from '../../stores/auth.store';
import { User, UserRole } from '../../types/auth';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../../utils/permissions';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Copy,
  Check,
  Users,
  Shield,
  Briefcase,
  DollarSign,
  Boxes,
  Lock,
  Edit2,
  RefreshCw,
  Power,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();

  // In-memory list of users initialized from DEMO_USERS
  const [userList, setUserList] = React.useState<User[]>(() => {
    return Object.values(DEMO_USERS);
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = React.useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = React.useState<User | null>(null);

  // Add User Form State
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('SALES_REP');
  const [jobTitle, setJobTitle] = React.useState('Senior Account Executive');
  const [department, setDepartment] = React.useState('Sales');
  const [generatedPassword, setGeneratedPassword] = React.useState('DealFlow@2026');

  // Generated Credentials for sharing
  const [provisionedCredentials, setProvisionedCredentials] = React.useState<{
    name: string;
    email: string;
    password: string;
    roleTitle: string;
  } | null>(null);

  const [copied, setCopied] = React.useState(false);

  // Helper to generate secure random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'DF@';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pass);
    toast.success('Generated secure temporary password');
  };

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setRole('SALES_REP');
    setJobTitle(ROLE_LABELS.SALES_REP);
    setDepartment('Sales');
    generateRandomPassword();
    setIsAddModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setJobTitle(ROLE_LABELS[newRole] || 'Specialist');
    if (newRole === 'FINANCE') setDepartment('Finance & Accounts');
    else if (newRole === 'OPERATIONS') setDepartment('Supply Chain & Logistics');
    else if (newRole === 'ADMIN') setDepartment('Executive / IT');
    else setDepartment('Sales & Commercial');
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and corporate email are required');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      jobTitle,
      department,
      location: 'Mumbai, India',
      memberSince: 'Just now',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      role,
      roleTitle: ROLE_LABELS[role] || role,
      companyId: 'comp-1',
      permissions: ROLE_PERMISSIONS[role] || [],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face`,
    };

    setUserList([newUser, ...userList]);
    DEMO_USERS[role] = newUser; // Update in-memory auth store record

    setProvisionedCredentials({
      name: newUser.name,
      email: newUser.email,
      password: generatedPassword,
      roleTitle: newUser.roleTitle,
    });

    setIsAddModalOpen(false);
    setIsCredentialsModalOpen(true);
    toast.success(`User ${newUser.name} created successfully!`);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    setProvisionedCredentials({
      name: selectedUserForReset.name,
      email: selectedUserForReset.email,
      password: generatedPassword,
      roleTitle: selectedUserForReset.roleTitle,
    });

    setIsResetModalOpen(false);
    setIsCredentialsModalOpen(true);
    toast.success(`Password reset for ${selectedUserForReset.name}`);
  };

  const handleToggleStatus = (u: User) => {
    const updated = userList.map((item) => {
      if (item.id === u.id) {
        const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    setUserList(updated);
    toast.success(`User ${u.name} marked as ${u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`);
  };

  const handleCopyCredentials = () => {
    if (!provisionedCredentials) return;
    const text = `===========================================
DEALFLOW360 ENTERPRISE CREDENTIALS
===========================================
Employee Name:    ${provisionedCredentials.name}
Email Address:    ${provisionedCredentials.email}
Initial Password: ${provisionedCredentials.password}
Workspace Role:   ${provisionedCredentials.roleTitle}
Login URL:        ${window.location.origin}/login
===========================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtered list
  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // KPI calculations
  const totalUsers = userList.length;
  const adminCount = userList.filter((u) => u.role === 'ADMIN').length;
  const salesCount = userList.filter((u) => u.role === 'SALES_REP' || u.role === 'SALES_MANAGER').length;
  const financeOpsCount = userList.filter((u) => u.role === 'FINANCE' || u.role === 'OPERATIONS').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Settings', href: '/settings/profile' }, { label: 'User Access & Credentials' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#714b67]" />
              Enterprise User Access & Credentials Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision new corporate employees, generate secure login credentials, and assign role-based permissions.
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee & Generate Credentials
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Total Enterprise Users</span>
            <p className="text-2xl font-bold text-[#252733] font-mono mt-0.5">{totalUsers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">System Administrators</span>
            <p className="text-2xl font-bold text-[#714b67] font-mono mt-0.5">{adminCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Sales & Deal Desk</span>
            <p className="text-2xl font-bold text-blue-600 font-mono mt-0.5">{salesCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Finance & Logistics</span>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">{financeOpsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-subtle'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : ROLE_LABELS[r as UserRole] || r}
            </button>
          ))}
        </div>
      </div>

      {/* User Access Table */}
      <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Corporate Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department / Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                        alt={u.name}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[#252733] block">{u.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {u.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{u.email}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                        u.role === 'ADMIN'
                          ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]'
                          : u.role === 'SALES_MANAGER' || u.role === 'SALES_REP'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : u.role === 'FINANCE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {u.roleTitle}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-[#252733]">{u.jobTitle}</p>
                    <p className="text-[11px] text-slate-400">{u.department || 'Commercial Operations'}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}>
                      {u.status || 'ACTIVE'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedUserForReset(u);
                          generateRandomPassword();
                          setIsResetModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#714b67] hover:bg-[#f5eff3] transition-colors"
                        title="Reset Credentials"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
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

      {/* Modal 1: Add Employee & Generate Credentials */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Provision Enterprise User Credentials</span>
          </div>
        }
        description="Register a new employee into DealFlow360 and generate their initial workspace credentials."
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Full Employee Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Singhania"
                required
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Corporate Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vikram.s@dealflow360.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Assigned Workspace Role</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
              >
                <option value="ADMIN">System Administrator (Master Access)</option>
                <option value="SALES_MANAGER">Sales Director / Manager (Approvals & Rules)</option>
                <option value="SALES_REP">Account Executive / Sales Rep</option>
                <option value="FINANCE">Finance & Billing Director (Invoicing & Ledger)</option>
                <option value="OPERATIONS">Operations & Logistics Lead (Warehouses)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Job Title</label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Account Executive"
              />
            </div>
          </div>

          {/* Generated Temporary Password Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#714b67]" />
                Initial Auto-Generated Password:
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-[#714b67] font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-generate
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={generatedPassword}
                onChange={(e) => setGeneratedPassword(e.target.value)}
                className="bg-white font-mono font-bold text-[#252733]"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Employee will be prompted to verify their credentials on their initial login.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              Create Account & Generate Credentials
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 2: Reset User Credentials */}
      <Dialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        maxWidth="md"
        title="Reset User Password & Credentials"
        description={`Generate a new temporary login password for ${selectedUserForReset?.name} (${selectedUserForReset?.email})`}
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold">New Temporary Password:</label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-[#714b67] font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Generate New
              </button>
            </div>
            <Input
              value={generatedPassword}
              onChange={(e) => setGeneratedPassword(e.target.value)}
              className="bg-white font-mono font-bold text-[#252733]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#714b67] text-white"
            >
              Confirm Password Reset
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 3: Generated Credentials Card with 1-Click Copy */}
      <Dialog
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Credentials Generated Successfully</span>
          </div>
        }
        description="Share these sign-in credentials with the employee to grant workspace access."
      >
        <div className="space-y-4 pt-2 font-sans text-xs">
          {provisionedCredentials && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 text-xs border border-slate-800">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                // DEALFLOW360 ENTERPRISE CREDENTIALS
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Employee Name:</span>
                <span className="font-bold text-white">{provisionedCredentials.name}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-bold text-emerald-400">{provisionedCredentials.email}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Temporary Password:</span>
                <span className="font-bold text-amber-300">{provisionedCredentials.password}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Workspace Role:</span>
                <span className="font-bold text-white">{provisionedCredentials.roleTitle}</span>
              </div>
              <div className="flex justify-between py-0.5 pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Sign-in URL:</span>
                <span className="text-blue-400">{window.location.origin}/login</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCredentialsModalOpen(false)}
              className="text-slate-600"
            >
              Close
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleCopyCredentials}
              className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-sm font-semibold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
