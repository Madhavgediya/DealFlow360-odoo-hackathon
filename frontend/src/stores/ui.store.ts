import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'APPROVAL_REQUEST' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'NEGOTIATION_RECEIVED' | 'REAPPROVAL_TRIGGERED' | 'STOCK_SHORTAGE' | 'SHIPMENT_UPDATE' | 'DEAL_HEALTH_ALERT';
  title: string;
  message: string;
  route: string;
  isRead: boolean;
  createdAt: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  commandPaletteOpen: boolean;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTheme: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'REAPPROVAL_TRIGGERED',
    title: 'Reapproval Triggered: Q-1024',
    message: 'Customer requested discount increase from 10% to 18%, reducing gross margin to 14.2%.',
    route: '/approvals/appr-1024',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'STOCK_SHORTAGE',
    title: 'Inventory Alert: Surat Central',
    message: 'UltraBook Pro X1 has 15 units shortage for confirmed deal Q-1021. PO required.',
    route: '/inventory/stock',
    isRead: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'NEGOTIATION_RECEIVED',
    title: 'New Customer Proposal: Q-1025',
    message: 'Quantum Cloud Corp submitted counter-proposal with revised quantity 25 units.',
    route: '/sales/negotiations/q-1025',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    type: 'APPROVAL_APPROVED',
    title: 'Approval Cleared: Q-1020',
    message: 'Finance Director approved 12% enterprise tier discount for Reliance Infra deal.',
    route: '/sales/quotes/q-1020',
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
];

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  isDarkMode: false,
  commandPaletteOpen: false,
  notifications: INITIAL_NOTIFICATIONS,
  unreadNotificationCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleTheme: () => set({ isDarkMode: false }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  markNotificationAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return {
        notifications: updated,
        unreadNotificationCount: updated.filter((n) => !n.isRead).length,
      };
    }),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadNotificationCount: 0,
    })),
  addNotification: (notif) =>
    set((state) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadNotificationCount: updated.filter((n) => !n.isRead).length,
      };
    }),
}));
