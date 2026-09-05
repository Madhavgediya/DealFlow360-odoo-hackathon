import { formatTimeAgo, formatDateTime } from '../../utils/date';
import { cn } from '../../utils/formatting';
import { CheckCircle2, XCircle, AlertCircle, Clock, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';
import { useAIStore } from '../../stores/ai.store';

export interface AuditEvent {
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'REAPPROVAL_TRIGGERED' | 'COUNTER_PROPOSAL';
  performedBy: string;
  performedByRole: string;
  comments?: string;
  timestamp: string;
  diffs?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export function AuditTimeline({ events, className }: { events: AuditEvent[]; className?: string }) {
  const { openDrawer, addMessage, setThinking } = useAIStore();

  if (!events || events.length === 0) {
    return <p className="text-xs text-slate-400 py-4 text-center">No audit trail records yet.</p>;
  }

  const icons = {
    SUBMITTED: <Clock className="w-4 h-4 text-[#714b67]" />,
    APPROVED: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    REJECTED: <XCircle className="w-4 h-4 text-rose-600" />,
    CHANGES_REQUESTED: <AlertCircle className="w-4 h-4 text-amber-600" />,
    REAPPROVAL_TRIGGERED: <Shield className="w-4 h-4 text-rose-600 animate-pulse" />,
    COUNTER_PROPOSAL: <UserCheck className="w-4 h-4 text-[#714b67]" />,
  };

  const handleAskAIAboutChange = (ev: AuditEvent) => {
    openDrawer({
      type: 'AUDIT',
      id: `audit-${Date.now()}`,
      title: `${ev.action} by ${ev.performedBy}`,
      diffs: ev.diffs,
    });

    // Send automated prompt to Copilot
    const diffsText = ev.diffs && ev.diffs.length > 0
      ? ` Diffs: ${ev.diffs.map(d => `${d.field}: ${d.oldValue} -> ${d.newValue}`).join(', ')}.`
      : '';
    const prompt = `Explain the audit event: "${ev.action}" performed by ${ev.performedBy} (${ev.performedByRole}). Note: "${ev.comments || 'No comment'}".${diffsText}`;

    // Trigger AI response in chat
    addMessage({
      sender: 'USER',
      text: prompt,
    });
  };

  return (
    <div className={cn('relative space-y-4 pl-4 border-l border-slate-200 ml-2', className)}>
      {events.map((ev, index) => (
        <div key={index} className="relative group">
          {/* Timeline node */}
          <div className="absolute -left-[23px] top-1 p-1 rounded-full bg-white border border-slate-200 shadow-sm">
            {icons[ev.action] || <Clock className="w-3.5 h-3.5 text-slate-400" />}
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">{ev.performedBy}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">
                  {ev.performedByRole}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono" title={formatDateTime(ev.timestamp)}>
                  {formatTimeAgo(ev.timestamp)}
                </span>
                <button
                  type="button"
                  onClick={() => handleAskAIAboutChange(ev)}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8] text-[10px] font-semibold flex items-center gap-1 transition-all"
                  title="Ask RAG Copilot to analyze this modification"
                >
                  <Sparkles className="w-3 h-3 text-[#714b67]" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>

            {ev.comments && (
              <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                "{ev.comments}"
              </p>
            )}

            {ev.diffs && ev.diffs.length > 0 && (
              <div className="space-y-1 pt-1">
                {ev.diffs.map((d, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-xs font-mono bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500">{d.field}:</span>
                    <span className="text-rose-600 line-through">{String(d.oldValue)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-600 font-semibold">{String(d.newValue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
