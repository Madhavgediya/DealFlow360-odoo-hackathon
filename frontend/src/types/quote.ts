import { CurrencyCode } from './api';

export type QuoteStatus =
  | 'DRAFT'
  | 'TEAM_REVIEW'
  | 'RISK_CALCULATED'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_IN_PROGRESS'
  | 'APPROVED'
  | 'CUSTOMER_NEGOTIATION'
  | 'REAPPROVAL_REQUIRED'
  | 'CONFIRMED'
  | 'FULFILLMENT'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'BILLED'
  | 'PAID'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  category: 'DISCOUNT' | 'MARGIN' | 'FULFILLMENT' | 'VENDOR' | 'NEGOTIATION' | 'CREDIT';
  name: string;
  severity: RiskSeverity;
  score: number; // 0-100
  rule: string;
  actualValue: string | number;
  allowedValue: string | number;
  difference: string | number;
  impact: string;
  explanation: string;
}

export interface QuoteRiskAssessment {
  overallScore: number; // 0-100 (0 = lowest risk, 100 = critical risk)
  overallSeverity: RiskSeverity;
  discountRisk: RiskSeverity;
  marginRisk: RiskSeverity;
  fulfillmentRisk: RiskSeverity;
  vendorRisk: RiskSeverity;
  negotiationRisk: RiskSeverity;
  factors: RiskFactor[];
  requiresApproval: boolean;
  approvalReasons: string[];
  calculatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  categoryId: string;
  categoryName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineSubtotal: number;
  lineTotal: number;
  unitCost: number; // Internal only
  totalCost: number; // Internal only
  lineMarginAmount: number; // Internal only
  lineMarginPercentage: number; // Internal only
  warehouseId?: string;
  warehouseName?: string;
  isRecurring: boolean;
  billingPeriod?: 'MONTHLY' | 'ANNUAL';
  stockAvailable?: number;
  stockShortage?: number;
}

export interface QuoteRevision {
  revisionNumber: number;
  createdAt: string;
  createdBy: string;
  createdByRole: string;
  changeSummary: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  marginPercentage: number;
  riskScore: number;
  riskSeverity: RiskSeverity;
  lines: QuoteLineItem[];
  diffs?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface ApprovalStep {
  stepNumber: number;
  roleRequired: string;
  roleName: string;
  approverName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  reason: string;
  comments?: string;
  actionAt?: string;
}

export interface DealHealthMetrics {
  healthScore: number; // 0-100
  status: 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'CRITICAL';
  deliveryRisk: RiskSeverity;
  stalledDays: number;
  customerEngagementScore: number;
  vendorRisk: RiskSeverity;
  marginRisk: RiskSeverity;
  anomalies: string[];
}

export interface Quote {
  id: string;
  quoteNumber: string;
  companyId: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  customerTier: string;
  salespersonId: string;
  salespersonName: string;
  currency: CurrencyCode;
  priceListId: string;
  status: QuoteStatus;
  validUntil: string;
  paymentTerms: string;
  
  // Financials
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxAmount: number;
  totalAmount: number;
  
  // Internal Margins (Hidden from customer portal)
  totalCost: number;
  grossMarginAmount: number;
  grossMarginPercentage: number;
  
  // Risk & Approvals
  riskAssessment: QuoteRiskAssessment;
  approvalChain: ApprovalStep[];
  currentApprovalStep?: number;
  
  // Negotiation & Revisions
  currentRevisionNumber: number;
  revisions: QuoteRevision[];
  activeNegotiationRound?: number;
  reapprovalTriggered: boolean;
  reapprovalReason?: string;
  
  // Lines & Fulfillment
  lines: QuoteLineItem[];
  warehouseAllocationComplete: boolean;
  fulfillmentPlanId?: string;
  linkedPoIds?: string[];
  shipmentId?: string;
  invoiceId?: string;
  
  // Deal Health
  dealHealth: DealHealthMetrics;
  
  notes?: string;
  customerNotes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotePayload {
  customerId: string;
  currency?: CurrencyCode;
  priceListId?: string;
  validUntil: string;
  paymentTerms: string;
  notes?: string;
  lines: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
    warehouseId?: string;
  }[];
}
