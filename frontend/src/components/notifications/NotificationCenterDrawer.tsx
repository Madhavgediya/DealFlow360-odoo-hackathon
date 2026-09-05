import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore, AppNotification } from '../../stores/ui.store';
import { formatTimeAgo } from '../../utils/date';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  FileText,
  Receipt,
  DollarSign,
  ShieldAlert,
  Users,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../utils/formatting';

export interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenterDrawer({ isOpen, onClose }: NotificationCenterProps) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useUIStore();

  const [filterCategory, setFilterCategory] = React.useState<string>('ALL');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'All', count: notifications.length },
    { id: 'UNREAD', label: 'Unread', count: unreadNotificationCount },
    { id: 'APPROVAL', label: 'Approvals' },
    { id: 'QUOTATION', label: 'Quotes' },
    { id: 'INVOICE', label: 'Invoices' },
    { id: 'STOCK', label: 'Inventory' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filterCategory === 'UNREAD') return !n.isRead;
    if (filterCategory === 'APPROVAL') return n.type.includes('APPROVAL');
    if (filterCategory === 'QUOTATION') return n.type.includes('NEGOTIATION') || n.route.includes('/sales/quotes');
    if (filterCategory === 'INVOICE') return n.type.includes('BILLING') || n.route.includes('/billing');
    if (filterCategory === 'STOCK') return n.type.includes('STOCK');
    return true;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'APPROVAL_REQUEST':
      case 'REAPPROVAL_TRIGGERED':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'APPROVAL_APPROVED':
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      case 'NEGOTIATION_RECEIVED':
        return <FileText className="w-4 h-4 text-[#714b67]" />;
      case 'STOCK_SHORTAGE':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'DEAL_HEALTH_ALERT':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#e5e7eb] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#252733] font-display">Notification Center</h2>
                <p className="text-[11px] text-slate-500 font-sans">
                  {unreadNotificationCount} unread operational alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-[11px] font-semibold text-[#714b67] hover:bg-[#f5eff3] px-2.5 py-1 rounded-lg transition-colors"
                  title="Mark all notifications as read"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2.5 border-b border-[#e5e7eb] flex items-center gap-1.5 overflow-x-auto bg-white">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                  filterCategory === cat.id
                    ? 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8] font-bold shadow-subtle'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                {cat.label} {cat.count !== undefined ? `(${cat.count})` : ''}
              </button>
            ))}
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100 font-sans">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <CheckCheck className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-[#252733]">All caught up!</p>
                <p className="text-[11px] text-slate-500">No operational alerts in this category.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    onClose();
                    navigate(n.route);
                  }}
                  className={cn(
                    'pt-2.5 first:pt-0 p-3 rounded-xl text-xs cursor-pointer transition-all space-y-1.5 border group',
                    n.isRead
                      ? 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/70 opacity-75'
                      : 'bg-[#fdfafc] border-[#ecdfe8] hover:border-[#714b67]/40 shadow-subtle'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-xs shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#252733] group-hover:text-[#714b67] transition-colors truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100/60">
                    <span className="font-mono text-[#714b67] font-semibold flex items-center gap-1 group-hover:underline">
                      Inspect Record <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#714b67]" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#e5e7eb] bg-slate-50 text-center">
            <span className="text-[11px] text-slate-400 font-sans">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono">ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
