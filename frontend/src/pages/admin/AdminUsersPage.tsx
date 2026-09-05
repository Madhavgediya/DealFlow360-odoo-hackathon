import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { User, UserRole } from '../../types/auth';
import { ROLE_LABELS } from '../../utils/permissions';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card } from '../../components/ui/card';
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
  Power,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../services/api/users.api';
import { rolesApi, Role } from '../../services/api/roles.api';

export function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

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
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>('');
  const [jobTitle, setJobTitle] = React.useState('');
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

  // Fetch Users
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });
  const userList = usersResponse?.data || [];

  // Fetch Roles for the Dropdown
  const { data: rolesResponse } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
  });
  const systemRoles = rolesResponse?.data || [];

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const createRes = await usersApi.createUser(userData);
      if (!createRes.success) throw new Error(createRes.error || 'Failed to create user');
      const newUser = createRes.data;
      if (selectedRoleId) {
        await usersApi.assignRole(newUser!.id, selectedRoleId);
      }
      return newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddModalOpen(false);
      setIsCredentialsModalOpen(true);
      toast.success('User created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (args: { id: string, status: string }) => usersApi.updateUserStatus(args.id, args.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user status');
    }
  });

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
    setSelectedRoleId(systemRoles.length > 0 ? systemRoles[0].id : '');
    setJobTitle('');
    setDepartment('Sales');
    generateRandomPassword();
    setIsAddModalOpen(true);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and corporate email are required');
      return;
    }

    const assignedRole = systemRoles.find(r => r.id === selectedRoleId);

    setProvisionedCredentials({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: generatedPassword,
      roleTitle: assignedRole?.name || 'User',
    });

    createUserMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: generatedPassword,
      jobTitle: jobTitle || assignedRole?.name,
      department
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;
    toast.error('Password reset not fully implemented in API yet');
  };

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<User | null>(null);

  const editUserMutation = useMutation({
    mutationFn: async (data: { id: string, name: string, roleId: string }) => {
      // We ignore email change for this simple edit
      const updateRes = await usersApi.updateUser(data.id, { name: data.name });
      if (!updateRes.success) throw new Error(updateRes.error || 'Failed to update user');
      
      if (data.roleId) {
        await usersApi.assignRole(data.id, data.roleId);
      }
      return updateRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditModalOpen(false);
      toast.success('User updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleOpenEditModal = (u: User) => {
    setSelectedUserForEdit(u);
    setName(u.name);
    
    // Find role ID from title/name string hack since u doesn't have roleId
    const existingRole = systemRoles.find(r => r.name === u.roleTitle || r.code === u.role);
    setSelectedRoleId(existingRole?.id || '');
    
    setIsEditModalOpen(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    if (!name.trim()) return toast.error('Name is required');
    
    editUserMutation.mutate({
      id: selectedUserForEdit.id,
      name: name.trim(),
      roleId: selectedRoleId
    });
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: u.id, status: nextStatus });
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
    const roleName = u.roleTitle || u.role || 'Unknown';
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Simplistic role filter matching if exact.
    const matchesRole = roleFilter === 'ALL' || roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = userList.length;
  const adminCount = userList.filter(u => u.roleTitle === 'ADMIN' || u.role === 'ADMIN').length;
  const salesCount = userList.filter(u => (u.roleTitle || '').includes('SALES')).length;
  const financeOpsCount = userList.filter(u => (u.roleTitle || '').includes('FINANCE') || (u.roleTitle || '').includes('OPERATIONS')).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'User Access' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
              <Users className="w-6 h-6 text-[#714b67]" />
              Enterprise User Access
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision new corporate employees and assign role-based permissions via live DB.
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
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
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', ...Array.from(new Set(userList.map(u => u.roleTitle || u.role)))].filter(Boolean).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r as string)}
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
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoadingUsers && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading users from database...</td>
                </tr>
              )}
              {!isLoadingUsers && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No users found.</td>
                </tr>
              )}
              {!isLoadingUsers && filteredUsers.map((u) => (
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
                        <span className="text-[11px] text-slate-400 font-mono">ID: {u.id.split('-')[0]}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{u.email}</td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-wider border bg-slate-100 text-slate-700">
                      {u.roleTitle || u.role || 'No Role'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}>
                      {u.status || 'ACTIVE'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit User"
                      >
                        <Briefcase className="w-4 h-4" />
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

      {/* Edit Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Edit User Access</span>
          </div>
        }
      >
        <form onSubmit={handleEditUserSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Full Name <span className="text-rose-500">*</span></label>
            <Input required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Corporate Email (Cannot change)</label>
            <Input disabled value={selectedUserForEdit?.email || ''} className="bg-slate-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Assigned Role</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
            >
              <option value="">No Role Assigned</option>
              {systemRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-blue-600 text-white" disabled={editUserMutation.isPending}>
              {editUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Provision Enterprise User</span>
          </div>
        }
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Full Name <span className="text-rose-500">*</span></label>
              <Input required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Email <span className="text-rose-500">*</span></label>
              <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Assigned Role</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
              >
                {systemRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Job Title</label>
              <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#714b67]" /> Initial Password:
              </label>
              <button type="button" onClick={generateRandomPassword} className="text-[11px] text-[#714b67] font-semibold hover:underline">
                Re-generate
              </button>
            </div>
            <Input value={generatedPassword} onChange={e => setGeneratedPassword(e.target.value)} className="font-mono font-bold" required />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#714b67] text-white" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Saving...' : 'Create Account'}
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
            <span className="font-display font-bold text-[#252733]">Credentials Generated</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2 font-sans text-xs">
          {provisionedCredentials && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 text-xs border border-slate-800">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-800">// CREDENTIALS</div>
              <div className="flex justify-between py-0.5"><span className="text-slate-400">Email:</span><span className="text-emerald-400">{provisionedCredentials.email}</span></div>
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
