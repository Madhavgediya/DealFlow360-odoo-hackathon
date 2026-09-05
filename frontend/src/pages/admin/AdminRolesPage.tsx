import * as React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Shield,
  Settings2,
  Trash2,
  CheckSquare,
  Square,
  Users,
  Briefcase,
  MessageSquare,
  Store,
  CreditCard,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, Role } from '../../services/api/roles.api';
import { permissionsApi, PermissionObj } from '../../services/api/permissions.api';

// Categorized display groups for Permissions Matrix
const PERM_CATEGORIES: { name: string; icon: any; modules: string[] }[] = [
  { name: 'CRM & Lead Management', icon: Users, modules: ['crm'] },
  { name: 'Quotations & CPQ Approvals', icon: Briefcase, modules: ['quote'] },
  { name: 'Multi-Round Negotiations', icon: MessageSquare, modules: ['negotiation'] },
  { name: 'B2B Retailers & Dealers', icon: Store, modules: ['retailer'] },
  { name: 'Warehouse & Inventory', icon: Layers, modules: ['inventory'] },
  { name: 'Billing, Invoicing & Payments', icon: DollarSign, modules: ['billing'] },
  { name: 'Analytics, Risk Radar & AI Copilot', icon: Activity, modules: ['analytics', 'ai'] },
  { name: 'Company Administration', icon: Shield, modules: ['admin', 'users', 'roles'] },
];

export function AdminRolesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  // Form State
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  // Fetch Roles
  const { data: rolesResponse, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
  });
  const roleList = rolesResponse?.data || [];

  // Fetch Permissions
  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getPermissions,
  });
  const systemPermissions: PermissionObj[] = permissionsResponse?.data || [];

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await rolesApi.createRole(data);
      if (!res.success) throw new Error(res.error || 'Failed to create role');
      if (res.data?.id && selectedPermissions.length > 0) {
        await rolesApi.updateRolePermissions(res.data.id, selectedPermissions);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddModalOpen(false);
      toast.success('Custom role & permissions created successfully!');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to create role'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: string; payload: any }) => {
      const res = await rolesApi.updateRole(data.id, data.payload);
      if (!res.success) throw new Error(res.error || 'Failed to update role');
      await rolesApi.updateRolePermissions(data.id, selectedPermissions);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsEditModalOpen(false);
      toast.success('Role & assigned permissions updated successfully!');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update role'),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await rolesApi.deleteRole(id);
      if (!res.success) throw new Error(res.error || 'Failed to delete role');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully!');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to delete role'),
  });

  const handleOpenAddModal = () => {
    setName('');
    setCode('');
    setDescription('');
    setSelectedPermissions([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = async (role: Role) => {
    setSelectedRole(role);
    setName(role.name);
    // @ts-ignore
    setCode(role.code || '');
    setDescription(role.description || '');
    setSelectedPermissions([]);
    setIsEditModalOpen(true);

    try {
      const res = await rolesApi.getRolePermissions(role.id);
      if (res.success && res.data) {
        setSelectedPermissions(res.data.map((p: any) => p.id));
      }
    } catch (err) {
      console.error('Failed to fetch role permissions:', err);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Role name is required');
    const generatedCode = (code.trim() || name.trim()).toUpperCase().replace(/[^A-Z0-9]/g, '_');
    createRoleMutation.mutate({
      name: name.trim(),
      code: generatedCode,
      description: description.trim(),
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    updateRoleMutation.mutate({
      id: selectedRole.id,
      payload: { name: name.trim(), description: description.trim() },
    });
  };

  const handleDelete = (role: Role) => {
    if (role.is_system_role || (role as any).is_system) {
      return toast.error('Cannot delete system default roles');
    }
    if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(systemPermissions.map((p) => p.id));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const toggleCategoryPermissions = (modules: string[]) => {
    const categoryPermIds = systemPermissions
      .filter((p) => modules.includes(p.module))
      .map((p) => p.id);
    const allSelected = categoryPermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !categoryPermIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...categoryPermIds])));
    }
  };

  const filteredRoles = roleList.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPermissionsGrid = () => (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h4 className="font-bold text-[#252733] text-xs">Configure Role Granular Permissions</h4>
          <p className="text-[11px] text-slate-500">
            Select modules and granular authority assigned to users holding this role.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAllPermissions}
            className="text-[11px] font-semibold text-[#714b67] hover:underline flex items-center gap-1"
          >
            <CheckSquare className="w-3 h-3" /> Select All ({systemPermissions.length})
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={clearAllPermissions}
            className="text-[11px] font-semibold text-slate-500 hover:underline flex items-center gap-1"
          >
            <Square className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      <div className="p-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-4 max-h-72 overflow-y-auto pr-1">
        {PERM_CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const catPerms = systemPermissions.filter((p) => cat.modules.includes(p.module));
          if (catPerms.length === 0) return null;

          const allCatSelected = catPerms.every((p) => selectedPermissions.includes(p.id));
          const someCatSelected = catPerms.some((p) => selectedPermissions.includes(p.id));

          return (
            <div key={cat.name} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[#f5eff3] text-[#714b67]">
                    <CatIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[#252733] text-xs">{cat.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCategoryPermissions(cat.modules)}
                  className="text-[10px] font-semibold text-[#714b67] hover:underline"
                >
                  {allCatSelected ? 'Deselect Category' : 'Select Category'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {catPerms.map((p) => {
                  const isChecked = selectedPermissions.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition-all text-xs ${
                        isChecked
                          ? 'bg-[#f5eff3] border-[#ecdfe8] text-[#714b67]'
                          : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-slate-300 text-[#714b67] focus:ring-[#714b67] accent-[#714b67]"
                        checked={isChecked}
                        onChange={() => togglePermission(p.id)}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[11px] leading-tight flex items-center gap-1">
                          <span className="font-mono text-[10px] uppercase opacity-75">{p.action}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                          {p.description || `${p.module}:${p.action}`}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {systemPermissions.length === 0 && !isLoadingPermissions && (
          <div className="text-slate-500 text-center py-6 text-xs">No system permissions found in database.</div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
        <span>Assigned permissions:</span>
        <span className="font-bold text-[#714b67]">{selectedPermissions.length} selected</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Roles & Permissions' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#714b67]" />
              Roles & Permissions Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create enterprise custom roles, configure granular permissions, and govern access across all deal-desk operations.
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Custom Role
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Available Roles</span>
            <p className="text-2xl font-bold text-[#252733] font-mono mt-0.5">{roleList.length}</p>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
              System & custom roles
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">System Permissions Matrix</span>
            <p className="text-2xl font-bold text-[#714b67] font-mono mt-0.5">{systemPermissions.length} ACTIONS</p>
            <span className="text-[11px] text-[#714b67] font-medium mt-0.5 block">
              CRM, CPQ, Deal Desk & Billing
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Custom Roles Created</span>
            <p className="text-2xl font-bold text-amber-600 font-mono mt-0.5">
              {roleList.filter((r) => !r.is_system_role && !(r as any).is_system).length}
            </p>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
              Company defined roles
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Settings2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search roles by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Roles Table */}
      <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Role Name & Identity</th>
                <th className="py-3 px-4">Code / Type</th>
                <th className="py-3 px-4">Role Description</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoadingRoles && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading enterprise roles...
                  </td>
                </tr>
              )}
              {!isLoadingRoles && filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No roles found matching "{searchQuery}".
                  </td>
                </tr>
              )}
              {!isLoadingRoles &&
                filteredRoles.map((r) => {
                  const isSystem = r.is_system_role || (r as any).is_system;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSystem
                                ? 'bg-[#f5eff3] text-[#714b67]'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isSystem ? <Shield className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-[#252733] block">{r.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {r.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-700 font-mono">
                          {/* @ts-ignore */}
                          {r.code || 'CUSTOM'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                        <span className="line-clamp-2">{r.description || 'Enterprise role'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={
                            isSystem
                              ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }
                        >
                          {isSystem ? 'System Standard' : 'Custom Defined'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Configure Permissions"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isSystem && (
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          <div className="font-display font-bold text-[#252733] flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67]">
              <Plus className="w-4 h-4" />
            </div>
            Create Enterprise Custom Role & Assign Permissions
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senior Deal Desk Officer"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Role Code / System Tag <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DEAL_DESK_OFFICER"
                className="uppercase font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Description & Scope</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Responsible for approving volume quotes, negotiating margins, and discount thresholds."
            />
          </div>

          {renderPermissionsGrid()}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#714b67] text-white"
              disabled={createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Saving Role...' : 'Create Role & Assign Permissions'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="font-display font-bold text-[#252733] flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <Edit2 className="w-4 h-4" />
            </div>
            Configure Role & Assigned Permissions
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Code (System Identifier)</label>
              <Input disabled value={code} className="bg-slate-50 cursor-not-allowed font-mono" />
            </div>
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Description & Scope</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {renderPermissionsGrid()}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#714b67] text-white"
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Saving Changes...' : 'Save Role & Permissions'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default AdminRolesPage;
