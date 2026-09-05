import { QuoteLineItem, RiskSeverity } from './quote';

export type NegotiationStatus = 'OPEN' | 'CUSTOMER_SUBMITTED' | 'SALES_REVIEW' | 'REAPPROVAL_PENDING' | 'ACCEPTED' | 'REJECTED';

export interface NegotiationLineChange {
  productId: string;
  productName: string;
  originalQuantity: number;
  requestedQuantity: number;
  proposedQuantity?: number;
  originalDiscount: number;
  requestedDiscount: number;
  proposedDiscount?: number;
  originalUnitPrice: number;
  requestedUnitPrice?: number;
  proposedUnitPrice?: number;
}

export interface NegotiationRound {
  roundNumber: number;
  status: 'CUSTOMER_REQUEST' | 'SALES_COUNTER' | 'ACCEPTED' | 'REJECTED';
  initiatedBy: 'CUSTOMER' | 'SALES_REP' | 'SALES_MANAGER';
  initiatorName: string;
  customerMessage?: string;
  internalNotes?: string;
  lineChanges: NegotiationLineChange[];
  totalOriginal: number;
  totalRequested: number;
  totalProposed?: number;
  marginOriginal: number;
  marginImpact: number;
  riskBefore: RiskSeverity;
  riskAfter: RiskSeverity;
  reapprovalTriggered: boolean;
  reapprovalReason?: string;
  createdAt: string;
}

export interface NegotiationSession {
  id: string;
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  currentRound: number;
  status: NegotiationStatus;
  originalQuoteLines: QuoteLineItem[];
  currentQuoteLines: QuoteLineItem[];
  requestedQuoteLines: QuoteLineItem[];
  rounds: NegotiationRound[];
  reapprovalRequired: boolean;
  reapprovalReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNegotiationPayload {
  quoteId: string;
  customerMessage: string;
  lineModifications: {
    productId: string;
    requestedQuantity: number;
    requestedDiscount: number;
  }[];
}
