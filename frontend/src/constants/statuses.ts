export const QUOTE_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  TEAM_REVIEW: { label: 'In review', color: 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]' },
  RISK_CALCULATED: { label: 'Risk Calculated', color: 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]' },
  APPROVAL_REQUIRED: { label: 'Needs approval', color: 'bg-[#fef3e9] text-[#d97706] border-[#fde4cf]' },
  APPROVAL_IN_PROGRESS: { label: 'In Approval', color: 'bg-[#fef3e9] text-[#d97706] border-[#fde4cf]' },
  APPROVED: { label: 'Approved', color: 'bg-[#e8f7ee] text-[#16a34a] border-[#d1f2dd]' },
  CUSTOMER_NEGOTIATION: { label: 'Negotiation', color: 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]' },
  REAPPROVAL_REQUIRED: { label: 'Reapproval Req.', color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' },
  CONFIRMED: { label: 'Won', color: 'bg-[#e8f7ee] text-[#16a34a] border-[#d1f2dd]' },
  FULFILLMENT: { label: 'Fulfillment', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  SHIPPED: { label: 'Shipped', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  BILLED: { label: 'Invoiced', color: 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]' },
  PAID: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600 border-slate-200' },
} as const;

export const RISK_SEVERITY_CONFIG = {
  LOW: { label: 'Low Risk', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MEDIUM: { label: 'Medium Risk', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  HIGH: { label: 'High Risk', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  CRITICAL: { label: 'Critical Risk', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' },
} as const;

export const DEAL_HEALTH_CONFIG = {
  HEALTHY: { label: 'Healthy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  WATCH: { label: 'Watchlist', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  AT_RISK: { label: 'At Risk', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  CRITICAL: { label: 'Critical', color: 'bg-rose-50 text-rose-700 border-rose-200' },
} as const;
