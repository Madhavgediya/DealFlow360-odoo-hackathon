import { create } from 'zustand';
import { AIChatMessage } from '../types/ai';

interface AIState {
  isOpen: boolean;
  messages: AIChatMessage[];
  isThinking: boolean;
  activeContextEntity?: {
    type: 'QUOTE' | 'CUSTOMER' | 'LEAD' | 'VENDOR' | 'APPROVAL';
    id: string;
    title: string;
  };
  openDrawer: (contextEntity?: { type: 'QUOTE' | 'CUSTOMER' | 'LEAD' | 'VENDOR' | 'APPROVAL'; id: string; title: string }) => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addMessage: (message: Omit<AIChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setThinking: (isThinking: boolean) => void;
}

const INITIAL_AI_MESSAGES: AIChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ASSISTANT',
    text: `Hello! I am your **DealFlow360 Copilot** powered by enterprise RAG.
I can analyze real-time quote risks, explain multi-tier approval bottlenecks, recommend optimal vendor procurement for inventory shortages, or compare negotiation revisions.

**Suggested queries:**
- *"Why is quote Q-1024 blocked in approval?"*
- *"Which vendor is best suited for the UltraBook Pro X1 stock shortage?"*
- *"Show all at-risk deals exceeding stalled time limit"*
- *"Suggest upsell accessories for Enterprise Server Cluster"*`,
    timestamp: new Date().toISOString(),
    confidenceScore: 98,
    suggestedActions: [
      {
        label: 'Inspect Blocked Quote Q-1024',
        actionType: 'NAVIGATE',
        payload: { quoteId: 'q-1024' },
        route: '/sales/quotes/q-1024',
      },
      {
        label: 'View Vendor Scorecards',
        actionType: 'NAVIGATE',
        payload: {},
        route: '/vendors',
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
