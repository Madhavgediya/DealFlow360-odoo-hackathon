import { QUOTE_STATUS_CONFIG, RISK_SEVERITY_CONFIG, DEAL_HEALTH_CONFIG } from '../constants/statuses';
import { QuoteStatus, RiskSeverity } from '../types/quote';

export function getQuoteStatusConfig(status: QuoteStatus) {
  return QUOTE_STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
}

export function getRiskSeverityConfig(severity: RiskSeverity) {
  return RISK_SEVERITY_CONFIG[severity] || { label: severity, badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' };
}

export function getDealHealthConfig(status: 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'CRITICAL') {
  return DEAL_HEALTH_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
}
