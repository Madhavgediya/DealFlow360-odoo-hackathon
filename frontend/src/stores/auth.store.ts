import { create } from 'zustand';
import { Company, CurrencyCode } from '../types/api';
import { User, UserRole } from '../types/auth';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../utils/permissions';

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Apex Enterprise Solutions Ltd',
    code: 'APEX',
    currency: 'INR',
    taxId: 'GSTIN24AAACA1234F1Z5',
    country: 'India',
  },
  {
    id: 'comp-2',
    name: 'Orbit Global Technologies Inc',
    code: 'ORBIT',
    currency: 'USD',
    taxId: 'US-EIN-987654321',
    country: 'United States',
  },
];

export const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'usr-admin',
    name: 'Madhav Gediya',
    email: 'madhav@dealflow360.io',
    role: 'ADMIN',
    roleTitle: ROLE_LABELS.ADMIN,
    companyId: 'comp-1',
    permissions: ROLE_PERMISSIONS.ADMIN,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  },
  SALES_MANAGER: {
    id: 'usr-sm',
    name: 'Vikram Mehta',
    email: 'vikram.m@dealflow360.io',
    role: 'SALES_MANAGER',
    roleTitle: ROLE_LABELS.SALES_MANAGER,
    companyId: 'comp-1',
    permissions: ROLE_PERMISSIONS.SALES_MANAGER,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  SALES_REP: {
    id: 'usr-rep',
    name: 'Ananya Sharma',
    email: 'ananya.s@dealflow360.io',
    role: 'SALES_REP',
    roleTitle: ROLE_LABELS.SALES_REP,
    companyId: 'comp-1',
    permissions: ROLE_PERMISSIONS.SALES_REP,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  FINANCE_DIRECTOR: {
    id: 'usr-cfo',
    name: 'Rajesh Singhania',
    email: 'rajesh.cfo@dealflow360.io',
    role: 'FINANCE_DIRECTOR',
    roleTitle: ROLE_LABELS.FINANCE_DIRECTOR,
    companyId: 'comp-1',
    permissions: ROLE_PERMISSIONS.FINANCE_DIRECTOR,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
  WAREHOUSE_MANAGER: {
    id: 'usr-wh',
    name: 'Karan Patel',
    email: 'karan.p@dealflow360.io',
    role: 'WAREHOUSE_MANAGER',
    roleTitle: ROLE_LABELS.WAREHOUSE_MANAGER,
    companyId: 'comp-1',
    permissions: ROLE_PERMISSIONS.WAREHOUSE_MANAGER,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  PROCUREMENT_LEAD: {
    id: 'usr-proc',
    name: 'Devendra Joshi',
    email: 'devendra.j@dealflow360.io',
    role: 'PROCUREMENT_LEAD',
    roleTitle: ROLE_LABELS.PROCUREMENT_LEAD,
    companyId: 'comp-1',
    permissions: ROLE_PERMISSIONS.PROCUREMENT_LEAD,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
  },
  CUSTOMER: {
    id: 'usr-cust',
    name: 'Rohan Desai (CTO, Quantum Cloud Corp)',
    email: 'rohan.desai@quantumcloud.com',
    role: 'CUSTOMER',
    roleTitle: ROLE_LABELS.CUSTOMER,
    companyId: 'comp-1',
    customerId: 'cust-1',
    permissions: ROLE_PERMISSIONS.CUSTOMER,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  },
};

interface AuthState {
  user: User | null;
  company: Company;
  currency: CurrencyCode;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setCompany: (company: Company) => void;
  setCurrency: (currency: CurrencyCode) => void;
  switchRole: (role: UserRole) => void;
  login: (user: User, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USERS.ADMIN,
  company: DEMO_COMPANIES[0],
  currency: 'INR',
  accessToken: 'jwt-demo-token-dealflow360',
  isAuthenticated: true,
  setUser: (user) => set({ user }),
  setCompany: (company) => set({ company, currency: company.currency }),
  setCurrency: (currency) => set({ currency }),
  switchRole: (role: UserRole) => {
    const newUser = DEMO_USERS[role];
    set({ user: newUser });
  },
  login: (user, token) => set({ user, accessToken: token || 'jwt-token', isAuthenticated: true }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
