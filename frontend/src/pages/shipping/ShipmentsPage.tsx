import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { shippingApi } from '../../services/api/shipping.api';
import { DataTable, ColumnDef } from '../../components/data-table/DataTable';
import { Shipment, ShipmentStatus } from '../../types/shipping';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { formatDate, formatDateTime } from '../../utils/date';
import { Truck, CheckCircle2, Clock, MapPin, Package, Building } from 'lucide-react';
import { cn } from '../../utils/formatting';

export function ShipmentsPage() {
  const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => shippingApi.getShipments(),
  });

  const shipments = data?.data || [];

  const columns: ColumnDef<Shipment>[] = [
    {
      key: 'shipmentNumber',
      header: 'Shipment # / Tracking',
      sortable: true,
      cell: (s) => (
        <div>
          <div className="font-bold font-mono text-[#252733] group-hover:text-[#714b67] transition-colors">
            {s.shipmentNumber}
          </div>
          <div className="text-xs text-[#714b67] font-mono mt-0.5">{s.trackingNumber}</div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Recipient Customer',
      sortable: true,
      cell: (s) => (
        <div>
          <div className="font-semibold text-[#252733]">{s.customerName}</div>
          <div className="text-[11px] text-slate-500 font-mono">Deal: {s.quoteNumber}</div>
        </div>
      ),
    },
    {
      key: 'carrierProvider',
      header: 'Carrier Gateway',
      sortable: true,
      cell: (s) => (
        <Badge variant="indigo" size="sm" className="font-mono">
          {s.carrierProvider}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Transit Status',
      sortable: true,
      cell: (s) => {
        const variants: Record<ShipmentStatus, any> = {
          ORDER_CONFIRMED: 'default',
          PACKED: 'secondary',
          PICKUP_SCHEDULED: 'secondary',
          IN_TRANSIT: 'indigo',
          OUT_FOR_DELIVERY: 'warning',
          DELIVERED: 'success',
          DELAYED: 'destructive',
          RETURNED: 'destructive',
        };
        return <Badge variant={variants[s.status] || 'default'}>{s.status}</Badge>;
      },
    },
    {
      key: 'estimatedDeliveryDate',
      header: 'Est. Delivery',
      sortable: true,
      cell: (s) => (
        <span className="font-mono text-emerald-600 font-medium">
          {formatDate(s.estimatedDeliveryDate)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Tracking Milestones',
      cell: (s) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedShipment(s);
          }}
          className="h-7 text-xs gap-1 border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#252733]"
        >
          <Truck className="w-3 h-3 text-[#714b67]" />
          Track Milestones
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div>
        <Breadcrumbs items={[{ label: 'Fulfillment' }, { label: 'Shipments' }]} />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] mt-1 font-display">
          Fulfillment & Shipments
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time carrier dispatch, package tracking, and transit milestone updates
        </p>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={shipments}
          isLoading={isLoading}
          searchPlaceholder="Search shipments by tracking #, customer, or quote..."
          onRowClick={(s) => setSelectedShipment(s)}
        />
      </div>

      {/* Tracking Milestones Modal */}
      {selectedShipment && (
        <Dialog
          isOpen={selectedShipment !== null}
          onClose={() => setSelectedShipment(null)}
          maxWidth="lg"
          title={
            <div className="flex items-center gap-2 font-mono text-[#252733]">
              <Truck className="w-5 h-5 text-[#714b67]" />
              <span className="font-display font-bold">{selectedShipment.shipmentNumber} Live Tracking</span>
            </div>
          }
          description={`Carrier: ${selectedShipment.carrierProvider} • AWB: ${selectedShipment.trackingNumber}`}
        >
          <div className="space-y-6 pt-2 text-xs font-sans">
            {/* Delivery Route Box */}
            <div className="p-4 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb] grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Origin Hub</span>
                <p className="font-semibold text-[#252733] mt-0.5">{selectedShipment.originWarehouse}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Destination</span>
                <p className="font-semibold text-[#252733] mt-0.5">{selectedShipment.destinationAddress}</p>
              </div>
            </div>

            {/* Timeline Milestones */}
            <div className="relative pl-6 border-l-2 border-[#f5eff3] space-y-4 ml-3">
              {selectedShipment.trackingHistory.map((ev, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0.5 p-1 rounded-full bg-[#714b67] text-white shadow-subtle">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#252733]">{ev.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDateTime(ev.timestamp)}</span>
                    </div>
                    <p className="text-slate-600">{ev.description}</p>
                    <span className="text-[11px] text-[#714b67] font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {ev.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
