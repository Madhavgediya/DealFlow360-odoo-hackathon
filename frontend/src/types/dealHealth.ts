import { RiskSeverity } from './quote';

export interface DealHealthItem {
  id: string;
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  stage: string;
  healthScore: number; // 0-100 (100 = perfect, < 50 = critical)
  healthStatus: 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'CRITICAL';
  totalValue: number;
  grossMarginPercentage: number;
  deliveryRisk: RiskSeverity;
  vendorRisk: RiskSeverity;
  stalledDays: number;
  lastActivity: string;
  anomalyTitle: string;
  anomalyDescription: string;
  recommendedAction: string;
}

export interface DealHealthOverview {
  healthyCount: number;
  watchCount: number;
  atRiskCount: number;
  criticalCount: number;
  totalDealsTracked: number;
  averageHealthScore: number;
  atRiskRevenue: number;
  deals: DealHealthItem[];
}
