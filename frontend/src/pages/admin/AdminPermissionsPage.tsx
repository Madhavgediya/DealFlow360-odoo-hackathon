import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApi, PermissionObj } from '../../services/api/permissions.api';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  ShieldAlert,
  Plus,
  Key,
  Edit2,
  Trash2,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminPermissionsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPermission, setEditingPermission] = React.useState<PermissionObj | null>(null);

  // Form states
  const [moduleName, setModuleName] = React.useState('');
  const [actionName, setActionName] = React.useState('');
  const [resource, setResource] = React.useState('*');
  const [description, setDescription] = React.useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getPermissions,
  });

  const permissionsList = response?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: Omit<PermissionObj, 'id'>) => permissionsApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setIsModalOpen(false);
      toast.success('Permission created successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to create permission')
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, updates: Partial<PermissionObj> }) => permissionsApi.updatePermission(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setIsModalOpen(false);
      toast.success('Permission updated successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update permission')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => permissionsApi.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission deleted successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to delete permission')
  });

  const handleOpenModal = (permission?: PermissionObj) => {
    if (permission) {
      setEditingPermission(permission);
      setModuleName(permission.module);
      setActionName(permission.action);
      setResource(permission.resource);
      setDescription(permission.description || '');
    } else {
      setEditingPermission(null);
      setModuleName('');
      setActionName('');
      setResource('*');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleName || !actionName || !resource) {
      toast.error('Module, Action, and Resource are required');
      return;
    }

    const payload = {
      module: moduleName.toLowerCase().trim(),
      action: actionName.toLowerCase().trim(),
      resource: resource.trim(),
      description: description.trim(),
    };

    if (editingPermission) {
      updateMutation.mutate({ id: editingPermission.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this permission? This may break role configurations that depend on it.')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredPermissions = permissionsList.filter(p => 
    p.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Permissions Registry' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
              <Key className="w-6 h-6 text-[#714b67]" />
              Permissions Registry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage the low-level RBAC logical keys (module:action) enforced by the backend API.
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Permission
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>
        <div className="text-slate-500 font-medium">
          Total system permissions: {permissionsList.length}
        </div>
      </div>

      <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Logical Key</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading permissions...</td>
                </tr>
              )}
              {!isLoading && filteredPermissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No permissions found.</td>
                </tr>
              )}
              {!isLoading && filteredPermissions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {p.module}:{p.action}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="secondary" className="font-mono text-[10px] tracking-wide bg-slate-100 border-slate-200 text-slate-600">
                      <Server className="w-3 h-3 inline mr-1" />
                      {p.module.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#714b67]">
                    {p.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 truncate max-w-[300px]">
                    {p.description || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#714b67] hover:bg-[#f5eff3] transition-colors"
                        title="Edit Permission"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Permission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">
              {editingPermission ? 'Edit Permission' : 'Create Permission'}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Module <span className="text-rose-500">*</span></label>
              <Input required value={moduleName} onChange={e => setModuleName(e.target.value)} placeholder="e.g. leads, users" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Action <span className="text-rose-500">*</span></label>
              <Input required value={actionName} onChange={e => setActionName(e.target.value)} placeholder="e.g. read, create" />
            </div>
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Resource Context <span className="text-rose-500">*</span></label>
            <Input required value={resource} onChange={e => setResource(e.target.value)} placeholder="*" />
            <p className="text-[10px] text-slate-400 mt-1">Usually "*" to apply module-wide, or a specific ID.</p>
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this authorize?" />
          </div>

          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/50 flex items-start gap-2 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              This will create the logical key <strong>{moduleName || 'module'}:{actionName || 'action'}</strong>. 
              Ensure this exactly matches the middleware `requirePermission()` expectations in the backend.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#714b67] text-white" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Permission'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
