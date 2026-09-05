export interface AISourceCitation {
  title: string;
  type: 'POLICY' | 'QUOTE_RISK' | 'REVISION_DIFF' | 'STOCK_AUDIT' | 'VENDOR_SCORE' | 'DEAL_HEALTH';
  referenceId?: string;
  excerpt: string;
}

export interface AIActionOption {
  label: string;
  actionType: 'NAVIGATE' | 'VIEW_RISK' | 'VIEW_APPROVAL' | 'VIEW_DIFF' | 'RUN_ALLOCATION' | 'TRIGGER_ACTION';
  payload: Record<string, any>;
  route?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  text: string;
  timestamp: string;
  sources?: AISourceCitation[];
  dataUsed?: Record<string, any>;
  confidenceScore?: number; // 0-100
  suggestedActions?: AIActionOption[];
  followUpQuestions?: string[]; // Dynamic questions RAG poses back to the user
  changeContext?: {
    entityType: string;
    entityId: string;
    action?: string;
    beforeState?: any;
    afterState?: any;
    reason?: string;
    diffs?: { field: string; oldValue: any; newValue: any }[];
  };
  metrics?: Record<string, string | number>;
}

export interface DynamicChangeRecord {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string;
  userRole: string;
  beforeState?: any;
  afterState?: any;
  reason?: string;
  createdAt: string;
  aiImpactSummary: string;
}

export interface WhatIfSimulationResult {
  simulationType: 'MARGIN' | 'INVENTORY' | 'GENERAL';
  revenue?: number;
  totalCost?: number;
  grossProfit?: number;
  marginPercent?: number;
  requiresApproval?: boolean;
  thresholds?: {
    maxRepDiscount: number;
    hurdleMargin: number;
  };
  recommendation?: string;
  followUpQuestions?: string[];
  inventoryImpact?: {
    stockAvailableBefore: number;
    stockAvailableAfter: number;
    shortageQuantity: number;
    recommendedWarehouse?: string;
  };
}
