import { create } from 'zustand';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;
  target: string; // CSS selector or data-tour attribute (e.g. '[data-tour="brand-logo"]')
  title: string;
  badge?: string;
  description: string;
  placement: TourPlacement;
  route?: string;
  actionHint?: string;
}

export const SUPERADMIN_STEPS: TourStep[] = [
  {
    id: 'superadmin-intro',
    target: '[data-tour="brand-logo"]',
    title: 'DealFlow360 Multi-Tenant Engine',
    badge: 'Superadmin Orchestrator',
    description: 'Welcome to the omnipotent control plane. From here, you govern enterprise tenant companies, global credentials, and multi-company pricing models.',
    placement: 'bottom',
    route: '/superadmin/dashboard',
    actionHint: 'Platform Master Architecture',
  },
  {
    id: 'superadmin-master-hub',
    target: '[data-tour="superadmin-hub"]',
    title: 'Tenant Companies Master Desk',
    badge: 'Enterprise Isolation',
    description: 'Provision new tenant companies, configure business models (Product, Service, or Hybrid), generate secure admin credentials, and toggle tenant states.',
    placement: 'right',
    route: '/superadmin/dashboard',
    actionHint: '1-Click Tenant Provisioning',
  },
  {
    id: 'superadmin-quotes-stream',
    target: '[data-tour="platform-quotes-tab"]',
    title: 'Platform-Wide Quotations & Deal Desk',
    badge: 'Live INR Stream',
    description: 'Direct visibility into all commercial proposals and wholesale bids generated across every tenant company on the platform in real time.',
    placement: 'bottom',
    route: '/superadmin/dashboard',
    actionHint: 'Cross-Tenant Revenue Visibility',
  },
  {
    id: 'superadmin-ai-copilot',
    target: '[data-tour="ai-copilot-trigger"]',
    title: 'RAG AI Deal Copilot',
    badge: 'AI Intelligence',
    description: 'Query platform health, extract clause anomaly insights, and get instant explanations for margin compression and discount approvals.',
    placement: 'bottom',
    actionHint: 'Instant Enterprise Insights',
  },
  {
    id: 'superadmin-profile',
    target: '[data-tour="user-profile-menu"]',
    title: 'Superadmin Profile & Quick Switch',
    badge: 'Identity',
    description: 'Manage root security credentials, inspect active JWT sessions, or sign out.',
    placement: 'bottom',
    actionHint: 'Root Security Management',
  },
];

export const ADMIN_SALES_STEPS: TourStep[] = [
  {
    id: 'admin-intro',
    target: '[data-tour="brand-logo"]',
    title: 'DealFlow360 CPQ & Operations',
    badge: 'Commercial ERP',
    description: 'Welcome to your unified commercial workspace. Manage leads, configure complex multi-line quotes in INR (₹), and accelerate deal closing.',
    placement: 'bottom',
    route: '/dashboard',
    actionHint: 'Unified Commercial Workspace',
  },
  {
    id: 'admin-quotes',
    target: '[data-tour="nav-quotes"]',
    title: 'Commercial Quotations & CPQ Builder',
    badge: 'Core Engine',
    description: 'Build high-margin proposals, add products, adjust discount tiers, and let the real-time Risk Assessment engine audit your margins.',
    placement: 'right',
    route: '/sales/quotes',
    actionHint: 'Create & Manage Quotations',
  },
  {
    id: 'admin-negotiations',
    target: '[data-tour="nav-negotiations"]',
    title: 'Live Negotiation Deal Desk',
    badge: 'Deal Closer',
    description: 'Negotiate concessions with buyers and retailers. Inspect side-by-side revision diffs with instant gross margin impact calculations.',
    placement: 'right',
    route: '/sales/negotiations',
    actionHint: 'Live Reapproval & Revision Diffs',
  },
  {
    id: 'admin-leads',
    target: '[data-tour="nav-leads"]',
    title: 'Leads & Commercial Pipeline',
    badge: 'CRM Pipeline',
    description: 'Track inbound prospects, log sales interactions, and generate commercial quotes directly from any qualified lead in 1 click.',
    placement: 'right',
    route: '/crm/leads',
    actionHint: '1-Click Lead-to-Quote Conversion',
  },
  {
    id: 'admin-approvals',
    target: '[data-tour="nav-approvals"]',
    title: 'Executive Approvals Queue',
    badge: 'Governance',
    description: 'Review discount threshold breaches, margin flags, and high-risk deals with full audit explainability and 1-click approvals.',
    placement: 'right',
    route: '/approvals',
    actionHint: 'Automated Governance Desk',
  },
  {
    id: 'admin-ai-copilot',
    target: '[data-tour="ai-copilot-trigger"]',
    title: 'RAG AI Deal Copilot',
    badge: 'AI Assistant',
    description: 'Ask AI Copilot for win-rate predictions, optimal discount suggestions, and customer risk telemetry anytime.',
    placement: 'bottom',
    actionHint: 'AI Deal Intelligence',
  },
];

export const RETAILER_STEPS: TourStep[] = [
  {
    id: 'retailer-intro',
    target: '[data-tour="brand-logo"]',
    title: 'B2B Wholesale Retailer Portal',
    badge: 'Dealer Network',
    description: 'Welcome to your dedicated B2B partner workspace. Access wholesale catalog pricing, manage credit lines, and request volume quotes.',
    placement: 'bottom',
    route: '/retailer/dashboard',
    actionHint: 'Certified B2B Dealer Network',
  },
  {
    id: 'retailer-credit-info',
    target: '[data-tour="retailer-credit-banner"]',
    title: 'Revolving Credit & Dealer Tier',
    badge: 'Wholesale Financing',
    description: 'Real-time visibility into your approved credit limit, available settlement balance in ₹ INR, and your tiered wholesale discount rate.',
    placement: 'bottom',
    route: '/retailer/dashboard',
    actionHint: 'Instant Credit Telemetry',
  },
  {
    id: 'retailer-quotes-desk',
    target: '[data-tour="retailer-nav-quotes"]',
    title: 'B2B Wholesale Quotations',
    badge: 'Volume Pricing',
    description: 'Submit custom bulk volume bids, negotiate terms directly with the company sales desk, and convert approved quotes to purchase orders.',
    placement: 'bottom',
    route: '/retailer/quotes',
    actionHint: 'Bulk Volume Bidding',
  },
  {
    id: 'retailer-catalog-desk',
    target: '[data-tour="retailer-nav-catalog"]',
    title: 'Wholesale Product Catalog',
    badge: 'Stock & Pricing',
    description: 'Browse available hardware and services with your pre-negotiated wholesale dealer tier discount applied automatically.',
    placement: 'bottom',
    route: '/retailer/catalog',
    actionHint: 'Browse Discounted Wholesale Catalog',
  },
];

interface TourState {
  isActive: boolean;
  currentStepIndex: number;
  activeRole: string;
  steps: TourStep[];
  startTour: (role?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: (userId?: string) => void;
  completeTour: (userId?: string) => void;
  isCompletedForUser: (userId?: string) => boolean;
  checkAndAutoStart: (userId?: string, role?: string) => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,
  activeRole: 'ADMIN',
  steps: ADMIN_SALES_STEPS,

  startTour: (role?: string) => {
    let chosenSteps = ADMIN_SALES_STEPS;
    const normalizedRole = (role || 'ADMIN').toUpperCase();
    if (normalizedRole.includes('SUPER')) {
      chosenSteps = SUPERADMIN_STEPS;
    } else if (normalizedRole.includes('RETAIL') || normalizedRole.includes('CUSTOMER')) {
      chosenSteps = RETAILER_STEPS;
    } else {
      chosenSteps = ADMIN_SALES_STEPS;
    }

    set({
      isActive: true,
      currentStepIndex: 0,
      activeRole: normalizedRole,
      steps: chosenSteps,
    });
  },

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      get().completeTour();
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  goToStep: (index: number) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStepIndex: index, isActive: true });
    }
  },

  skipTour: (userId?: string) => {
    if (userId) {
      try {
        localStorage.setItem(`dealflow360_tour_dismissed_${userId}`, 'true');
      } catch (e) {}
    }
    set({ isActive: false });
  },

  completeTour: (userId?: string) => {
    if (userId) {
      try {
        localStorage.setItem(`dealflow360_tour_completed_${userId}`, 'true');
      } catch (e) {}
    }
    set({ isActive: false });
  },

  isCompletedForUser: (userId?: string) => {
    if (!userId) return false;
    try {
      return (
        localStorage.getItem(`dealflow360_tour_completed_${userId}`) === 'true' ||
        localStorage.getItem(`dealflow360_tour_dismissed_${userId}`) === 'true'
      );
    } catch (e) {
      return false;
    }
  },

  checkAndAutoStart: (userId?: string, role?: string) => {
    if (!userId) return;
    const isDone = get().isCompletedForUser(userId);
    if (!isDone) {
      setTimeout(() => {
        get().startTour(role);
      }, 700);
    }
  },
}));
