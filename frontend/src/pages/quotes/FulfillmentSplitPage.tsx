import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../../services/api/quotes.api';
import { formatCurrency } from '../../utils/currency';
import { useAuthStore } from '../../stores/auth.store';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Building,
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  RefreshCw,
  MapPin,
  Boxes,
} from 'lucide-react';
import { cn } from '../../utils/formatting';

export function FulfillmentSplitPage() {
  const { id: quoteId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency } = useAuthStore();
  const [manualOverride, setManualOverride] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);
  const [overrideValues, setOverrideValues] = React.useState<Record<string, number>>({});

  const { data: quoteData, isLoading: quoteLoading } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quotesApi.getQuoteById(quoteId || 'q-1024'),
  });

  const { data: splitData, isLoading: splitLoading, refetch } = useQuery({
    queryKey: ['fulfillment-split', quoteId],
    queryFn: () => quotesApi.getFulfillmentSplit(quoteId || 'q-1024'),
  });

  const quote = quoteData?.data;
  const split = splitData?.data;

  const acceptSplit = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setAccepted(true);
    toast.success('Warehouse fulfillment plan accepted! Stock reserved and shipments scheduled.');
    queryClient.invalidateQueries({ queryKey: ['quotes'] });
  };

  const applyOverride = () => {
    toast.success('Manual warehouse override applied. Fulfillment plan updated.');
    setManualOverride(false);
    setAccepted(true);
  };

  if (quoteLoading || splitLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-400 animate-pulse">Computing optimal warehouse split...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Quotations', href: '/sales/quotes' },
              { label: quote?.quoteNumber || 'Quote', href: `/sales/quotes/${quoteId}` },
              { label: 'Fulfillment Split' },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5">
            <Boxes className="w-6 h-6 text-[#714b67]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#252733] font-display">
              Warehouse Fulfillment Split
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Intelligent stock allocation across warehouses for{' '}
            <strong>{quote?.customerName || 'Customer'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { refetch(); toast.info('Refreshing stock availability...'); }}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Stock
          </Button>
          {!accepted && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setManualOverride(!manualOverride)}
              className="gap-1.5 text-xs border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
            >
              <Sliders className="w-3.5 h-3.5" /> Manual Override
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {accepted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Fulfillment Plan Confirmed</span>
            <span className="ml-2">Stock reserved and shipment manifests generated. Logistics team notified.</span>
          </div>
        </div>
      )}

      {/* Split Summary Cards */}
      {split && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Warehouses Used', value: split.warehouses?.length || 0, icon: <Building className="w-4 h-4" />, color: 'text-[#714b67]' },
              { label: 'Shipment Count', value: split.shipmentCount || split.warehouses?.length, icon: <Truck className="w-4 h-4" />, color: 'text-blue-600' },
              { label: 'Shipping Cost', value: `₹${(split.totalShippingCost || 0).toLocaleString('en-IN')}`, icon: <Package className="w-4 h-4" />, color: 'text-slate-700' },
              { label: 'Backordered', value: split.backordered?.length || 0, icon: <AlertTriangle className="w-4 h-4" />, color: split.hasBackorder ? 'text-rose-600' : 'text-emerald-600' },
            ].map(stat => (
              <Card key={stat.label} className="border-[#eceef5] bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className={cn('flex items-center gap-1.5 mb-1 text-xs font-semibold', stat.color)}>
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <div className="text-xl font-bold text-[#252733] font-mono">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Warehouse Allocation Cards */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#252733] font-display flex items-center gap-2">
              <Building className="w-4 h-4 text-[#714b67]" />
              Warehouse Allocations
            </h2>
            {(split.warehouses || []).map((wh: any, idx: number) => (
              <Card key={wh.warehouseId} className="border-[#eceef5] bg-white shadow-sm overflow-hidden">
                <CardHeader className="p-4 bg-slate-50/70 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-7 h-7 rounded-full bg-[#714b67] text-white flex items-center justify-center font-bold text-[10px]">
                        W{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-[#252733] text-sm font-display">{wh.warehouseName}</div>
                        <div className="flex items-center gap-1 text-slate-500 font-sans">
                          <MapPin className="w-3 h-3" />
                          {wh.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-slate-400">Est. Shipping</div>
                      <div className="font-bold text-[#252733] font-mono">₹{(wh.estimatedShippingCost || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
                        <th className="pb-2 text-left">Product</th>
                        <th className="pb-2 text-center">Quantity Fulfilled</th>
                        {manualOverride && !accepted && (
                          <th className="pb-2 text-center">Override Qty</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(wh.items || []).map((item: any) => (
                        <tr key={item.productId} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-semibold text-[#252733]">{item.productName}</td>
                          <td className="py-2.5 text-center">
                            <span className="bg-[#714b67]/10 text-[#714b67] font-bold px-3 py-0.5 rounded-full text-xs font-mono">
                              {item.quantityFulfilled} units
                            </span>
                          </td>
                          {manualOverride && !accepted && (
                            <td className="py-2.5 text-center">
                              <input
                                type="number"
                                min={0}
                                value={overrideValues[`${wh.warehouseId}-${item.productId}`] ?? item.quantityFulfilled}
                                onChange={e => setOverrideValues(p => ({
                                  ...p,
                                  [`${wh.warehouseId}-${item.productId}`]: Number(e.target.value)
                                }))}
                                className="w-20 h-7 text-center text-xs rounded-xl border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Backorder Section */}
          {split.hasBackorder && split.backordered?.length > 0 && (
            <Card className="border-rose-200 bg-rose-50 shadow-sm">
              <CardHeader className="p-4 border-b border-rose-100">
                <CardTitle className="text-xs font-bold text-rose-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" /> Backordered Items — Stock Insufficient
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {split.backordered.map((item: any) => (
                  <div key={item.productId} className="flex items-center justify-between text-xs py-2 border-b border-rose-100 last:border-0">
                    <div>
                      <div className="font-semibold text-rose-800">{item.productName}</div>
                      <div className="text-rose-600">{item.message}</div>
                    </div>
                    <Button size="sm" variant="secondary" className="h-7 text-[10px] border-rose-200 text-rose-700 bg-white hover:bg-rose-50">
                      <Package className="w-3 h-3 mr-1" /> Trigger PO
                    </Button>
                  </div>
                ))}
                <div className="pt-2 text-[11px] text-rose-600 bg-rose-100 rounded-xl p-3">
                  💡 <strong>Consolidate Remaining Backorder</strong> — Once vendor stock arrives, click "Consolidate" to merge all backordered items into a single supplementary shipment.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!accepted && (
            <div className="flex items-center gap-3 pt-2">
              {manualOverride ? (
                <>
                  <Button
                    size="sm"
                    onClick={applyOverride}
                    className="gap-1.5 bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/20"
                  >
                    <Sliders className="w-4 h-4" />
                    Apply Manual Override & Confirm
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setManualOverride(false)}>
                    Cancel Override
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={acceptSplit}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Suggested Split & Reserve Stock
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/sales/quotes/${quoteId}`)}
                    className="gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" /> Back to Quote
                  </Button>
                </>
              )}
            </div>
          )}

          {accepted && (
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={() => navigate('/shipping')}
                className="gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white"
              >
                <Truck className="w-4 h-4" /> View Shipments
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/billing/invoices`)}>
                View Invoice
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
