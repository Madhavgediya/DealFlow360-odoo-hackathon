import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Receipt,
  Package,
  Truck,
  CheckCircle2,
  Download,
  CreditCard,
  Clock,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export function RetailerOrdersPage() {
  const { user } = useAuthStore();

  const orders = [
    {
      id: 'ORD-2026-8801',
      quoteRef: 'QT-2026-960',
      title: 'Rackmount Power Distribution Units (25x)',
      itemsCount: 25,
      totalAmount: 366750,
      status: 'DISPATCHED_IN_TRANSIT',
      courier: 'BlueDart Express B2B',
      trackingNumber: 'BLU-992817263',
      orderDate: '2026-09-03',
      invoiceNumber: 'INV-2026-4412',
      paymentStatus: 'PAID_VIA_CREDIT_LINE',
    },
    {
      id: 'ORD-2026-8794',
      quoteRef: 'QT-2026-932',
      title: 'Server Rack Enclosure 42U Heavy Duty (10x)',
      itemsCount: 10,
      totalAmount: 448000,
      status: 'DELIVERED',
      courier: 'Delhivery Freight',
      trackingNumber: 'DLV-441928371',
      orderDate: '2026-08-20',
      invoiceNumber: 'INV-2026-4390',
      paymentStatus: 'PAID_SETTLED',
    },
    {
      id: 'ORD-2026-8720',
      quoteRef: 'QT-2026-890',
      title: 'OptiCore 10G SFP+ Optical Transceivers (100x)',
      itemsCount: 100,
      totalAmount: 285000,
      status: 'DELIVERED',
      courier: 'FedEx Priority',
      trackingNumber: 'FDX-119283746',
      orderDate: '2026-08-05',
      invoiceNumber: 'INV-2026-4210',
      paymentStatus: 'PAID_SETTLED',
    },
  ];

  const handleDownloadInvoice = (inv: string) => {
    toast.success(`Downloading Tax Invoice ${inv}...`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
          <Receipt className="w-6 h-6 text-[#714b67]" />
          Wholesale Orders & Tax Invoices
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track real-time shipment logistics, download GST-compliant tax invoices, and monitor credit settlements.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((ord) => (
          <Card
            key={ord.id}
            className="p-5 border-slate-200/80 bg-white shadow-subtle rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-bold text-slate-900 text-xs">{ord.id}</span>
                <span className="text-[11px] text-slate-400 font-mono">From {ord.quoteRef}</span>
                <Badge variant={ord.status === 'DELIVERED' ? 'success' : 'warning'}>
                  {ord.status.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                  {ord.paymentStatus.replace(/_/g, ' ')}
                </Badge>
              </div>

              <h3 className="font-bold text-[#252733] text-sm">{ord.title}</h3>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                <span>Date: {ord.orderDate}</span>
                <span>Courier: {ord.courier}</span>
                <span>Tracking: <strong>{ord.trackingNumber}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Net Settled:</span>
                <span className="text-base font-bold text-[#714b67] font-mono">
                  ₹{ord.totalAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Invoice: {ord.invoiceNumber}
                </span>
              </div>

              <Button
                onClick={() => handleDownloadInvoice(ord.invoiceNumber)}
                size="sm"
                variant="outline"
                className="text-xs text-slate-700 border-slate-200 hover:bg-slate-50 gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Invoice PDF</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RetailerOrdersPage;
