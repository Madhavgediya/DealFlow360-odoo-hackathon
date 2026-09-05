import { create } from 'zustand';
import { AIChatMessage } from '../types/ai';

export interface AIActiveContext {
  type: 'QUOTE' | 'CUSTOMER' | 'LEAD' | 'VENDOR' | 'APPROVAL' | 'PRODUCT' | 'INVENTORY' | 'INVOICE' | 'AUDIT';
  id: string;
  title: string;
  diffs?: { field: string; oldValue: any; newValue: any }[];
  metadata?: Record<string, any>;
}

interface AIState {
  isOpen: boolean;
  messages: AIChatMessage[];
  isThinking: boolean;
  activeContextEntity?: AIActiveContext;
  openDrawer: (contextEntity?: AIActiveContext) => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setContextEntity: (contextEntity?: AIActiveContext) => void;
  clearContextEntity: () => void;
  addMessage: (message: Omit<AIChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setThinking: (isThinking: boolean) => void;
}

const INITIAL_AI_MESSAGES: AIChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ASSISTANT',
    text: `Hello! I am your **DealFlow360 Copilot** powered by enterprise dynamic RAG.
I monitor real-time changes across your pipeline, inspect live quote margins and approval bottlenecks, analyze warehouse inventory, and guide next operational moves.

**Suggested queries:**
- *"What recent changes were logged in the audit trail?"*
- *"Why is quote Q-1024 blocked in approval?"*
- *"Which vendor is best suited for the UltraBook stock shortage?"*
- *"Show all at-risk deals exceeding stalled time limit"*`,
    timestamp: new Date().toISOString(),
    confidenceScore: 98,
    followUpQuestions: [
      'Would you like to review recent changes across quotes and approvals?',
      'Do you want to run a deal health scan to find margin violations?',
      'Should I check inventory availability across Mumbai and Bengaluru?'
    ],
    suggestedActions: [
      {
        label: 'Inspect Blocked Quote Q-1024',
        actionType: 'NAVIGATE',
        payload: { quoteId: 'q-1024' },
        route: '/sales/quotes/q-1024',
      },
      {
        label: 'Open AI Copilot Hub',
        actionType: 'NAVIGATE',
        payload: {},
        route: '/ai-copilot',
      },
    ],
  },
];

export const useAIStore = create<AIState>((set) => ({
  isOpen: false,
  messages: INITIAL_AI_MESSAGES,
  isThinking: false,
  activeContextEntity: undefined,
  openDrawer: (contextEntity) => set({ isOpen: true, activeContextEntity: contextEntity }),
  closeDrawer: () => set({ isOpen: false }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  setContextEntity: (contextEntity) => set({ activeContextEntity: contextEntity }),
  clearContextEntity: () => set({ activeContextEntity: undefined }),
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  clearMessages: () => set({ messages: INITIAL_AI_MESSAGES }),
  setThinking: (isThinking) => set({ isThinking }),
}));
