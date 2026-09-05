import { useQuery } from '@tanstack/react-query';
import { procurementApi } from '../../services/api/procurement.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { PurchaseOrder } from '../../types/procurement';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Building2, Truck, Clock } from 'lucide-react';

export function PurchaseOrdersPage() {
  const { currency } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => procurementApi.getPurchaseOrders(),
  });

  const orders = data?.data || [];

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO # / Vendor',
      sortable: true,
      cell: (po) => (
        <div>
          <div className="font-bold font-mono text-[#252733] group-hover:text-[#714b67] transition-colors">
            {po.poNumber}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{po.vendorName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'linkedQuoteNumber',
      header: 'Linked Deal',
      cell: (po) => (
        <span className="font-mono text-[#714b67] font-semibold">
          {po.linkedQuoteNumber || 'Stock Buffer'}
        </span>
      ),
    },
    {
      key: 'targetWarehouseName',
      header: 'Target Warehouse',
      sortable: true,
      cell: (po) => <Badge variant="secondary">{po.targetWarehouseName}</Badge>,
    },
    {
      key: 'status',
      header: 'PO Status',
      sortable: true,
      cell: (po) => (
        <Badge variant={po.status === 'CONFIRMED' ? 'indigo' : 'success'}>
          {po.status}
        </Badge>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Order Value',
      sortable: true,
      cell: (po) => (
        <span className="font-mono font-bold text-[#252733]">
          {formatCurrency(po.totalAmount, currency)}
        </span>
      ),
    },
    {
      key: 'expectedDeliveryDate',
      header: 'Expected Arrival',
      sortable: true,
      cell: (po) => (
        <span className="font-mono text-emerald-600 font-medium">
          {formatDate(po.expectedDeliveryDate)}
        </span>
      ),
    },
    {
      key: 'orderDate',
      header: 'Created Date',
      sortable: true,
      cell: (po) => <span className="text-slate-500 font-mono">{formatDate(po.orderDate)}</span>,
    },
  ];

  return (
    <div>
      <div>
        <Breadcrumbs items={[{ label: 'Procurement' }, { label: 'Purchase Orders' }]} />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
          Purchase Orders
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track supplier replenishment, vendor order values, and expected arrivals
        </p>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={orders}
          isLoading={isLoading}
          searchPlaceholder="Search POs by PO number, vendor, or warehouse..."
        />
      </div>
    </div>
  );
}
