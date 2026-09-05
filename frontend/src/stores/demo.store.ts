import { create } from 'zustand';
import { UserRole } from '../types/auth';

export interface DemoStep {
  stepNumber: number;
  title: string;
  badge: string;
  description: string;
  recommendedRole: UserRole;
  route: string;
  highlightActionText: string;
}

export const HERO_DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: '1. Lead Qualification',
    badge: 'CRM',
    description: 'Review inbound enterprise lead "Quantum Cloud Corp" with high budget and AI lead score of 94.',
    recommendedRole: 'SALES_REP',
    route: '/crm/leads/lead-101',
    highlightActionText: 'Click "Convert Lead" in top right',
  },
  {
    stepNumber: 2,
    title: '2. Customer Conversion & 7-Day Trial',
    badge: 'CONVERSION',
    description: 'Complete 5-step wizard to create customer, activate 7-day trial subscription, and grant Portal Access.',
    recommendedRole: 'SALES_REP',
    route: '/crm/leads/lead-101',
    highlightActionText: 'Complete Wizard steps and Submit',
  },
  {
    stepNumber: 3,
    title: '3. Customer Portal Experience',
    badge: 'PORTAL',
    description: 'Switch to isolated Customer Portal. View product catalog, customize items, and request a quotation.',
    recommendedRole: 'CUSTOMER',
    route: '/portal/products',
    highlightActionText: 'Add products and click "Request Quotation"',
  },
  {
    stepNumber: 4,
    title: '4. Enterprise Quote Builder & Risk Engine',
    badge: 'QUOTES',
    description: 'Switch back to ERP. Build Quote Q-1024 with line items. Increase discount to 18% to trigger real-time Risk Engine.',
    recommendedRole: 'SALES_REP',
    route: '/sales/quotes/q-1024',
    highlightActionText: 'Inspect Live Risk Breakdown and click "Submit for Approval"',
  },
  {
    stepNumber: 5,
    title: '5. Dynamic Approval Chain Review',
    badge: 'APPROVALS',
    description: 'Switch to Sales Director / CFO persona. Review the Explainability Panel ("Why is this risky?") and Approve.',
    recommendedRole: 'SALES_MANAGER',
    route: '/approvals/appr-1024',
    highlightActionText: 'Click "Approve Quote" with audit notes',
  },
  {
    stepNumber: 6,
    title: '6. Customer Negotiation & Reapproval Trigger',
    badge: 'NEGOTIATION',
    description: 'Customer requests higher quantity & extra discount. Side-by-side diff highlights margin drop and triggers Reapproval.',
    recommendedRole: 'SALES_REP',
    route: '/sales/negotiations/q-1024',
    highlightActionText: 'Inspect Side-by-Side Diff and Revision History',
  },
  {
    stepNumber: 7,
    title: '7. Inventory Allocation & Shortage Detection',
    badge: 'INVENTORY',
    description: 'Quote confirmed! System checks stock across 4 warehouses (Surat, Rajkot, Mumbai) and detects a 15-unit shortage.',
    recommendedRole: 'WAREHOUSE_MANAGER',
    route: '/inventory/stock',
    highlightActionText: 'Inspect Warehouse Stock Breakdown',
  },
  {
    stepNumber: 8,
    title: '8. Vendor Intelligence & Purchase Order',
    badge: 'VENDORS',
    description: 'Compare 3 vendors side-by-side. AI recommends Vendor B based on 2-day lead time & 99% reliability. Generate PO.',
    recommendedRole: 'PROCUREMENT_LEAD',
    route: '/vendors/compare/prod-1',
    highlightActionText: 'Select Recommended Vendor and Generate PO',
  },
  {
    stepNumber: 9,
    title: '9. Fulfillment & Shipment Tracking',
    badge: 'LOGISTICS',
    description: 'Fulfillment plan consolidates warehouse stock + vendor PO. Generate shipment with live carrier milestone timeline.',
    recommendedRole: 'WAREHOUSE_MANAGER',
    route: '/shipping/ship-101',
    highlightActionText: 'View Shipment Tracking Milestones',
  },
  {
    stepNumber: 10,
    title: '10. Invoicing & Subscription Proration',
    badge: 'BILLING',
    description: 'Generate commercial invoice, record payment, and track 7-day trial to active paid SaaS subscription conversion.',
    recommendedRole: 'FINANCE_DIRECTOR',
    route: '/billing/invoices/inv-1024',
    highlightActionText: 'Record Payment & View Subscription Schedule',
  },
  {
    stepNumber: 11,
    title: '11. Deal Health & AI Copilot Analysis',
    badge: 'AI COPILOT',
    description: 'Open Deal Health command center to view anomaly alerts. Ask AI Copilot why the deal had margin compression.',
    recommendedRole: 'ADMIN',
    route: '/deal-health',
    highlightActionText: 'Open AI Assistant Drawer via Top Bar',
  },
];

interface DemoState {
  isTourActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isTourActive: true,
  currentStepIndex: 0,
  startTour: () => set({ isTourActive: true, currentStepIndex: 0 }),
  stopTour: () => set({ isTourActive: false }),
  nextStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex < HERO_DEMO_STEPS.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },
  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },
  goToStep: (index: number) => {
    if (index >= 0 && index < HERO_DEMO_STEPS.length) {
      set({ currentStepIndex: index, isTourActive: true });
    }
  },
}));
