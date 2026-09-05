import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../services/api/inventory.api';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { StockItem } from '../../types/inventory';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { cn } from '../../utils/formatting';

export function StockPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialWh = searchParams.get('warehouse') || 'ALL';
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<string>(initialWh);

  const { data: stockData, isLoading } = useQuery({
    queryKey: ['stock', selectedWarehouse],
    queryFn: () => inventoryApi.getStockItems(selectedWarehouse === 'ALL' ? undefined : selectedWarehouse),
  });

  const { data: whData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryApi.getWarehouses(),
  });

  const stockItems = stockData?.data || [];
  const warehouses = whData?.data || [];

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
    </div>
  );
}
