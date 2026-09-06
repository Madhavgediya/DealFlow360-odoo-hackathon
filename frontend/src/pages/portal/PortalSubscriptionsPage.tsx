import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../../services/api/subscriptions.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Repeat, Sparkles, CheckCircle2, ShieldCheck, Users, Plus, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export function PortalSubscriptionsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isAddSeatsOpen, setIsAddSeatsOpen] = React.useState(false);
  const [extraSeats, setExtraSeats] = React.useState(5);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  });

  const subscriptions = data?.data || [];

  const handleAddSeats = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Successfully added ${extraSeats} user seats to your SaaS subscription plan!`);
    setIsAddSeatsOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
            <Repeat className="w-6 h-6 text-[#714b67]" />
            SaaS Subscriptions & License Allocation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Active software licenses, seat allocations, SLA entitlements, and renewal schedules in Indian Rupees (₹ INR).
          </p>
        </div>

        <Button
          onClick={() => setIsAddSeatsOpen(true)}
          className="bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm gap-1.5 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add User Seats
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="py-12 text-center text-slate-400">Loading active subscription plans...</div>
        )}
        {!isLoading && subscriptions.length === 0 && (
          <div className="py-12 text-center text-slate-400">No active SaaS subscriptions.</div>
        )}
        {!isLoading &&
          subscriptions.map((sub) => (
            <Card key={sub.id} className="border-slate-200/80 bg-white overflow-hidden rounded-2xl shadow-subtle">
              <CardHeader className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#252733] text-base font-display">{sub.planName}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
                      <Sparkles className="w-3 h-3" />
                      7-Day Enterprise Trial Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans">
                    Current Period: {formatDate(sub.currentPeriodStart)} — {formatDate(sub.currentPeriodEnd)}
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">
                    Annual License Value
                  </span>
                  <span className="font-bold text-[#252733] text-base font-mono">
                    {formatCurrency(sub.price, 'INR')}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">
                      Trial Days Remaining
                    </span>
                    <span className="text-[#714b67] font-bold text-sm font-display">6 Days Left</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">
                      Active User Seats
                    </span>
                    <span className="text-[#252733] font-bold text-sm">{sub.seats} Seats</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider font-sans">
                      Next Scheduled Renewal
                    </span>
                    <span className="text-[#252733] text-sm font-semibold">{formatDate(sub.currentPeriodEnd)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Full DealFlow360 platform access enabled with premium SLA, CPQ Deal Desk, and 24/7 dedicated support.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Add Seats Modal */}
      <Dialog
        isOpen={isAddSeatsOpen}
        onClose={() => setIsAddSeatsOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#714b67]" />
            <span className="font-display font-bold text-[#252733]">Expand Subscription User Seats</span>
          </div>
        }
      >
        <form onSubmit={handleAddSeats} className="space-y-4 pt-2 font-sans text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">
              Number of Additional Seats to Provision
            </label>
            <Input
              type="number"
              min={1}
              max={100}
              value={extraSeats}
              onChange={(e) => setExtraSeats(Number(e.target.value))}
              className="font-mono text-center"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Per Seat Pricing:</span>
              <span className="font-mono font-bold">₹1,500 / month</span>
            </div>
            <div className="flex justify-between text-[#714b67] font-bold border-t border-slate-200 pt-1">
              <span>Added Monthly Recurring:</span>
              <span className="font-mono">{formatCurrency(extraSeats * 1500, 'INR')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddSeatsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#714b67] text-white">
              Confirm Seat Addition
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default PortalSubscriptionsPage;
