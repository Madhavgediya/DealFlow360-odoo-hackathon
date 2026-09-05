import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAIStore } from '../../stores/ai.store';
import { aiApi } from '../../services/api/ai.api';
import { quotesApi } from '../../services/api/quotes.api';
import { inventoryApi } from '../../services/api/inventory.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Sparkles,
  Send,
  Bot,
  User,
  BookOpen,
  ArrowRight,
  Loader2,
  HelpCircle,
  Clock,
  AlertTriangle,
  Layers,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sliders,
  TrendingUp,
  FileText,
  Building,
} from 'lucide-react';
import { formatTimeAgo, formatDateTime } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { cn } from '../../utils/formatting';
import { useNavigate } from 'react-router-dom';

type ActiveTab = 'CHAT' | 'CHANGES' | 'RISKS' | 'SIMULATOR';

export function AICopilotPage() {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('CHAT');
  const { messages, addMessage, isThinking, setThinking, activeContextEntity, setContextEntity } = useAIStore();
  const [chatInput, setChatInput] = React.useState('');
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // What-If Simulation State
  const [simBasePrice, setSimBasePrice] = React.useState<number>(128000);
  const [simDiscount, setSimDiscount] = React.useState<number>(15);
  const [simCost, setSimCost] = React.useState<number>(85000);
  const [simQuantity, setSimQuantity] = React.useState<number>(10);
  const [simResult, setSimResult] = React.useState<any>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  // Queries for real-time changes and risks
  const { data: changesData, isLoading: changesLoading, refetch: refetchChanges } = useQuery({
    queryKey: ['ai-dynamic-changes'],
    queryFn: () => aiApi.getDynamicChanges(),
  });

  const { data: quotesData } = useQuery({
    queryKey: ['quotes-ai-sentinel'],
    queryFn: () => quotesApi.getQuotes(),
  });

  const { data: stockData } = useQuery({
    queryKey: ['stock-ai-sentinel'],
    queryFn: () => inventoryApi.getStockItems(),
  });

  React.useEffect(() => {
    if (activeTab === 'CHAT') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isThinking]);

  // Run simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await aiApi.simulateWhatIf({
        basePrice: simBasePrice,
        discountPercent: simDiscount,
        unitCost: simCost,
        quantity: simQuantity,
      });
      if (res.success && res.data) {
        setSimResult(res.data);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  // Initial simulation run
  React.useEffect(() => {
    handleRunSimulation();
  }, []);

  const handleSendMessage = async (text?: string) => {
    const prompt = text || chatInput.trim();
    if (!prompt || isThinking) return;

    setChatInput('');
    addMessage({
      sender: 'USER',
      text: prompt,
    });

    setThinking(true);
    try {
      const res = await aiApi.sendMessage(prompt, activeContextEntity);
      if (res.success && res.data) {
        addMessage(res.data);
      }
    } catch (err) {
      addMessage({
        sender: 'ASSISTANT',
        text: 'Apologies, I encountered an issue retrieving live data from the RAG store.',
      });
    } finally {
      setThinking(false);
    }
  };

  const changes = changesData?.data || [];
  const atRiskQuotes = (quotesData?.data || []).filter(
    (q) => (q.riskAssessment?.overallScore || 0) >= 55 || q.status === 'APPROVAL_REQUIRED' || q.status === 'REAPPROVAL_REQUIRED'
  );
  const lowStockItems = (stockData?.data || []).filter(
    (s) => s.quantityAvailable <= s.reorderPoint
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#714b67] via-[#5b3852] to-[#3d2336] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                DealFlow360 RAG AI Intelligence Hub
              </h1>
            </div>
            <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
              Real-time context-grounded reasoning across live CRM opportunities, dynamic quote margins, warehouse stock, and immutable change logs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-2xl text-xs font-mono text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostgreSQL RAG Connected</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none',
              activeTab === 'CHAT'
                ? 'bg-white text-[#714b67] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            <Bot className="w-4 h-4" />
            <span>Interactive RAG Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('CHANGES')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none relative',
              activeTab === 'CHANGES'
                ? 'bg-white text-[#714b67] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>Live Change Monitor & Explainer</span>
            {changes.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 text-white font-mono">
                {changes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('RISKS')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none',
              activeTab === 'RISKS'
                ? 'bg-white text-[#714b67] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Deal Risk & Anomaly Sentinel</span>
            {atRiskQuotes.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-mono">
                {atRiskQuotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none',
              activeTab === 'SIMULATOR'
                ? 'bg-white text-[#714b67] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            <Calculator className="w-4 h-4" />
            <span>What-If Simulation Lab</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: INTERACTIVE RAG CHAT */}
      {activeTab === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Stream (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Context bar */}
            {activeContextEntity && (
              <div className="px-4 py-2.5 bg-[#f5eff3] border-b border-[#ecdfe8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#714b67] text-white font-mono text-[10px] font-bold">
                    ACTIVE: {activeContextEntity.type}
                  </span>
                  <span className="font-semibold text-[#714b67]">{activeContextEntity.title}</span>
                </div>
                <button
                  onClick={() => setContextEntity(undefined)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear Context
                </button>
              </div>
            )}

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3 text-xs leading-relaxed',
                    msg.sender === 'USER' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.sender === 'ASSISTANT' && (
                    <div className="p-2 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8] h-fit shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl p-4 space-y-3 shadow-sm',
                      msg.sender === 'USER'
                        ? 'bg-[#714b67] text-white rounded-br-none'
                        : 'bg-[#f3f4f6] border border-[#e5e7eb] text-[#252733] rounded-bl-none'
                    )}
                  >
                    <div className="whitespace-pre-line text-xs">{msg.text}</div>

                    {/* Live Data Badge Strip */}
                    {msg.dataUsed && Object.keys(msg.dataUsed).length > 0 && (
                      <div className="pt-2 border-t border-[#e5e7eb] flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Live Data:</span>
                        {Object.entries(msg.dataUsed).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700"
                          >
                            {k}: <strong>{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Sources Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-[#e5e7eb] space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                          <BookOpen className="w-3 h-3 text-[#714b67]" />
                          Grounding Sources ({msg.sources.length}):
                        </div>
                        {msg.sources.map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 rounded-xl bg-white border border-[#e5e7eb] text-[11px] space-y-0.5"
                          >
                            <div className="font-bold text-[#714b67]">{src.title}</div>
                            <div className="text-slate-500 italic">"{src.excerpt}"</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* RAG Asks Follow-up Interactive Questions */}
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                      <div className="pt-2.5 border-t border-[#e5e7eb] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#714b67]">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>RAG Clarifications & Follow-up Choices:</span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.followUpQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSendMessage(q)}
                              className="w-full text-left p-2 rounded-xl bg-white hover:bg-[#f5eff3] border border-[#ecdfe8] hover:border-[#714b67] text-[11px] font-medium text-[#252733] hover:text-[#714b67] transition-all flex items-center justify-between group shadow-2xs"
                            >
                              <span>{q}</span>
                              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#714b67] shrink-0 ml-1.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                        {msg.suggestedActions.map((act, aIdx) => (
                          <Button
                            key={aIdx}
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              if (act.route) navigate(act.route);
                            }}
                            className="h-7 text-[11px] gap-1 bg-white border-[#e5e7eb] text-[#252733] hover:text-[#714b67] hover:bg-[#f5eff3]"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3 text-[#714b67]" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'USER' && (
                    <div className="p-2 rounded-xl bg-[#f3f4f6] text-[#252733] border border-[#e5e7eb] h-fit shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3 text-xs justify-start items-center text-slate-500">
                  <div className="p-2 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#f3f4f6] border border-[#e5e7eb] p-3.5 rounded-2xl flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#714b67]" />
                    <span>Querying PostgreSQL database context and synthesizing response...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask Copilot about any deal, margin rule, warehouse inventory, or recent change..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="bg-white text-xs h-11"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isThinking}
                  className="h-11 px-5 bg-[#714b67] hover:bg-[#5e3c54]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Dynamic Quick Prompts & Grounded Topics (1 Col) */}
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#714b67]" />
                  <span>Dynamic Prompt Catalog</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Instant triggers for deep RAG analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  {
                    title: 'Audit & Change Inquiry',
                    prompt: 'What recent changes were logged in the audit trail and who made them?',
                    desc: 'Inspect before/after state diffs across quotations & approvals',
                  },
                  {
                    title: 'Quote Q-1024 Blocker Breakdown',
                    prompt: 'Why is quote Q-1024 blocked and what are the margin policy violations?',
                    desc: 'Analyze approval chain, discount ceilings, and hurdle rate',
                  },
                  {
                    title: 'Warehouse Shortage Analysis',
                    prompt: 'Check real-time inventory shortages and recommend the best vendor for replenishment',
                    desc: 'Cross-reference stock items with vendor lead times and scores',
                  },
                  {
                    title: 'High-Scoring Leads Intelligence',
                    prompt: 'Show me all HOT pipeline leads and suggest next closing actions',
                    desc: 'Evaluate lead scores, estimated budgets, and touchpoint counts',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-[#f5eff3] border border-slate-200 hover:border-[#714b67] transition-all group space-y-1"
                  >
                    <div className="font-bold text-xs text-[#252733] group-hover:text-[#714b67] flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#714b67]" />
                    </div>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-[#f9f6f8] border-[#ecdfe8]">
              <CardContent className="p-4 space-y-2">
                <div className="text-xs font-bold text-[#714b67] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Multi-Tenant RAG Grounding</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every answer generated by DealFlow360 RAG is grounded with strict company-level isolation. Audit records, margin formulas, and stock levels are verified before output.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: LIVE CHANGE MONITOR & AUDIT EXPLAINER */}
      {activeTab === 'CHANGES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#252733]">Real-Time Entity Change Stream</h2>
              <p className="text-xs text-slate-500">
                Live immutable audit logs with instant AI impact analysis and follow-up guidance
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => refetchChanges()}
              className="gap-1.5 text-xs bg-white border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stream</span>
            </Button>
          </div>

          {changesLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#714b67] mb-2" />
              Loading real-time change stream...
            </div>
          ) : changes.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              No change events logged yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {changes.map((item) => (
                <Card key={item.id} className="rounded-3xl border-slate-200 hover:border-[#714b67] transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase',
                            item.action.includes('REAPPROVAL')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.action === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          )}
                        >
                          {item.action}
                        </span>
                        <span className="font-bold text-xs text-[#252733] font-mono">
                          {item.entityType} ({item.entityId})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Modified by: <strong className="text-slate-700">{item.userName}</strong> ({item.userRole})</span>
                        <span>•</span>
                        <span className="font-mono">{formatTimeAgo(item.createdAt)}</span>
                      </div>
                    </div>

                    {item.reason && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                        <strong>Reason / Note:</strong> "{item.reason}"
                      </div>
                    )}

                    {/* AI Impact Summary */}
                    <div className="p-3 bg-[#f5eff3]/60 rounded-2xl border border-[#ecdfe8] flex items-start gap-2.5">
                      <Bot className="w-4 h-4 text-[#714b67] shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-[#714b67]">AI Impact Assessment:</div>
                        <p className="text-slate-700">{item.aiImpactSummary}</p>
                      </div>
                    </div>

                    {/* Ask AI about this change button */}
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setContextEntity({
                            type: 'AUDIT',
                            id: item.entityId,
                            title: `${item.action} on ${item.entityType}`,
                          });
                          setActiveTab('CHAT');
                          handleSendMessage(`Explain the impact and consequences of the recent ${item.action} on ${item.entityType} (${item.entityId}) performed by ${item.userName}.`);
                        }}
                        className="text-xs gap-1.5 bg-white hover:bg-[#f5eff3] hover:text-[#714b67] border-slate-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#714b67]" />
                        <span>Ask RAG Copilot to Analyze This Change</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: DEAL RISK & ANOMALY SENTINEL */}
      {activeTab === 'RISKS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-3xl border-slate-200 bg-rose-50/40 border-rose-200">
              <CardContent className="p-5 space-y-1">
                <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">At-Risk Deals</div>
                <div className="text-2xl font-bold font-display text-rose-700">{atRiskQuotes.length}</div>
                <p className="text-[11px] text-slate-500">Margin compression or pending approvals</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-amber-50/40 border-amber-200">
              <CardContent className="p-5 space-y-1">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Inventory Shortages</div>
                <div className="text-2xl font-bold font-display text-amber-700">{lowStockItems.length}</div>
                <p className="text-[11px] text-slate-500">Products below safety stock threshold</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-emerald-50/40 border-emerald-200">
              <CardContent className="p-5 space-y-1">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Autonomous Deals</div>
                <div className="text-2xl font-bold font-display text-emerald-700">
                  {Math.max(0, (quotesData?.data?.length || 0) - atRiskQuotes.length)}
                </div>
                <p className="text-[11px] text-slate-500">Compliant with 18% margin hurdle rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#252733]">Flagged Quotations & Policy Violations</h3>
            <div className="grid grid-cols-1 gap-4">
              {atRiskQuotes.map((q) => (
                <Card key={q.id} className="rounded-3xl border-slate-200 hover:border-rose-300 transition-all">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#252733]">{q.customerName}</span>
                        <span className="font-mono text-xs text-slate-400">({q.quoteNumber})</span>
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          Risk: {q.riskAssessment?.overallScore || 70} / 100
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>Total: <strong>₹ {(q.totalAmount || 0).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Discount: <strong>{(q.discountPercentage || 0).toFixed(1)}%</strong></span>
                        <span>•</span>
                        <span>Gross Margin: <strong className={cn((q.grossMarginPercentage || 0) < 18 ? 'text-rose-600' : 'text-emerald-600')}>{(q.grossMarginPercentage || 0).toFixed(1)}%</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setContextEntity({
                            type: 'QUOTE',
                            id: q.id,
                            title: `Quote ${q.quoteNumber} (${q.customerName})`,
                          });
                          setActiveTab('CHAT');
                          handleSendMessage(`Why is quote ${q.quoteNumber} flagged at risk and how can we resolve the margin policy violation?`);
                        }}
                        className="text-xs gap-1.5 bg-[#f5eff3] text-[#714b67] hover:bg-[#ecdfe8]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>RAG Diagnosis</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/sales/quotes/${q.id}`)}
                        className="text-xs gap-1.5 bg-[#714b67] hover:bg-[#5e3c54]"
                      >
                        <span>Open Quote</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: WHAT-IF SIMULATION LAB */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls (1 Col) */}
          <Card className="rounded-3xl border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#714b67]" />
                <span>Simulation Parameters</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Test concession margins before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Base Unit Price (₹)</label>
                <Input
                  type="number"
                  value={simBasePrice}
                  onChange={(e) => setSimBasePrice(Number(e.target.value))}
                  className="text-xs bg-slate-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Unit Cost (COGS) (₹)</label>
                <Input
                  type="number"
                  value={simCost}
                  onChange={(e) => setSimCost(Number(e.target.value))}
                  className="text-xs bg-slate-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Concession Discount (%)</label>
                <Input
                  type="number"
                  value={simDiscount}
                  onChange={(e) => setSimDiscount(Number(e.target.value))}
                  className="text-xs bg-slate-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Quantity (Units)</label>
                <Input
                  type="number"
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(Number(e.target.value))}
                  className="text-xs bg-slate-50 font-mono"
                />
              </div>

              <Button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full bg-[#714b67] hover:bg-[#5e3c54] text-xs h-10 gap-2"
              >
                {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calculator className="w-3.5 h-3.5" />}
                <span>Calculate Margin & Approval Impact</span>
              </Button>
            </CardContent>
          </Card>

          {/* Results (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {simResult && (
              <div className="space-y-4">
                {/* Result Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="rounded-3xl border-slate-200">
                    <CardContent className="p-4 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Gross Revenue</div>
                      <div className="text-xl font-bold font-display text-[#252733]">
                        ₹ {(simResult.revenue || 0).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200">
                    <CardContent className="p-4 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Gross Profit</div>
                      <div className="text-xl font-bold font-display text-[#252733]">
                        ₹ {(simResult.grossProfit || 0).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200">
                    <CardContent className="p-4 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Gross Margin</div>
                      <div
                        className={cn(
                          'text-xl font-bold font-display',
                          simResult.requiresApproval ? 'text-rose-600' : 'text-emerald-600'
                        )}
                      >
                        {simResult.marginPercent}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Policy Governance Status */}
                <Card
                  className={cn(
                    'rounded-3xl p-6 border',
                    simResult.requiresApproval
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {simResult.requiresApproval ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      <span className="font-bold text-sm text-[#252733]">
                        {simResult.requiresApproval
                          ? 'Governance Warning: Multi-Tier Approval Triggered'
                          : 'Governance OK: Autonomous Sales Rep Approval'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {simResult.recommendation}
                    </p>

                    {simResult.followUpQuestions && simResult.followUpQuestions.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-[#714b67] flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>RAG Copilot Proactive Questions:</span>
                        </div>
                        <div className="space-y-1.5">
                          {simResult.followUpQuestions.map((fq: string, fIdx: number) => (
                            <button
                              key={fIdx}
                              onClick={() => {
                                setActiveTab('CHAT');
                                handleSendMessage(fq);
                              }}
                              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#f5eff3] border border-slate-200 hover:border-[#714b67] text-xs font-medium text-[#252733] hover:text-[#714b67] transition-all flex items-center justify-between group shadow-2xs"
                            >
                              <span>{fq}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#714b67]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
