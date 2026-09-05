import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Zap,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Workflow,
  Receipt,
  Boxes,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  ChevronRight,
  Server,
  Globe,
  Database,
  Printer,
  ChevronDown,
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function DocsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState('architecture');
  const [searchQuery, setSearchQuery] = React.useState('');

  const sections: DocSection[] = [
    {
      id: 'architecture',
      title: '1. Executive Architecture & Tech Stack',
      badge: 'Core Platform',
      icon: <Cpu className="w-4 h-4 text-[#714b67]" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>DealFlow360</strong> is an enterprise B2B Deal Operating System and Configure-Price-Quote (CPQ) ERP platform engineered for high-velocity enterprise sales organizations. Built with a decoupled modern architecture combining a reactive frontend with high-performance transactional micro-services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#714b67] uppercase font-mono">
                <Code2 className="w-4 h-4" /> Frontend Tier
              </div>
              <p className="text-xs text-slate-600">
                React 19, TypeScript 5, Vite build system, Tailwind CSS v4, Zustand global stores, Lucide icons, and Sonner notifications.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#714b67] uppercase font-mono">
                <Server className="w-4 h-4" /> Backend Tier
              </div>
              <p className="text-xs text-slate-600">
                Node.js & Express.js REST APIs with robust error handling, JSON data persistence, JWT auth, and modular route controllers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#714b67] uppercase font-mono">
                <Database className="w-4 h-4" /> Data & AI Services
              </div>
              <p className="text-xs text-slate-600">
                Multi-currency exchange matrix, dynamic tax compliance engine (GST/VAT), RAG AI vector context scoring, and audit log tracking.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-5 font-mono text-xs overflow-x-auto space-y-2">
            <div className="text-slate-400 font-bold">// End-to-End System Topology</div>
            <pre className="text-emerald-400">
{`Client Browser (React 19 + TypeScript + Zustand + AuthGuard)
       │
       ▼ HTTPS REST API (Port 5050)
Express.js API Gateway (CORS, Rate Limiting, JWT Verification)
       │
       ├── /api/auth          --> RBAC Permissions, Session Tokens, User Profiles
       ├── /api/quotes        --> CPQ Calculation Engine, Line Pricing, Margin Floor Check
       ├── /api/approvals     --> Multi-Tier Discount Escalation Chain
       ├── /api/products      --> Catalog, Tiered Pricing, Warehouse Stock
       ├── /api/inventory     --> Multi-Warehouse Allocations, PO Replenishment
       ├── /api/billing       --> Tax Invoicing, Payment Ledger, A4 Layout Engine
       └── /api/ai            --> RAG Vector Copilot, Deal Risk Analytics`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: 'rbac',
      title: '2. Role-Based Access Control (RBAC) & Security',
      badge: 'Security & Auth',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            DealFlow360 enforces an enterprise-grade <strong>Zero-Trust Permission Matrix</strong>. Every route, API endpoint, navigation group, costing column, and action button is conditionally rendered and protected according to the authenticated user's role and granular permissions.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                <tr>
                  <th className="p-3">Role Code</th>
                  <th className="p-3">Title / Persona</th>
                  <th className="p-3">Costing & Margins</th>
                  <th className="p-3">Discount Overrides</th>
                  <th className="p-3">Core Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="p-3 font-mono font-bold text-slate-800">ADMIN</td>
                  <td className="p-3">System Administrator</td>
                  <td className="p-3 text-emerald-600 font-semibold">Full Visibility</td>
                  <td className="p-3 text-emerald-600 font-semibold">Unlimited (100%)</td>
                  <td className="p-3 text-slate-600">Full system governance, user credentials provisioning, platform logs</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-slate-800">SALES_MANAGER</td>
                  <td className="p-3">Sales Director / VP</td>
                  <td className="p-3 text-emerald-600 font-semibold">Full Visibility</td>
                  <td className="p-3 text-amber-600 font-semibold">Up to 25% Overrides</td>
                  <td className="p-3 text-slate-600">Pipeline review, discount approvals, team quota tracking, deals health</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-slate-800">SALES_REP</td>
                  <td className="p-3">Account Executive</td>
                  <td className="p-3 text-slate-400">Masked Cost</td>
                  <td className="p-3 text-slate-500">Standard Tier (≤10%)</td>
                  <td className="p-3 text-slate-600">Quote creation, CRM leads qualification, customer negotiations</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-slate-800">FINANCE</td>
                  <td className="p-3">Finance & Billing Lead</td>
                  <td className="p-3 text-emerald-600 font-semibold">Full Visibility</td>
                  <td className="p-3 text-emerald-600 font-semibold">Floor Authority</td>
                  <td className="p-3 text-slate-600">Tax invoices, payment recording, receivables, discount escalation veto</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-slate-800">OPERATIONS</td>
                  <td className="p-3">Logistics & Supply Chain</td>
                  <td className="p-3 text-slate-600">Inventory Units Only</td>
                  <td className="p-3 text-slate-400">No Authority</td>
                  <td className="p-3 text-slate-600">Multi-warehouse stock reservation, purchase orders, shipments</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-slate-800">CUSTOMER</td>
                  <td className="p-3">Client Portal Buyer</td>
                  <td className="p-3 text-slate-400">Public Retail Only</td>
                  <td className="p-3 text-slate-400">No Authority</td>
                  <td className="p-3 text-slate-600">Dedicated B2B self-service portal, quote review, counter-offers, sign</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Automated Route Protection Guard
            </div>
            <p>
              Every internal route is wrapped in <code className="bg-amber-100/70 px-1.5 py-0.5 rounded text-amber-950 font-mono">ProtectedRoute</code>. Unauthenticated visitors are instantly redirected to <code className="bg-amber-100/70 px-1.5 py-0.5 rounded text-amber-950 font-mono">/login</code> with redirect memory, and unauthorized role requests (such as a Sales Rep accessing <code className="bg-amber-100/70 px-1.5 py-0.5 rounded text-amber-950 font-mono">/settings/users</code>) are blocked.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'cpq',
      title: '3. Intelligent CPQ & Margin Governance Engine',
      badge: 'CPQ Core',
      icon: <DollarSign className="w-4 h-4 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            The DealFlow360 <strong>Configure-Price-Quote (CPQ) engine</strong> protects gross margin integrity while providing sales representatives with dynamic pricing flexibilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 font-display flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-Time Margin Calculations
              </h4>
              <p className="text-slate-600 leading-relaxed">
                As line items, quantities, volume tiers, and custom discounts are adjusted, the CPQ engine continuously executes:
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                Gross Margin % = ((Net Unit Price - Unit Cost) / Net Unit Price) × 100
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 font-display flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" /> Negative Margin Blocking
              </h4>
              <p className="text-slate-600 leading-relaxed">
                If an entered price is less than or equal to unit product cost ($Price \le Cost$), the system displays a hard blocker alert and disables quotation submission until resolved.
              </p>
              <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-mono text-[11px] text-rose-800">
                BLOCK: Price (₹12,000) &lt; Base Cost (₹14,500)
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 font-display">Multi-Currency & Exchange Normalization</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              DealFlow360 supports seamless real-time currency conversions across <strong>USD ($), EUR (€), GBP (£), INR (₹), AED (AED), and JPY (¥)</strong>. Line items maintain both source transactional currency and normalized corporate reporting currency.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'workflows',
      title: '4. Commercial Deal Lifecycle & Approvals Chain',
      badge: 'Workflows',
      icon: <Workflow className="w-4 h-4 text-purple-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            From initial customer engagement to cash settlement, DealFlow360 orchestrates the full enterprise commercial lifecycle:
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="w-6 h-6 rounded-full bg-[#714b67] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <div>
                <strong className="text-slate-900 block text-sm">Lead Qualification & Conversion</strong>
                <p className="text-slate-600 mt-0.5">Sales reps track inbound leads in Kanban or List view with AI lead scoring. Qualifying a lead automatically provisions a formal Customer Account and draft Quotation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="w-6 h-6 rounded-full bg-[#714b67] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <div>
                <strong className="text-slate-900 block text-sm">Interactive Quote Building & Margin Audit</strong>
                <p className="text-slate-600 mt-0.5">Add line items with quantity tiers, optional add-on products, and custom discount percentages. Real-time margin audit warns if margin falls below the corporate hurdle (18%).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="w-6 h-6 rounded-full bg-[#714b67] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <div>
                <strong className="text-slate-900 block text-sm">Multi-Tier Approval Escalation</strong>
                <p className="text-slate-600 mt-0.5">Discounts &gt;15% route to Sales Manager. Discounts &gt;25% or Margin &lt;15% require dual escalation to Finance Director with AI Risk Analysis.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="w-6 h-6 rounded-full bg-[#714b67] text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
              <div>
                <strong className="text-slate-900 block text-sm">Customer Portal Negotiation & Digital E-Sign</strong>
                <p className="text-slate-600 mt-0.5">Client accesses secure portal to view live quotation, submit counter-offers with visual diff comparisons, or accept with digital signature timestamping.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="w-6 h-6 rounded-full bg-[#714b67] text-white flex items-center justify-center font-bold text-xs shrink-0">5</span>
              <div>
                <strong className="text-slate-900 block text-sm">Order Confirmation, Invoicing & Outbound Fulfillment</strong>
                <p className="text-slate-600 mt-0.5">Automated conversion to Sales Order generates compliant A4 Tax Invoices, records payment settlements (Bank Transfer, Credit Card, UPI), and triggers warehouse dispatch.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'ai',
      title: '5. RAG AI Deal Intelligence & Copilot',
      badge: 'AI Engine',
      icon: <Sparkles className="w-4 h-4 text-[#714b67]" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            The integrated <strong>RAG AI Copilot</strong> leverages contract repositories, historical win-rate records, and live catalog pricing to provide contextual deal coaching and risk scoring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#714b67]" /> Deal Risk & Churn Predictor
              </div>
              <p className="text-slate-600 leading-relaxed">
                Calculates deal composite health scores based on discount aggressiveness, client payment history, contract duration, and competitor benchmarking.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" /> Vector Contract RAG Retrieval
              </div>
              <p className="text-slate-600 leading-relaxed">
                Allows natural language queries like <em>"What is our maximum permitted discount for public sector clients?"</em> and retrieves verified corporate policy excerpts.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'printing',
      title: '6. A4 Commercial Document Print & PDF Architecture',
      badge: 'Document Engine',
      icon: <Printer className="w-4 h-4 text-emerald-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            DealFlow360 includes a precision-engineered <strong>Print Isolation Engine</strong> designed for corporate B2B compliance:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 font-display">Print Isolation Stylesheet Features</h4>
              <ul className="space-y-2 text-slate-600 list-disc list-inside">
                <li><strong>Zero Application Clutter:</strong> Automatically hides sidebars, topbars, buttons, and action controls via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">@media print</code> rules.</li>
                <li><strong>Standard A4 Portrait Alignment:</strong> Configured with exact 12mm print margins to eliminate unwanted blank second pages.</li>
                <li><strong>Tax & Legal Compliance:</strong> Full company GSTIN / VAT registration details, bank wire instructions, line-item HSN codes, and digital signature boxes.</li>
                <li><strong>Client Ready:</strong> Supports instant browser PDF export (<kbd className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-mono">Ctrl+P</kbd> or 1-click Print Button).</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'api',
      title: '7. Comprehensive REST API Reference',
      badge: 'API Blueprint',
      icon: <Globe className="w-4 h-4 text-indigo-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            All capabilities in DealFlow360 are backed by clean, RESTful API endpoints available at base URL <code className="bg-slate-100 px-2 py-1 rounded text-[#714b67] font-mono text-xs">http://localhost:5050/api</code>:
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-2.5">Method</th>
                  <th className="p-2.5">Endpoint</th>
                  <th className="p-2.5 font-sans">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/auth/login</td>
                  <td className="p-2.5 font-sans text-slate-600">Authenticate user credentials and return session JWT</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/auth/register</td>
                  <td className="p-2.5 font-sans text-slate-600">Register new employee or client account</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                  <td className="p-2.5">/api/quotes</td>
                  <td className="p-2.5 font-sans text-slate-600">List commercial quotations with filters</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/quotes</td>
                  <td className="p-2.5 font-sans text-slate-600">Create new quotation with line items & margin audit</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-amber-600 font-bold">PUT</td>
                  <td className="p-2.5">/api/quotes/:id</td>
                  <td className="p-2.5 font-sans text-slate-600">Update quotation lines, discounts or status</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                  <td className="p-2.5">/api/approvals</td>
                  <td className="p-2.5 font-sans text-slate-600">List pending approval requests for manager/finance</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/approvals/:id/decide</td>
                  <td className="p-2.5 font-sans text-slate-600">Approve or reject discount escalation</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                  <td className="p-2.5">/api/products</td>
                  <td className="p-2.5 font-sans text-slate-600">List product catalog with base pricing and stock</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                  <td className="p-2.5">/api/billing/invoices</td>
                  <td className="p-2.5 font-sans text-slate-600">List tax invoices and payment settlement status</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/ai/deal-coach</td>
                  <td className="p-2.5 font-sans text-slate-600">Execute RAG AI risk scoring and discount advice</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#1e293b] font-sans selection:bg-[#714b67] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <BrandLogo size="md" />
            </div>
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-[#714b67]" />
              <span>Developer & Architecture Documentation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Landing Page
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
            >
              Launch ERP <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Docs Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Badge className="bg-[#714b67] text-white border-0 text-xs font-mono uppercase tracking-wider">
            Enterprise Technical Manual
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display">
            DealFlow360 System Architecture & Specifications
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            In-depth documentation covering platform architecture, Role-Based Access Control (RBAC), the Configure-Price-Quote (CPQ) calculation engine, multi-tier approval chains, and REST API integration endpoints.
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search architecture, permissions, APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#714b67]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-2 sticky top-24 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 mb-2">
              Table of Contents
            </p>
            <nav className="space-y-1">
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeSection === sec.id
                      ? 'bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {sec.icon}
                    <span className="truncate">{sec.title.split('. ')[1] || sec.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {filteredSections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className={`p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6 scroll-mt-24 ${
                  activeSection === sec.id ? 'ring-2 ring-[#714b67]/20 border-[#714b67]/40' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      {sec.icon}
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#1e293b] font-display">
                        {sec.title}
                      </h2>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono bg-slate-50">
                    {sec.badge}
                  </Badge>
                </div>

                <div>{sec.content}</div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-xs text-slate-500 text-center font-sans mt-12">
        <p>© 2026 DealFlow360 Technologies Pvt Ltd • Enterprise Deal Operating System</p>
      </footer>
    </div>
  );
}
