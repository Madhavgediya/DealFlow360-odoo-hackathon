import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '../../services/api/approvals.api';
import { useAuthStore } from '../../stores/auth.store';
import { formatCurrency } from '../../utils/currency';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { RiskBadge } from '../../components/common/StatusBadge';
import { RiskBreakdown } from '../../components/common/RiskBreakdown';
import { AuditTimeline } from '../../components/common/AuditTimeline';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  FileText,
} from 'lucide-react';
import { ApprovalActionPayload } from '../../types/approval';

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, user } = useAuthStore();

  const [actionModal, setActionModal] = React.useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | null>(null);
  const [comment, setComment] = React.useState('');
  const [rejectReason, setRejectReason] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['approval', id],
    queryFn: () => approvalsApi.getApprovalById(id || 'appr-1024'),
  });

  const approval = data?.data;

  const actionMutation = useMutation({
    mutationFn: (payload: ApprovalActionPayload) =>
      approvalsApi.handleAction(payload, user?.name, user?.roleTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });

      if (actionModal === 'APPROVE') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        toast.success('Approval granted!');
      } else if (actionModal === 'REJECT') {
        toast.error('Approval rejected.');
      } else {
        toast.info('Changes requested from sales rep.');
      }

      setActionModal(null);
      setComment('');
      setRejectReason('');
    },
  });

  if (isLoading || !approval) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs text-slate-400">Loading Approval details...</span>
      </div>
    );
  }

  const handleActionSubmit = () => {
    if (actionModal === 'REJECT' && !rejectReason.trim()) {
      toast.error('Rejection reason is mandatory.');
      return;
    }

    actionMutation.mutate({
      approvalId: approval.id,
      action: actionModal!,
      comments: comment,
      reason: rejectReason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Approvals', href: '/approvals' },
              { label: `${approval.quoteNumber} Approval` },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
              Approval Request: {approval.quoteNumber}
            </h1>
            <Badge
              variant={
                approval.status === 'APPROVED'
                  ? 'success'
                  : approval.status === 'REJECTED'
                  ? 'destructive'
                  : 'warning'
              }
              size="md"
            >
              {approval.status}
            </Badge>
            <RiskBadge severity={approval.riskSeverity} score={approval.riskScore} showScore />
          </div>
        </div>

        {/* Action Buttons */}
        {approval.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActionModal('REQUEST_CHANGES')}
              className="gap-1.5"
            >
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Request changes
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setActionModal('REJECT')}
              className="gap-1.5 shadow-sm shadow-rose-600/20"
            >
              <XCircle className="w-4 h-4" />
              Reject concession
            </Button>
            <Button
              size="sm"
              onClick={() => setActionModal('APPROVE')}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Authorize & Approve
            </Button>
          </div>
        )}
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Deal Summary & Risk Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#eceef5] bg-white shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-[#252733] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Building className="w-3.5 h-3.5 text-[#714b67]" />
                Commercial Terms & Concession Request
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Net Total</span>
                  <span className="font-bold text-[#252733] text-sm">{formatCurrency(approval.totalAmount, currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Discount</span>
                  <span className="font-bold text-rose-600 text-sm">{approval.discountPercentage.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Gross Margin</span>
                  <span className="font-bold text-rose-600 text-sm">{approval.grossMarginPercentage.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Target Hurdle</span>
                  <span className="font-bold text-emerald-600 text-sm">18.0%</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-600 font-semibold block mb-1">Triggering Violation Reasons:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {approval.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Account Executive: <strong className="text-[#252733]">{approval.requestedByName}</strong></span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/sales/quotes/${approval.quoteId}`)}
                  className="h-7 text-xs gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Inspect Full Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Full Automated Risk Breakdown */}
          <RiskBreakdown risk={approval.riskAssessment} />
        </div>

        {/* Right 5 cols: Audit Trail & Decision History */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border-[#eceef5] bg-white shadow-sm">
            <CardHeader className="p-4 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#252733] flex items-center gap-1.5 font-display">
                <ShieldCheck className="w-4 h-4 text-[#714b67]" />
                Immutable Audit Trail & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <AuditTimeline events={approval.auditTrail as any} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve / Reject / Changes Modal */}
      <Dialog
        isOpen={actionModal !== null}
        onClose={() => setActionModal(null)}
        title={
          actionModal === 'APPROVE'
            ? 'Authorize Commercial Approval'
            : actionModal === 'REJECT'
            ? 'Reject Commercial Concession'
            : 'Request Changes from Account Exec'
        }
        description={`Quote: ${approval.quoteNumber} • Customer: ${approval.customerName}`}
      >
        <div className="space-y-4 pt-2 text-xs">
          {actionModal === 'REJECT' && (
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Mandatory Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. 18% discount exceeds maximum allowed margin tolerance without executive board waiver."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
          )}

          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              Audit Notes & Comments (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add internal audit justification or conditions..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#252733] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={actionModal === 'REJECT' ? 'destructive' : 'primary'}
              onClick={handleActionSubmit}
              isLoading={actionMutation.isPending}
            >
              {actionModal === 'APPROVE'
                ? 'Confirm Approval'
                : actionModal === 'REJECT'
                ? 'Confirm Rejection'
                : 'Submit Request'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
