import { QuoteRiskAssessment, RiskSeverity } from './quote';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

export interface ApprovalRequest {
  id: string;
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  requestedById: string;
  requestedByName: string;
  totalAmount: number;
  discountPercentage: number;
  grossMarginPercentage: number;
  riskScore: number;
  riskSeverity: RiskSeverity;
  status: ApprovalStatus;
  currentStep: number;
  totalSteps: number;
  requiredRole: string;
  reasons: string[];
  riskAssessment: QuoteRiskAssessment;
  ageHours: number;
  auditTrail: {
    action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'REAPPROVAL_TRIGGERED';
    performedBy: string;
    performedByRole: string;
    comments?: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalActionPayload {
  approvalId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comments?: string;
  reason?: string; // Required if REJECT
}
