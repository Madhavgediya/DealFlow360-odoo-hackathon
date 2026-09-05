import * as React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { ShieldCheck, Plus, Edit2, Shield, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, Role } from '../../services/api/roles.api';
import { permissionsApi } from '../../services/api/permissions.api';

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
  // This maintains selected permission IDs (frontend only representation for now)
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  // Fetch Roles
  const { data: rolesResponse, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
  });
  const roleList = rolesResponse?.data || [];

  // Fetch Permissions
  const { data: permissionsResponse } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getPermissions,
  });
  const systemPermissions = permissionsResponse?.data || [];

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await rolesApi.createRole(data);
      if (res.success && res.data?.id && selectedPermissions.length > 0) {
        await rolesApi.updateRolePermissions(res.data.id, selectedPermissions);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddModalOpen(false);
      toast.success('Role created successfully!');
    },
    onError: (error: any) => toast.error(error.message)
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: string, payload: any }) => {
      const res = await rolesApi.updateRole(data.id, data.payload);
      if (res.success) {
        await rolesApi.updateRolePermissions(data.id, selectedPermissions);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsEditModalOpen(false);
      toast.success('Role updated successfully!');
    },
    onError: (error: any) => toast.error(error.message)
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully!');
    },
    onError: (error: any) => toast.error(error.message)
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
    setSelectedPermissions([]); // reset temporarily
    setIsEditModalOpen(true);
    
    // Fetch actual role permissions from DB
    const res = await rolesApi.getRolePermissions(role.id);
    if (res.success && res.data) {
      setSelectedPermissions(res.data.map((p: any) => p.id));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Role name is required');
    createRoleMutation.mutate({ name, code: code || name.toUpperCase().replace(/\s+/g, '_'), description });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    updateRoleMutation.mutate({
      id: selectedRole.id,
      payload: { name, description }
    });
  };

  const handleDelete = (role: Role) => {
    if (role.is_system_role || (role as any).is_system) {
      return toast.error('Cannot delete system roles');
    }
    if (window.confirm(`Are you sure you want to delete ${role.name}?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const filteredRoles = roleList.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPermissionsGrid = () => (
    <div className="mt-4 p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-3 h-48 overflow-y-auto">
      <h4 className="font-bold text-slate-700 text-xs sticky top-0 bg-slate-50 py-1">Assigned Permissions (UX Only)</h4>
      {systemPermissions.map(p => (
        <label key={p.id} className="flex items-start gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="mt-0.5 rounded border-slate-300 text-[#714b67] focus:ring-[#714b67]"
            checked={selectedPermissions.includes(p.id)}
            onChange={() => togglePermission(p.id)}
          />
          <div>
            <div className="font-semibold text-slate-700 uppercase">{p.module}:{p.action}</div>
            <div className="text-[10px] text-slate-500">{p.description}</div>
          </div>
        </label>
      ))}
      {systemPermissions.length === 0 && (
        <div className="text-slate-500 text-center py-4">No permissions available in backend.</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Roles & Permissions' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#714b67]" />
              Roles & Permissions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage enterprise roles and granular module permissions.
            </p>
          </div>

          <Button onClick={handleOpenAddModal} className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm">
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="w-full sm:w-80">
          <Input type="text" placeholder="Search roles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white border-slate-200 text-xs" />
        </div>
      </div>

      <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Role Name</th>
                <th className="py-3 px-4">Code / Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoadingRoles && <tr><td colSpan={4} className="py-8 text-center text-slate-400">Loading roles...</td></tr>}
              {!isLoadingRoles && filteredRoles.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-400">No roles found.</td></tr>}
              {!isLoadingRoles && filteredRoles.map((r) => {
                const isSystem = r.is_system_role || (r as any).is_system;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center shrink-0">
                          {isSystem ? <Shield className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                        </div>
                        <span className="font-bold text-[#252733]">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-700">
                        {/* @ts-ignore */}
                        {r.code || 'CUSTOM'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{r.description || 'No description provided'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleOpenEditModal(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit Role">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!isSystem && (
                          <button onClick={() => handleDelete(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete Role">
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
      <Dialog isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="lg" title={<div className="font-display font-bold text-[#252733] flex items-center gap-2"><Plus className="w-5 h-5 text-[#714b67]" /> Create Custom Role</div>}>
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Name <span className="text-rose-500">*</span></label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Regional Manager" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Code <span className="text-rose-500">*</span></label>
              <Input required value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. REGIONAL_MANAGER" className="uppercase" />
            </div>
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          {renderPermissionsGrid()}
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#714b67] text-white" disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? 'Saving...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="lg" title={<div className="font-display font-bold text-[#252733] flex items-center gap-2"><Edit2 className="w-5 h-5 text-blue-600" /> Edit Role</div>}>
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Name <span className="text-rose-500">*</span></label>
              <Input required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Code (System Identifier)</label>
              <Input disabled value={code} className="bg-slate-50 cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          {renderPermissionsGrid()}
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-blue-600 text-white" disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
