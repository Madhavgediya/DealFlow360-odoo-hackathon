export interface AISourceCitation {
  title: string;
  type: 'POLICY' | 'QUOTE_RISK' | 'REVISION_DIFF' | 'STOCK_AUDIT' | 'VENDOR_SCORE' | 'DEAL_HEALTH';
  referenceId?: string;
  excerpt: string;
}

export interface AIActionOption {
  label: string;
  actionType: 'NAVIGATE' | 'VIEW_RISK' | 'VIEW_APPROVAL' | 'VIEW_DIFF' | 'RUN_ALLOCATION';
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
}
