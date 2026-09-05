import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  MessageSquare,
  Send,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface NegotiationMessage {
  id: string;
  sender: 'RETAILER' | 'ADMIN' | 'AI_SYSTEM';
  senderName: string;
  timestamp: string;
  text: string;
  counterOffer?: {
    proposedTotal: number;
    unitPrice: number;
    qty: number;
    discountPercent: number;
  };
}

export function RetailerNegotiationPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [selectedQuoteId, setSelectedQuoteId] = React.useState('QT-2026-991');
  const [inputText, setInputText] = React.useState('');
  const [proposedUnitBid, setProposedUnitBid] = React.useState('19200');

  const [messages, setMessages] = React.useState<NegotiationMessage[]>([
    {
      id: 'msg-1',
      sender: 'RETAILER',
      senderName: user?.name || 'Retail Partner',
      timestamp: 'Yesterday at 3:15 PM',
      text: 'Submitted initial wholesale quote request for 50x EdgeX 48-Port Switches. Looking for volume discount at ₹19,000 / unit.',
      counterOffer: {
        proposedTotal: 950000,
        unitPrice: 19000,
        qty: 50,
        discountPercent: 24,
      },
    },
    {
      id: 'msg-2',
      sender: 'ADMIN',
      senderName: 'Jordan Davis (Enterprise Commercial Director)',
      timestamp: 'Yesterday at 5:40 PM',
      text: 'Thank you for the bulk bid. While ₹19,000 is below our hardware margin floor for 50 units, we can offer an authorized concession at ₹20,375 / unit (18.5% Platinum tier discount), or ₹19,600 if volume increases to 75 units.',
      counterOffer: {
        proposedTotal: 1018750,
        unitPrice: 20375,
        qty: 50,
        discountPercent: 18.5,
      },
    },
    {
      id: 'msg-3',
      sender: 'AI_SYSTEM',
      senderName: 'DealFlow AI Copilot',
      timestamp: 'Today at 9:00 AM',
      text: 'Deal Insights: Admin counter of ₹20,375 is competitive within Tier 1 margins. Suggesting a compromise counter of ₹19,800 with 30-day net payment terms for 94% win probability.',
    },
  ]);

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !proposedUnitBid) return;

    const unitBidNum = Number(proposedUnitBid) || 19500;
    const newMsg: NegotiationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'RETAILER',
      senderName: user?.name || 'Retail Partner',
      timestamp: 'Just now',
      text: inputText.trim() || `Submitting counter-offer at ₹${unitBidNum.toLocaleString('en-IN')} per unit.`,
      counterOffer: {
        proposedTotal: unitBidNum * 50,
        unitPrice: unitBidNum,
        qty: 50,
        discountPercent: Number((((25000 - unitBidNum) / 25000) * 100).toFixed(1)),
      },
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    toast.success('Counter-offer delivered to Enterprise Deal Desk!');

    // Simulate auto AI / Admin response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ADMIN',
          senderName: 'Jordan Davis (Commercial Director)',
          timestamp: 'Just now',
          text: `Reviewed your counter of ₹${unitBidNum.toLocaleString('en-IN')}! Deal desk approves this concession. Ready to seal PO.`,
          counterOffer: {
            proposedTotal: unitBidNum * 50,
            unitPrice: unitBidNum,
            qty: 50,
            discountPercent: Number((((25000 - unitBidNum) / 25000) * 100).toFixed(1)),
          },
        },
      ]);
      toast.success('🎉 Admin accepted the counter-offer! Deal is ready to confirm.');
    }, 2500);
  };

  const handleAcceptDeal = () => {
    toast.success('Deal accepted! Converted to Confirmed Purchase Order.');
    navigate('/retailer/orders');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-xs pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" /> Multi-Round B2B Negotiation Room
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2 mt-1">
          <MessageSquare className="w-6 h-6 text-[#714b67]" />
          Live Commercial Negotiation Desk
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Exchange counter-proposals with company executives in real-time, backed by AI margin analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Negotiation Room Stream */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                  Deal Reference: {selectedQuoteId}
                </span>
                <h3 className="font-bold text-[#252733] text-sm">
                  Bulk EdgeX Enterprise Switch 48-Port (50 Units)
                </h3>
              </div>
            </div>

            <Badge variant="warning" className="text-xs">
              NEGOTIATION IN PROGRESS
            </Badge>
          </Card>

          {/* Messages Stream */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl p-5 space-y-4 max-h-[480px] overflow-y-auto">
            {messages.map((m) => {
              const isRetailer = m.sender === 'RETAILER';
              const isAi = m.sender === 'AI_SYSTEM';

              if (isAi) {
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-[#fdf2f8] border border-purple-200/70 text-purple-950 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] flex items-center gap-1.5 text-purple-700">
                        <Sparkles className="w-3.5 h-3.5" /> {m.senderName}
                      </span>
                      <span className="text-[10px] text-purple-400 font-mono">{m.timestamp}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{m.text}</p>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isRetailer ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="font-bold text-[#252733] text-[11px]">{m.senderName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-4 rounded-2xl space-y-2.5 ${
                      isRetailer
                        ? 'bg-[#714b67] text-white rounded-tr-xs shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{m.text}</p>

                    {m.counterOffer && (
                      <div
                        className={`p-2.5 rounded-xl text-[11px] font-mono flex items-center justify-between gap-4 ${
                          isRetailer ? 'bg-white/15 text-white' : 'bg-white border border-slate-200 text-slate-900'
                        }`}
                      >
                        <div>
                          <span className="block text-[10px] opacity-75">Proposed Unit Rate:</span>
                          <strong className="text-xs">₹{m.counterOffer.unitPrice.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="block text-[10px] opacity-75">Concession:</span>
                          <strong>{m.counterOffer.discountPercent}% Off MRP</strong>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] opacity-75">Total Net Value:</span>
                          <strong className="text-xs">
                            ₹{m.counterOffer.proposedTotal.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Send Counter-Offer Form */}
          <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl p-4">
            <form onSubmit={handleSendCounter} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-600 font-semibold block mb-1">
                    Negotiation Message / Counter Justification
                  </label>
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Provide commercial rationale for your price counter..."
                    className="bg-slate-50 border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    Your Counter Rate (₹ / Unit)
                  </label>
                  <Input
                    type="number"
                    value={proposedUnitBid}
                    onChange={(e) => setProposedUnitBid(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-slate-500 text-[11px]">
                  Estimated Proposal Total: <strong>₹{(Number(proposedUnitBid) * 50).toLocaleString('en-IN')}</strong> (50 units)
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleAcceptDeal}
                    variant="outline"
                    size="sm"
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accept Latest Terms
                  </Button>
                  <Button type="submit" size="sm" className="bg-[#714b67] text-white text-xs font-semibold gap-1.5 shadow-sm">
                    <Send className="w-3.5 h-3.5" />
                    Send Counter
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side: Commercial Deal Summary & Terms */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-slate-200/80 bg-white shadow-subtle rounded-2xl space-y-4">
            <h3 className="font-bold text-[#252733] text-xs font-display pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Commercial Summary & Terms
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Standard MRP:</span>
                <span className="font-mono text-slate-400 line-through">₹12,50,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Retailer Target Bid:</span>
                <span className="font-mono font-semibold text-slate-800">₹9,80,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Latest Concession Price:</span>
                <span className="font-mono font-bold text-[#714b67] text-sm">₹10,18,750</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Estimated Total Savings:</span>
                <span className="font-mono font-bold text-emerald-600">₹2,31,250 (18.5% Off)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment Terms:</span>
                <span className="font-semibold text-slate-800">Net 30 Days (Credit Line)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-[11px] text-slate-700 block">Delivery SLA</span>
              <p className="text-[10px] text-slate-500">
                Guaranteed shipment within 48 hours of Purchase Order confirmation from Central Warehouse.
              </p>
            </div>

            <Button
              onClick={handleAcceptDeal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept Terms & Generate Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RetailerNegotiationPage;
