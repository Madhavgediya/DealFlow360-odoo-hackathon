import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, AddStockPayload } from '../../services/api/inventory.api';
import { productsApi } from '../../services/api/products.api';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { StockItem } from '../../types/inventory';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Plus, PackagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../utils/formatting';

export function StockPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialWh = searchParams.get('warehouse') || 'ALL';
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<string>(initialWh);
  const [isAddStockOpen, setIsAddStockOpen] = React.useState(false);

  // Add stock form state
  const [targetWarehouseId, setTargetWarehouseId] = React.useState('');
  const [targetProductId, setTargetProductId] = React.useState('');
  const [quantity, setQuantity] = React.useState<number>(50);
  const [reference, setReference] = React.useState('');

  const { data: stockData, isLoading } = useQuery({
    queryKey: ['stock', selectedWarehouse],
    queryFn: () => inventoryApi.getStockItems(selectedWarehouse === 'ALL' ? undefined : selectedWarehouse),
  });

  const { data: whData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryApi.getWarehouses(),
  });

  const { data: prodData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });

  const stockItems = stockData?.data || [];
  const warehouses = whData?.data || [];
  const products = prodData?.data || [];

  React.useEffect(() => {
    if (warehouses.length > 0 && !targetWarehouseId) {
      setTargetWarehouseId(warehouses[0].id);
    }
    if (products.length > 0 && !targetProductId) {
      setTargetProductId(products[0].id);
    }
  }, [warehouses, products, targetWarehouseId, targetProductId]);

  const addStockMutation = useMutation({
    mutationFn: (payload: { warehouseId: string; body: AddStockPayload }) =>
      inventoryApi.addStock(payload.warehouseId, payload.body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success(res.message || 'Stock updated successfully!');
      setIsAddStockOpen(false);
      setQuantity(50);
      setReference('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update stock');
    },
  });

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWarehouseId || !targetProductId) {
      toast.error('Please select both warehouse and product');
      return;
    }

    addStockMutation.mutate({
      warehouseId: targetWarehouseId,
      body: {
        productId: targetProductId,
        quantity,
        referenceType: 'MANUAL_INBOUND',
        referenceId: reference || `PO-IN-${Date.now()}`,
      },
    });
  };

  const columns: ColumnDef<StockItem>[] = [
    {
      key: 'productName',
      header: 'Product Name / SKU',
      sortable: true,
      cell: (stk) => (
        <div>
          <div className="font-bold text-[#252733]">{stk.productName}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{stk.productSku}</div>
        </div>
      ),
    },
    {
      key: 'warehouseName',
      header: 'Warehouse Hub',
      sortable: true,
      cell: (stk) => <Badge variant="secondary">{stk.warehouseName}</Badge>,
    },
    {
      key: 'quantityOnHand',
      header: 'On Hand',
      sortable: true,
      cell: (stk) => <span className="font-mono text-slate-700">{stk.quantityOnHand} units</span>,
    },
    {
      key: 'quantityReserved',
      header: 'Reserved',
      sortable: true,
      cell: (stk) => <span className="font-mono text-amber-600 font-semibold">{stk.quantityReserved} units</span>,
    },
    {
      key: 'quantityAvailable',
      header: 'Net Available',
      sortable: true,
      cell: (stk) => {
        const isLow = stk.quantityAvailable <= stk.reorderPoint;
        return (
          <span
            className={cn(
              'font-mono font-bold',
              isLow ? 'text-rose-600' : 'text-emerald-600'
            )}
          >
            {stk.quantityAvailable} units {isLow && '⚠️'}
          </span>
        );
      },
    },
    {
      key: 'quantityIncoming',
      header: 'Incoming POs',
      sortable: true,
      cell: (stk) => (
        <span className="font-mono text-[#714b67] font-semibold">
          {stk.quantityIncoming > 0 ? `+${stk.quantityIncoming}` : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Procurement Action',
      cell: (stk) => {
        const isShortage = stk.quantityAvailable <= 10;
        return isShortage ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vendors/compare/${stk.productId}`);
            }}
            className="h-7 text-xs gap-1 border-[#ecdfe8] text-[#714b67] hover:bg-[#f5eff3]"
          >
            <ShoppingCart className="w-3 h-3" />
            Compare Vendors & PO
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">Stock Healthy</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Warehouses', href: '/inventory/warehouses' },
              { label: 'Stock Items' },
            ]}
          />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
            Real-Time Inventory Stock & Reservations
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddStockOpen(true)}
          className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
        >
          <Plus className="w-4 h-4" />
          Receive Inbound Stock
        </Button>
      </div>

      {/* Warehouse Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedWarehouse('ALL')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border',
            selectedWarehouse === 'ALL'
              ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-subtle'
              : 'bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]'
          )}
        >
          All Warehouses ({stockItems.length})
        </button>
        {warehouses.map((w) => (
          <button
            key={w.id}
            onClick={() => setSelectedWarehouse(w.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border',
              selectedWarehouse === w.id
                ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-semibold shadow-subtle'
                : 'bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]'
            )}
          >
            {w.name}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={stockItems}
        isLoading={isLoading}
        searchPlaceholder="Search inventory by product, sku, or warehouse..."
      />

      {/* Receive Inbound Stock Modal */}
      <Dialog
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <PackagePlus className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Receive Inbound Stock Shipment</span>
          </div>
        }
        description="Replenish warehouse stock balance from supplier deliveries or stock transfers."
      >
        <form onSubmit={handleAddStockSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Destination Warehouse</label>
            <select
              value={targetWarehouseId}
              onChange={(e) => setTargetWarehouseId(e.target.value)}
              className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Product SKU</label>
            <select
              value={targetProductId}
              onChange={(e) => setTargetProductId(e.target.value)}
              className="w-full h-9 rounded-xl border border-[#e5e7eb] bg-white px-3 text-xs text-[#252733]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Quantity Received</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                min="1"
                required
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Delivery / PO Ref #</label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-DEL-9840"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddStockOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={addStockMutation.isPending}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white"
            >
              Confirm Inbound Stock
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
