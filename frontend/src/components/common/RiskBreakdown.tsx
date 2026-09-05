import { QuoteRiskAssessment } from '../../types/quote';
import { RiskBadge } from './StatusBadge';
import { ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '../../utils/formatting';

export function RiskBreakdown({
  risk,
  className,
}: {
  risk: QuoteRiskAssessment;
  compact?: boolean;
  className?: string;
}) {
  if (!risk) return null;

  return (
    <Card className={cn('border-[#eceef5] bg-white overflow-hidden shadow-sm', className)}>
      <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#714b67]" />
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#252733] font-display">
              Automated Risk & Policy Intelligence
            </CardTitle>
            <p className="text-[11px] text-slate-500 font-sans">
              Evaluated against category limits, gross margin floors, and inventory stock
            </p>
          </div>
        </div>
        <RiskBadge severity={risk.overallSeverity} score={risk.overallScore} showScore />
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Score progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-sans">Aggregate Risk Index</span>
            <span className="font-mono font-bold text-[#252733]">{risk.overallScore}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className={cn(
                'h-full transition-all duration-500',
                risk.overallSeverity === 'LOW' && 'bg-emerald-500',
                risk.overallSeverity === 'MEDIUM' && 'bg-amber-500',
                risk.overallSeverity === 'HIGH' && 'bg-orange-500',
                risk.overallSeverity === 'CRITICAL' && 'bg-rose-500'
              )}
              style={{ width: `${risk.overallScore}%` }}
            />
          </div>
        </div>

        {/* Severity Sub-indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-sans">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1">Discount Risk</p>
            <RiskBadge severity={risk.discountRisk} />
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1">Margin Risk</p>
            <RiskBadge severity={risk.marginRisk} />
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1">Stock Fulfillment</p>
            <RiskBadge severity={risk.fulfillmentRisk} />
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1">Vendor Supply</p>
            <RiskBadge severity={risk.vendorRisk} />
          </div>
        </div>

        {/* Explainability list: WHY is this risky? */}
        {risk.factors && risk.factors.length > 0 ? (
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
              <HelpCircle className="w-3.5 h-3.5 text-[#714b67]" />
              Policy Violations & Explainability Factors
            </h4>

            <div className="space-y-2">
              {risk.factors.map((factor, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{factor.name}</span>
                    </div>
                    <RiskBadge severity={factor.severity} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Actual</span>
                      <span className="text-rose-600 font-bold">{factor.actualValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Allowed / Rule</span>
                      <span className="text-slate-700">{factor.allowedValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Excess / Gap</span>
                      <span className="text-amber-600 font-bold">{factor.difference}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-semibold">Impact: </strong>
                    {factor.impact}. {factor.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>All line items and margin metrics conform with corporate discount limits. No approval blockers triggered.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
