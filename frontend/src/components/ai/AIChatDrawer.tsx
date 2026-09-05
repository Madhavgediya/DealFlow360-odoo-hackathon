import * as React from 'react';
import { useAIStore } from '../../stores/ai.store';
import { aiApi } from '../../services/api/ai.api';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  BookOpen,
  ArrowRight,
  Loader2,
  HelpCircle,
  Maximize2,
  X,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/formatting';

export function AIChatDrawer() {
  const {
    isOpen,
    closeDrawer,
    messages,
    addMessage,
    isThinking,
    setThinking,
    activeContextEntity,
    clearContextEntity,
  } = useAIStore();
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isThinking]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || isThinking) return;

    setInput('');
    addMessage({
      sender: 'USER',
      text: textToSend,
    });

    setThinking(true);
    try {
      const res = await aiApi.sendMessage(textToSend, activeContextEntity);
      if (res.success && res.data) {
        addMessage(res.data);
      }
    } catch (err) {
      addMessage({
        sender: 'ASSISTANT',
        text: 'Apologies, I encountered a temporary issue querying the DealFlow360 RAG database. Please try again.',
      });
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'What recent changes were logged?',
    'Why is quote Q-1024 blocked?',
    'Check inventory shortages for laptops',
    'Show all high-risk deals',
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      width="lg"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#252733] font-display">
                  DealFlow360 Copilot
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Dynamic RAG Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Live PostgreSQL & State Grounded Reasoning</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              closeDrawer();
              navigate('/ai-copilot');
            }}
            className="hidden sm:flex items-center gap-1.5 h-8 text-xs bg-slate-100 hover:bg-[#f5eff3] hover:text-[#714b67]"
            title="Open Fullscreen AI Intelligence Copilot Hub"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full Hub</span>
          </Button>
        </div>
      }
      description="Real-time context retrieval across Quotes, Leads, Inventory, Approvals & Changes"
    >
      <div className="flex flex-col h-[calc(100vh-140px)] justify-between -m-4 sm:-m-5">
        {/* Active Context Entity Pill */}
        {activeContextEntity && (
          <div className="px-4 py-2 bg-[#f5eff3] border-b border-[#ecdfe8] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded bg-[#714b67] text-white font-mono text-[10px] font-bold shrink-0">
                CONTEXT: {activeContextEntity.type}
              </span>
              <span className="font-semibold text-[#714b67] truncate">
                {activeContextEntity.title}
              </span>
            </div>
            <button
              onClick={clearContextEntity}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
              title="Clear Active Entity Context"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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
                  'max-w-[88%] rounded-2xl p-4 space-y-3 shadow-sm',
                  msg.sender === 'USER'
                    ? 'bg-[#714b67] text-white rounded-br-none'
                    : 'bg-[#f3f4f6] border border-[#e5e7eb] text-[#252733] rounded-bl-none'
                )}
              >
                {/* Message Body */}
                <div className="whitespace-pre-line text-xs space-y-1">
                  {msg.text}
                </div>

                {/* Data Used Badge Strip */}
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

                {/* Sources Citation Pill */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-[#e5e7eb] space-y-1.5">
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

                {/* "RAG Asks:" Interactive Clarification Prompts */}
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="pt-2.5 border-t border-[#e5e7eb] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#714b67]">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>RAG Clarification & Follow-up:</span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.followUpQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="w-full text-left p-2 rounded-xl bg-white hover:bg-[#f5eff3] border border-[#ecdfe8] hover:border-[#714b67] text-[11px] font-medium text-[#252733] hover:text-[#714b67] transition-all flex items-center justify-between group shadow-2xs"
                        >
                          <span>{q}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#714b67] shrink-0 ml-1.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Navigation Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <Button
                        key={aIdx}
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (act.route) {
                            navigate(act.route);
                            closeDrawer();
                          }
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
                  <UserIcon className="w-4 h-4" />
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
                <span>Querying dynamic database context & formulating guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600 transition-colors shadow-sm hover:border-[#714b67] hover:text-[#714b67]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask RAG Copilot anything or inspect changes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-xs bg-white border-slate-200 h-10"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isThinking}
              size="icon"
              className="h-10 w-10 shrink-0 bg-[#714b67] hover:bg-[#5e3c54]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
