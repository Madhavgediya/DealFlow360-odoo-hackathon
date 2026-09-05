import * as React from 'react';
import { useAIStore } from '../../stores/ai.store';
import { aiApi } from '../../services/api/ai.api';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sparkles, Send, Bot, User as UserIcon, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/formatting';

export function AIChatDrawer() {
  const { isOpen, closeDrawer, messages, addMessage, isThinking, setThinking } = useAIStore();
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
      const res = await aiApi.sendMessage(textToSend);
      if (res.success && res.data) {
        addMessage(res.data);
      }
    } catch (err) {
      addMessage({
        sender: 'ASSISTANT',
        text: 'Apologies, I encountered a temporary issue querying the QuoteFlow RAG database. Please try again.',
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
    'Why is quote Q-1024 blocked?',
    'Which vendor should we use for the laptop shortage?',
    'Show all at-risk deals',
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      width="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#252733] font-display">QuoteFlow AI Assistant</span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              RAG Active
            </span>
          </div>
        </div>
      }
      description="Context-aware reasoning across your entire deal lifecycle"
    >
      <div className="flex flex-col h-[calc(100vh-140px)] justify-between -m-4 sm:-m-5">
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
                  'max-w-[85%] rounded-2xl p-4 space-y-2.5 shadow-sm',
                  msg.sender === 'USER'
                    ? 'bg-[#714b67] text-white rounded-br-none'
                    : 'bg-[#f3f4f6] border border-[#e5e7eb] text-[#252733] rounded-bl-none'
                )}
              >
                <div className="whitespace-pre-line text-xs space-y-1">
                  {msg.text}
                </div>

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
                        className="p-2.5 rounded-xl bg-white border border-[#e5e7eb] text-[11px] space-y-0.5"
                      >
                        <div className="font-bold text-[#714b67]">{src.title}</div>
                        <div className="text-slate-500 italic">"{src.excerpt}"</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
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
                <span>Retrieving deal graph and synthesizing explanation...</span>
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
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600 transition-colors shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask Copilot about deals, risks, quotes, or vendors..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-xs bg-white border-slate-200 h-10"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isThinking}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
