import { QuoteStatus, RiskSeverity } from '../../types/quote';
import { getQuoteStatusConfig, getRiskSeverityConfig } from '../../utils/status';
import { cn } from '../../utils/formatting';
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export function StatusBadge({ status, className }: { status: QuoteStatus | string; className?: string }) {
  const config = getQuoteStatusConfig(status as QuoteStatus);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none',
        config.color,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
}

export function RiskBadge({
  severity,
  score,
  showScore = false,
  className,
}: {
  severity: RiskSeverity;
  score?: number;
  showScore?: boolean;
  className?: string;
}) {
  const config = getRiskSeverityConfig(severity);

  const icons = {
    LOW: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
    MEDIUM: <Clock className="w-3 h-3 text-amber-600" />,
    HIGH: <AlertTriangle className="w-3 h-3 text-orange-600" />,
    CRITICAL: <ShieldAlert className="w-3 h-3 text-rose-600 animate-bounce" />,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border select-none',
        config.badgeColor,
        className
      )}
    >
      {icons[severity]}
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded bg-black/5 font-mono text-[11px] font-bold">
          {score}/100
        </span>
      )}
    </span>
  );
}
