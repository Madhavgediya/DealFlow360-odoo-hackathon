import { useQuery } from '@tanstack/react-query';
import { shippingApi } from '../../services/api/shipping.api';
import { formatDate, formatDateTime } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Truck, MapPin, CheckCircle2, Package } from 'lucide-react';

export function PortalOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => shippingApi.getShipments(),
  });

  const shipments = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
          Hardware Deliveries & Order Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">
          Real-time carrier milestone tracking for all dispatched enterprise equipment.
        </p>
      </div>

      <div className="space-y-4">
        {shipments.map((s) => (
          <Card key={s.id} className="border-[#eceef5] bg-white overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="p-4 sm:p-5 bg-slate-50/70 border-b border-[#eceef5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#714b67]" />
                <div>
                  <span className="font-bold text-[#252733] font-mono text-sm">{s.shipmentNumber}</span>
                  <span className="text-xs text-slate-500 ml-2 font-mono">AWB: {s.trackingNumber}</span>
                </div>
              </div>
              <Badge variant="indigo">{s.status}</Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Carrier Gateway</span>
                  <span className="text-[#252733] font-semibold">{s.carrierProvider}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">Estimated Delivery</span>
                  <span className="text-emerald-600 font-bold">{formatDate(s.estimatedDeliveryDate)}</span>
                </div>
              </div>

              {/* Milestones */}
              <div className="pl-6 border-l-2 border-[#ecdfe8] space-y-3 relative ml-2">
                {s.trackingHistory.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-0.5 p-1 rounded-full bg-[#714b67] text-white shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
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
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
