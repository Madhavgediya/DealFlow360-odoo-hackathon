import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, CreateWarehousePayload } from '../../services/api/inventory.api';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Boxes, MapPin, ArrowRight, Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { toast } from 'sonner';

export function WarehousesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [state, setState] = React.useState('Maharashtra');
  const [managerName, setManagerName] = React.useState('');
  const [totalCapacityUnits, setTotalCapacityUnits] = React.useState<number>(50000);

  const { data } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryApi.getWarehouses(),
  });

  const warehouses = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: CreateWarehousePayload) => inventoryApi.createWarehouse(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success(res.message || 'Warehouse registered successfully!');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create warehouse');
    },
  });

  const resetForm = () => {
    setName('');
    setLocation('');
    setManagerName('');
    setTotalCapacityUnits(50000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Warehouse name is required');
      return;
    }

    createMutation.mutate({
      name,
      location,
      state,
      managerName,
      totalCapacityUnits,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Inventory & Warehouses' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Warehouse Network & Stock Hubs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 shadow-subtle bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/inventory/stock')}
            className="gap-1.5 border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#252733]"
          >
            <Boxes className="w-4 h-4" />
            All Stock Items
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((wh) => {
          const utilizationPct = wh.totalCapacityUnits > 0
            ? Math.round((wh.utilizedCapacityUnits / wh.totalCapacityUnits) * 100)
            : 0;

          return (
            <Card
              key={wh.id}
              onClick={() => navigate(`/inventory/stock?warehouse=${wh.id}`)}
              className="border-[#e5e7eb] bg-white hover:border-[#714b67]/50 hover:shadow-md cursor-pointer transition-all space-y-3 group shadow-subtle rounded-2xl"
            >
              <CardHeader className="p-4 border-b border-[#e5e7eb] flex flex-row items-center justify-between">
                <div className="p-2 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
                  <Boxes className="w-4 h-4" />
                </div>
                <Badge variant="secondary" size="sm" className="font-mono">{wh.code}</Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-[#252733] group-hover:text-[#714b67] transition-colors font-display">
                    {wh.name}
                  </h3>
                  <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {wh.location}
                  </p>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Capacity Utilization</span>
                    <span className="text-[#252733] font-bold">{utilizationPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#714b67] rounded-full"
                      style={{ width: `${utilizationPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{wh.utilizedCapacityUnits.toLocaleString()} units</span>
                    <span>Max {wh.totalCapacityUnits.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between text-[11px] text-slate-500">
                  <span>Manager: <strong className="text-[#252733]">{wh.managerName}</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Warehouse Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <WarehouseIcon className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Register Regional Warehouse Hub</span>
          </div>
        }
        description="Configure new logistics distribution center, storage capacity, and hub management."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">
              Warehouse Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pune Central Distribution Center"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Location / City</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chakan MIDC, Pune"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">State / Province</label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Hub Manager Name</label>
              <Input
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Vikram Patil"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Total Capacity (Units)</label>
              <Input
                type="number"
                value={totalCapacityUnits}
                onChange={(e) => setTotalCapacityUnits(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              Register Hub
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
