import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { negotiationsApi } from '../../services/api/negotiations.api';
import { quotesApi } from '../../services/api/quotes.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { formatTimeAgo } from '../../utils/date';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { RiskBadge } from '../../components/common/StatusBadge';
import {
  ShieldAlert,
  FileText,
  History,
  GitCompare,
} from 'lucide-react';
import { cn } from '../../utils/formatting';

export function NegotiationDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { currency } = useAuthStore();
  const [selectedRevisionIdx, setSelectedRevisionIdx] = React.useState<number>(0);

  const { data: negData, isLoading: isNegLoading } = useQuery({
    queryKey: ['negotiation', quoteId],
    queryFn: () => negotiationsApi.getNegotiationByQuoteId(quoteId || 'q-1024'),
  });

  const { data: quoteData } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quotesApi.getQuoteById(quoteId || 'q-1024'),
  });

  const session = negData?.data;
  const quote = quoteData?.data;

  if (isNegLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-400">Loading Negotiation workspace...</span>
      </div>
    );
  }

  const latestRound = session.rounds[0];
  const revisions = quote?.revisions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Negotiations', href: '/sales/negotiations' },
              { label: `${session.quoteNumber} Negotiation Diff` },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              Negotiation Workspace: {session.quoteNumber}
            </h1>
            <Badge variant="indigo" size="md">Round {session.currentRound}</Badge>
            {session.reapprovalRequired && (
              <Badge variant="destructive" size="md" className="animate-pulse">
                Reapproval Triggered
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/sales/quotes/${quoteId || 'q-1024'}`)}
            className="gap-1.5 shadow-sm bg-[#714b67] hover:bg-[#5e3c54] text-white"
          >
            <FileText className="w-4 h-4" />
            Open Quote Builder
          </Button>
        </div>
      </div>

      {/* Hero Reapproval Alert Banner */}
      {session.reapprovalRequired && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 flex items-start gap-3 text-xs text-slate-700 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-800 text-sm font-sans">Automated Reapproval Triggered</span>
              <Badge variant="destructive">Margin Compression</Badge>
            </div>
            <p className="text-slate-600 font-sans">
              {session.reapprovalReason || 'Customer counter-proposal requested +8% discount elevation, reducing gross margin below the 18% hurdle rate.'}
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Negotiation Visual Diff */}
      <Card className="border-[#eceef5] bg-white overflow-hidden shadow-sm">
        <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#714b67]" />
            <CardTitle className="text-sm font-bold text-[#252733] font-display">
              Side-by-Side Commercial Terms Diff (Original vs Customer Counter)
            </CardTitle>
          </div>
          <span className="text-xs text-slate-400 font-mono">Comparing Latest Round</span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            {/* LEFT SIDE: Original Quote Baseline */}
            <div className="p-4 sm:p-5 space-y-4 bg-slate-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                  Original Sales Baseline (Rev 1)
                </span>
                <RiskBadge severity="LOW" score={25} showScore />
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Laptop Units:</span>
                  <span className="text-[#252733] font-bold">10 Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Hardware Discount:</span>
                  <span className="text-[#252733] font-bold">10.0% (Standard)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Gross Margin %:</span>
                  <span className="text-emerald-600 font-bold">22.9%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-sans">
                  <span className="text-slate-500">Baseline Total:</span>
                  <span className="text-[#252733] font-bold font-mono">₹ 2,010,770</span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Customer Counter Proposal */}
            <div className="p-4 sm:p-5 space-y-4 bg-[#f5eff3]/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#714b67] font-sans">
                  Customer Proposal (Round {session.currentRound})
                </span>
                <RiskBadge severity="HIGH" score={78} showScore />
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#ecdfe8] space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Laptop Units:</span>
                  <span className="text-[#714b67] font-bold">15 Units (+5 units)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Requested Discount:</span>
                  <span className="text-rose-600 font-bold">18.0% (+8% excess)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Gross Margin %:</span>
                  <span className="text-rose-600 font-bold">16.5% (-6.4% drop)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-sans">
                  <span className="text-slate-500">Revised Total:</span>
                  <span className="text-[#714b67] font-bold font-mono">₹ 2,777,130</span>
                </div>
              </div>

              {latestRound?.customerMessage && (
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 font-sans">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Customer Note (Alex Morgan, CTO):</span>
                  <p className="text-slate-700 italic leading-relaxed">
                    "{latestRound.customerMessage}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Revision History Inspector */}
      <Card className="border-[#eceef5] bg-white shadow-sm">
        <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#714b67]" />
            <CardTitle className="text-sm font-bold text-[#252733] font-display">
              Quote Revision Timeline & Delta Inspector
            </CardTitle>
          </div>
          <span className="text-xs text-slate-400 font-sans">{revisions.length} Revisions Recorded</span>
        </CardHeader>

        <CardContent className="p-4 space-y-4 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {revisions.map((rev, idx) => (
              <div
                key={rev.revisionNumber}
                onClick={() => setSelectedRevisionIdx(idx)}
                className={cn(
                  'p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 text-xs',
                  selectedRevisionIdx === idx
                    ? 'border-[#714b67] bg-[#f5eff3] text-[#252733] shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                )}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold">Revision {rev.revisionNumber}</span>
                  <RiskBadge severity={rev.riskSeverity} />
                </div>
                <p className="text-[11px] text-slate-500">{rev.changeSummary}</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>By: {rev.createdBy}</span>
                  <span>{formatTimeAgo(rev.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Revision Inspection Box */}
          {revisions[selectedRevisionIdx] && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-[#252733] font-display">
                Inspection Details: Revision {revisions[selectedRevisionIdx].revisionNumber}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Net Total</span>
                  <span className="font-bold text-[#252733]">{formatCurrency(revisions[selectedRevisionIdx].totalAmount, currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Discount Concession</span>
                  <span className="font-bold text-[#252733]">{formatCurrency(revisions[selectedRevisionIdx].discountAmount, currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Gross Margin</span>
                  <span className="font-bold text-[#252733]">{revisions[selectedRevisionIdx].marginPercentage.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Risk Score</span>
                  <span className="font-bold text-[#252733]">{revisions[selectedRevisionIdx].riskScore}/100</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
