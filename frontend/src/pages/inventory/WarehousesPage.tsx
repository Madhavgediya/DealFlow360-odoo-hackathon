import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../services/api/inventory.api';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Boxes, MapPin, ArrowRight } from 'lucide-react';

export function WarehousesPage() {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryApi.getWarehouses(),
  });

  const warehouses = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Inventory & Warehouses' }]} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Warehouse Network & Stock Hubs
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/inventory/stock')}
          className="gap-1.5 shadow-subtle bg-[#714b67] hover:bg-[#5e3c54] text-white"
        >
          <Boxes className="w-4 h-4" />
          View All Stock Items
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((wh) => {
          const utilizationPct = Math.round((wh.utilizedCapacityUnits / wh.totalCapacityUnits) * 100);
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
    </div>
  );
}
