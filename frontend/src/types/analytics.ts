export interface DashboardMetrics {
  totalPipelineValue: number;
  pipelineChangePercentage: number;
  activeDealsCount: number;
  quotesAwaitingApprovalCount: number;
  activeNegotiationsCount: number;
  expectedMonthlyRevenue: number;
  averageGrossMarginPercentage: number;
  atRiskDealsCount: number;
  pendingFulfillmentCount: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  tertiaryValue?: number;
  category?: string;
}

export interface NeedsAttentionItem {
  id: string;
  type: 'DISCOUNT_LIMIT' | 'APPROVAL_DELAY' | 'STOCK_SHORTAGE' | 'VENDOR_RISK' | 'REAPPROVAL' | 'STALLED_DEAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  relatedEntity: 'QUOTE' | 'APPROVAL' | 'INVENTORY' | 'VENDOR' | 'NEGOTIATION' | 'LEAD';
  relatedId: string;
  actionRoute: string;
  timestamp: string;
}

export interface AnalyticsFilters {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  companyId?: string;
  salespersonId?: string;
  categoryId?: string;
  stage?: string;
  currency?: string;
}
