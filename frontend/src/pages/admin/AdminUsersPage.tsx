import * as React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { User, UserRole, Permission, RetailerDetails } from '../../types/auth';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../../utils/permissions';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import {
  UserPlus,
  KeyRound,
  Users,
  Shield,
  Briefcase,
  DollarSign,
  Power,
  Store,
  CreditCard,
  Percent,
  MapPin,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  MessageSquare,
  Package,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Activity,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../services/api/users.api';
import { rolesApi, Role } from '../../services/api/roles.api';
import { permissionsApi, PermissionObj } from '../../services/api/permissions.api';

// Categorized Granular Permissions for Provisioning & Editing
const PERMISSION_GROUPS: {
  category: string;
  icon: any;
  items: { key: string; label: string; desc: string }[];
}[] = [
  {
    category: 'CRM & Lead Management',
    icon: Users,
    items: [
      { key: 'lead.view', label: 'View Leads', desc: 'Browse incoming prospects & qualified leads' },
      { key: 'lead.create', label: 'Create Leads', desc: 'Add new commercial leads & contacts' },
      { key: 'lead.edit', label: 'Edit Leads', desc: 'Update lead status, scores, & requirements' },
      { key: 'lead.qualify', label: 'Qualify & Score', desc: 'Move leads through qualification pipeline' },
      { key: 'lead.convert', label: 'Convert to Deal', desc: 'Convert qualified lead to active deal quote' },
      { key: 'lead.manage', label: 'Full Lead Authority', desc: 'Assign leads, bulk operations & export' },
    ],
  },
  {
    category: 'Quotations & Discount Approvals',
    icon: Briefcase,
    items: [
      { key: 'quote.view', label: 'View Quotes', desc: 'Access quotation records & draft terms' },
      { key: 'quote.create', label: 'Build Quotes', desc: 'Generate multi-line CPQ quotations' },
      { key: 'quote.edit', label: 'Modify Quotes', desc: 'Adjust pricing, terms & line items' },
      { key: 'quote.submit', label: 'Submit for Approval', desc: 'Send quotes to deal desk review' },
      { key: 'quote.approve', label: 'Approve Quotes', desc: 'Sign-off on commercial discount tiers' },
      { key: 'quote.confirm', label: 'Confirm & Seal', desc: 'Finalize into legally binding sales order' },
      { key: 'discount.override', label: 'Discount Override', desc: 'Grant special margins beyond matrix threshold' },
    ],
  },
  {
    category: 'Multi-Round Negotiations & Deal Desk',
    icon: MessageSquare,
    items: [
      { key: 'quote.negotiate', label: 'Live Quote Negotiation', desc: 'Exchange counter-offers on price and volume' },
      { key: 'customer.negotiate', label: 'Customer Chat Desk', desc: 'Participate in client negotiation rooms' },
      { key: 'retailer.negotiate', label: 'Retailer B2B Deal Desk', desc: 'Negotiate volume tiers with dealer partners' },
    ],
  },
  {
    category: 'B2B Retailers & Inventory Operations',
    icon: Store,
    items: [
      { key: 'retailer.view', label: 'View Retailers', desc: 'Inspect dealer directory & credit balances' },
      { key: 'retailer.manage', label: 'Manage Retailers', desc: 'Approve credit lines, tiers, & dealer codes' },
      { key: 'inventory.view', label: 'Inspect Stock', desc: 'Real-time multi-warehouse inventory visibility' },
      { key: 'inventory.allocate', label: 'Stock Allocation', desc: 'Reserve inventory for confirmed high-value quotes' },
      { key: 'procurement.manage', label: 'Procurement', desc: 'Generate supplier purchase orders & re-stock' },
    ],
  },
  {
    category: 'Billing, Analytics & AI Copilot',
    icon: DollarSign,
    items: [
      { key: 'billing.view', label: 'View Invoices', desc: 'Access customer and retailer invoices' },
      { key: 'billing.manage', label: 'Billing Operations', desc: 'Issue invoices, credit notes & record payments' },
      { key: 'deal_health.view', label: 'Deal Health Insights', desc: 'Real-time margin risk & discount radar' },
      { key: 'analytics.view', label: 'Executive Analytics', desc: 'Full revenue, win-rate & pipeline metrics' },
      { key: 'ai.use', label: 'AI Deal Copilot', desc: 'Use AI for pricing suggestions & win prediction' },
    ],
  },
];

export function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<'STAFF' | 'RETAILERS'>('STAFF');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modal States
  const [isStaffModalOpen, setIsStaffModalOpen] = React.useState(false);
  const [isRetailerModalOpen, setIsRetailerModalOpen] = React.useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = React.useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = React.useState(false);

  // Selected User for Editing
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  // Staff Form State
  const [staffName, setStaffName] = React.useState('');
  const [staffEmail, setStaffEmail] = React.useState('');
  const [selectedStaffRoleId, setSelectedStaffRoleId] = React.useState<string>('');
  const [staffRoleCode, setStaffRoleCode] = React.useState<string>('SALES_REP');
  const [staffJobTitle, setStaffJobTitle] = React.useState('');
  const [staffDepartment, setStaffDepartment] = React.useState('Sales');
  const [staffPassword, setStaffPassword] = React.useState('DealFlow@2026');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([
    'lead.view',
    'lead.create',
    'quote.view',
    'quote.create',
    'quote.negotiate',
    'ai.use',
  ]);

  // Retailer Form State
  const [retailerOrgName, setRetailerOrgName] = React.useState('');
  const [retailerContactName, setRetailerContactName] = React.useState('');
  const [retailerEmail, setRetailerEmail] = React.useState('');
  const [retailerPassword, setRetailerPassword] = React.useState('Retailer@2026');
  const [selectedRetailerRoleId, setSelectedRetailerRoleId] = React.useState<string>('');
  const [dealerCode, setDealerCode] = React.useState('');
  const [retailerTier, setRetailerTier] = React.useState<'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'>('GOLD');
  const [creditLimit, setCreditLimit] = React.useState(500000);
  const [discountRate, setDiscountRate] = React.useState(15);
  const [territory, setTerritory] = React.useState('North Region');
  const [taxNumber, setTaxNumber] = React.useState('');

  // Edit User Form State
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editRoleId, setEditRoleId] = React.useState('');
  const [editJobTitle, setEditJobTitle] = React.useState('');
  const [editDepartment, setEditDepartment] = React.useState('');
  const [editStatus, setEditStatus] = React.useState('ACTIVE');
  const [editPermissions, setEditPermissions] = React.useState<string[]>([]);

  // Generated Credentials for sharing
  const [provisionedCredentials, setProvisionedCredentials] = React.useState<{
    name: string;
    email: string;
    password: string;
    roleTitle: string;
    dealerCode?: string;
  } | null>(null);

  const [copied, setCopied] = React.useState(false);

  // Fetch Users
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });
  const userList: User[] = usersResponse?.data || [];

  // Fetch Roles from DB
  const { data: rolesResponse, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
  });
  const roleList: Role[] = rolesResponse?.data || [];

  // Fetch System Permissions
  const { data: permissionsResponse } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getPermissions,
  });
  const systemPermissions: PermissionObj[] = permissionsResponse?.data || [];

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const createRes = await usersApi.createUser(userData);
      if (!createRes.success) throw new Error(createRes.error || 'Failed to create user');
      
      const createdUser = createRes.data;
      if (createdUser?.id && userData.roleId) {
        await usersApi.assignRole(createdUser.id, userData.roleId);
      }
      return createdUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsStaffModalOpen(false);
      setIsRetailerModalOpen(false);
      setIsCredentialsModalOpen(true);
      toast.success('Account provisioned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to provision account');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (args: { id: string; payload: any; roleId?: string }) => {
      const res = await usersApi.updateUser(args.id, args.payload);
      if (!res.success) throw new Error(res.error || 'Failed to update user');
      if (args.roleId) {
        await usersApi.assignRole(args.id, args.roleId);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditUserModalOpen(false);
      toast.success('User updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (args: { id: string; status: string }) => usersApi.updateUserStatus(args.id, args.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'DF@';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleOpenStaffModal = () => {
    setStaffName('');
    setStaffEmail('');
    
    // Find default Sales Rep role
    const defaultRole = roleList.find(r => r.code === 'SALES_REP') || roleList[0];
    const roleId = defaultRole ? defaultRole.id : '';
    const roleCode = defaultRole ? (defaultRole.code || 'SALES_REP') : 'SALES_REP';
    
    setSelectedStaffRoleId(roleId);
    setStaffRoleCode(roleCode);
    setStaffJobTitle('Senior Account Executive');
    setStaffDepartment('Sales');
    setStaffPassword(generateRandomPassword());
    
    if (roleId) {
      loadRolePermissions(roleId, roleCode);
    } else {
      setSelectedPermissions(ROLE_PERMISSIONS.SALES_REP || []);
    }
    
    setIsStaffModalOpen(true);
  };

  const loadRolePermissions = async (roleId: string, roleCode?: string) => {
    try {
      const res = await rolesApi.getRolePermissions(roleId);
      if (res.success && res.data && res.data.length > 0) {
        const perms = res.data.map((p: any) => p.action);
        setSelectedPermissions(perms);
      } else if (roleCode && (ROLE_PERMISSIONS as any)[roleCode]) {
        setSelectedPermissions((ROLE_PERMISSIONS as any)[roleCode]);
      }
    } catch (err) {
      if (roleCode && (ROLE_PERMISSIONS as any)[roleCode]) {
        setSelectedPermissions((ROLE_PERMISSIONS as any)[roleCode]);
      }
    }
  };

  const handleStaffRoleChange = (roleId: string) => {
    setSelectedStaffRoleId(roleId);
    const found = roleList.find(r => r.id === roleId);
    if (found) {
      const code = found.code || found.name;
      setStaffRoleCode(code);
      if (code === 'SALES_MANAGER') setStaffJobTitle('Sales Director');
      else if (code === 'FINANCE') setStaffJobTitle('Finance Director');
      else if (code === 'OPERATIONS') setStaffJobTitle('Logistics & Operations Lead');
      else if (code === 'ADMIN') setStaffJobTitle('Company Administrator');
      else if (code === 'SALES_REP') setStaffJobTitle('Account Executive');
      else setStaffJobTitle(found.name);

      loadRolePermissions(found.id, code);
    }
  };

  const togglePermission = (p: string) => {
    if (selectedPermissions.includes(p)) {
      setSelectedPermissions(selectedPermissions.filter((item) => item !== p));
    } else {
      setSelectedPermissions([...selectedPermissions, p]);
    }
  };

  const toggleEditPermission = (p: string) => {
    if (editPermissions.includes(p)) {
      setEditPermissions(editPermissions.filter((item) => item !== p));
    } else {
      setEditPermissions([...editPermissions, p]);
    }
  };

  const handleOpenRetailerModal = () => {
    setRetailerOrgName('');
    setRetailerContactName('');
    setRetailerEmail('');
    setRetailerPassword(generateRandomPassword());
    setDealerCode(`RET-IND-${Math.floor(1000 + Math.random() * 9000)}`);
    setRetailerTier('GOLD');
    setCreditLimit(500000);
    setDiscountRate(18);
    setTerritory('Northern Region');
    setTaxNumber('GSTIN24AAACA9921Z1');

    const defaultRetailerRole = roleList.find(r => r.code === 'RETAILER') || roleList[0];
    setSelectedRetailerRoleId(defaultRetailerRole ? defaultRetailerRole.id : '');

    setIsRetailerModalOpen(true);
  };

  const handleOpenEditUserModal = async (u: User) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditEmail(u.email || '');
    setEditJobTitle(u.jobTitle || '');
    setEditDepartment(u.department || '');
    setEditStatus(u.status || 'ACTIVE');

    // Find assigned role
    const matchedRole = roleList.find(r => (u as any).role_id === r.id || r.code === u.role);
    const roleId = matchedRole ? matchedRole.id : '';
    setEditRoleId(roleId);

    // Permissions
    if (u.permissions && u.permissions.length > 0) {
      const pKeys = u.permissions.map((p: any) => (typeof p === 'string' ? p : p.action));
      setEditPermissions(pKeys);
    } else if (matchedRole) {
      try {
        const res = await rolesApi.getRolePermissions(matchedRole.id);
        if (res.success && res.data) {
          setEditPermissions(res.data.map((p: any) => p.action));
        } else if ((ROLE_PERMISSIONS as any)[u.role]) {
          setEditPermissions((ROLE_PERMISSIONS as any)[u.role]);
        }
      } catch {
        if ((ROLE_PERMISSIONS as any)[u.role]) {
          setEditPermissions((ROLE_PERMISSIONS as any)[u.role]);
        }
      }
    }

    setIsEditUserModalOpen(true);
  };

  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      toast.error('Staff name and corporate email are required');
      return;
    }

    const assignedRoleObj = roleList.find(r => r.id === selectedStaffRoleId);
    const roleTitle = assignedRoleObj ? assignedRoleObj.name : ROLE_LABELS[staffRoleCode as UserRole] || staffRoleCode;

    setProvisionedCredentials({
      name: staffName.trim(),
      email: staffEmail.trim().toLowerCase(),
      password: staffPassword,
      roleTitle,
    });

    createUserMutation.mutate({
      name: staffName.trim(),
      email: staffEmail.trim().toLowerCase(),
      password: staffPassword,
      role: staffRoleCode,
      roleId: selectedStaffRoleId,
      jobTitle: staffJobTitle,
      department: staffDepartment,
      permissions: selectedPermissions,
    });
  };

  const handleCreateRetailerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerOrgName.trim() || !retailerEmail.trim()) {
      toast.error('Retailer company name and corporate email are required');
      return;
    }

    const finalName = `${retailerOrgName.trim()} (${retailerContactName.trim() || 'Purchasing Lead'})`;
    const assignedRoleObj = roleList.find(r => r.id === selectedRetailerRoleId);

    setProvisionedCredentials({
      name: finalName,
      email: retailerEmail.trim().toLowerCase(),
      password: retailerPassword,
      roleTitle: assignedRoleObj ? assignedRoleObj.name : `B2B Retailer [${retailerTier} Tier]`,
      dealerCode: dealerCode.trim(),
    });

    createUserMutation.mutate({
      name: finalName,
      email: retailerEmail.trim().toLowerCase(),
      password: retailerPassword,
      role: assignedRoleObj ? (assignedRoleObj.code || 'RETAILER') : 'RETAILER',
      roleId: selectedRetailerRoleId,
      jobTitle: 'Authorized Wholesale Dealer',
      department: 'Wholesale Network',
      retailerDetails: {
        dealerCode: dealerCode.trim(),
        tier: retailerTier,
        creditLimit: Number(creditLimit),
        availableCredit: Number(creditLimit),
        discountRate: Number(discountRate),
        taxRegistrationNumber: taxNumber.trim(),
        territory: territory.trim(),
      },
      permissions: ROLE_PERMISSIONS.RETAILER,
    });
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const matchedRole = roleList.find(r => r.id === editRoleId);

    updateUserMutation.mutate({
      id: editingUser.id,
      roleId: editRoleId || undefined,
      payload: {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: matchedRole ? matchedRole.code : undefined,
        jobTitle: editJobTitle.trim(),
        department: editDepartment.trim(),
        status: editStatus,
        permissions: editPermissions,
      },
    });
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: u.id, status: nextStatus });
  };

  const handleCopyCredentials = () => {
    if (!provisionedCredentials) return;
    const text = `===========================================
DEALFLOW360 ENTERPRISE CREDENTIALS
===========================================
Account Name:     ${provisionedCredentials.name}
Email Address:    ${provisionedCredentials.email}
Initial Password: ${provisionedCredentials.password}
Role / Workspace: ${provisionedCredentials.roleTitle}
${provisionedCredentials.dealerCode ? `Dealer Code:      ${provisionedCredentials.dealerCode}\n` : ''}Login URL:        ${window.location.origin}/login
===========================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Staff vs Retailer Lists
  const staffUsers = userList.filter((u) => u.role !== 'RETAILER' && u.role !== 'CUSTOMER');
  const retailerUsers = userList.filter((u) => u.role === 'RETAILER');

  // Fallback demo users for retailer tab if none exists yet
  const displayRetailers =
    retailerUsers.length > 0
      ? retailerUsers
      : [
          {
            id: 'usr-ret-demo-1',
            name: 'Apex National Distributors (Mukesh Singhal)',
            email: 'mukesh@metroretailers.in',
            role: 'RETAILER' as UserRole,
            roleTitle: 'B2B Retailer [PLATINUM Tier]',
            status: 'ACTIVE',
            companyId: 'comp-1',
            permissions: ROLE_PERMISSIONS.RETAILER,
            retailerDetails: {
              dealerCode: 'RET-IND-9021',
              tier: 'PLATINUM' as const,
              creditLimit: 500000,
              availableCredit: 385000,
              discountRate: 18.5,
              taxRegistrationNumber: 'GSTIN07AAACR9988K1ZP',
              territory: 'Northern Region & NCR',
            },
          },
          {
            id: 'usr-ret-demo-2',
            name: 'Global Tech Wholesale Hub (Rajesh Verma)',
            email: 'rajesh@globaltechwholesale.com',
            role: 'RETAILER' as UserRole,
            roleTitle: 'B2B Retailer [GOLD Tier]',
            status: 'ACTIVE',
            companyId: 'comp-1',
            permissions: ROLE_PERMISSIONS.RETAILER,
            retailerDetails: {
              dealerCode: 'RET-WES-4412',
              tier: 'GOLD' as const,
              creditLimit: 300000,
              availableCredit: 245000,
              discountRate: 14.0,
              taxRegistrationNumber: 'GSTIN27AAACG1122D1ZR',
              territory: 'Western Region & Mumbai',
            },
          },
        ];

  const filteredStaff = staffUsers.filter((u) => {
    const term = searchQuery.toLowerCase();
    const roleName = (u as any).role_name || ROLE_LABELS[u.role] || u.role || '';
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      roleName.toLowerCase().includes(term)
    );
  });

  const filteredRetailers = displayRetailers.filter((u) => {
    const term = searchQuery.toLowerCase();
    const details = u.retailerDetails;
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (details?.dealerCode || '').toLowerCase().includes(term) ||
      (details?.tier || '').toLowerCase().includes(term) ||
      (details?.territory || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'User & Retailer Governance' }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display flex items-center gap-2">
              <Users className="w-6 h-6 text-[#714b67]" />
              Staff & B2B Retailer Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision internal deal-desk staff with dynamic roles and granular permissions, and onboard certified wholesale B2B retailer partners.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleOpenRetailerModal}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm"
            >
              <Store className="w-4 h-4" />
              Provision B2B Retailer
            </Button>
            <Button
              onClick={handleOpenStaffModal}
              className="gap-1.5 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Provision Staff Member
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Internal Staff Accounts</span>
            <p className="text-2xl font-bold text-[#252733] font-mono mt-0.5">{staffUsers.length}</p>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
              Sales, Finance & Ops teams
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">B2B Retailer Partners</span>
            <p className="text-2xl font-bold text-amber-600 font-mono mt-0.5">{displayRetailers.length}</p>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
              Direct wholesale dealers
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Dynamic Roles Available</span>
            <p className="text-2xl font-bold text-[#714b67] font-mono mt-0.5">{roleList.length} ROLES</p>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              Admin configured roles
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium">Total Credit Exposure</span>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">₹8,00,000</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
              Active dealer credit lines
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/70 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'STAFF'
                ? 'bg-white text-[#714b67] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Internal Staff Directory ({staffUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('RETAILERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'RETAILERS'
                ? 'bg-white text-amber-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            B2B Retailers / Dealers ({displayRetailers.length})
          </button>
        </div>

        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder={activeTab === 'STAFF' ? 'Search staff by name, email, role...' : 'Search retailers by dealer code, tier...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* TAB 1: INTERNAL STAFF TABLE */}
      {activeTab === 'STAFF' && (
        <Card className="border-slate-200/80 bg-white shadow-subtle rounded-2xl overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Corporate Email</th>
                  <th className="py-3 px-4">Assigned Dynamic Role</th>
                  <th className="py-3 px-4">Permission Profile</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {isLoadingUsers && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading staff directory...</td>
                  </tr>
                )}
                {!isLoadingUsers && filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No staff members found.</td>
                  </tr>
                )}
                {!isLoadingUsers &&
                  filteredStaff.map((u) => {
                    const roleName = (u as any).role_name || ROLE_LABELS[u.role] || u.role || 'Staff';
                    const permCount = Array.isArray(u.permissions) && u.permissions.length > 0 
                      ? u.permissions.length 
                      : (ROLE_PERMISSIONS[u.role]?.length || 16);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-[#252733] block">{u.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {u.jobTitle || 'Executive'} • {u.department || 'Operations'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{u.email}</td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-wider border bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]">
                            {roleName}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[10px] text-slate-700 bg-slate-100 border-slate-200 font-mono">
                            {permCount} permissions
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}>
                            {u.status || 'ACTIVE'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditUserModal(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit User & Roles"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.status === 'ACTIVE'
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: B2B RETAILERS CARDS */}
      {activeTab === 'RETAILERS' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRetailers.map((u) => {
              const details = u.retailerDetails || {};
              const roleName = (u as any).role_name || u.roleTitle || 'Authorized B2B Retailer';

              return (
                <Card
                  key={u.id}
                  className="p-5 border-slate-200/80 bg-white shadow-subtle rounded-2xl space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#252733] text-sm leading-snug">{u.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">{u.email}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEditUserModal(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Retailer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Dealer Code:</span>
                      <span className="font-mono font-bold text-slate-800">{details.dealerCode || 'RET-DEFAULT'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Role:</span>
                      <span className="font-bold text-[#714b67]">{roleName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Wholesale Tier:</span>
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-amber-100 text-amber-800 border border-amber-200">
                        {details.tier || 'GOLD'} TIER ({details.discountRate || 15}% Off)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Credit Limit:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        ₹{(details.creditLimit || 500000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Territory:</span>
                      <span className="text-slate-700 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {details.territory || 'Pan India'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}>
                      {u.status || 'ACTIVE'}
                    </Badge>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {details.taxRegistrationNumber || 'GST Certified'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: PROVISION STAFF WITH DYNAMIC ROLES */}
      <Dialog
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#f5eff3] text-[#714b67] border border-[#ecdfe8]">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Provision Staff Member & Assign Dynamic Role</span>
          </div>
        }
      >
        <form onSubmit={handleCreateStaffSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input required value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="e.g. Vikram Mehta" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <Input required type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="vikram.m@enterprise.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Assigned Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStaffRoleId}
                onChange={(e) => handleStaffRoleChange(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
              >
                <optgroup label="System Standard Roles">
                  {roleList
                    .filter((r) => r.is_system_role || (r as any).is_system)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code || 'SYS'})
                      </option>
                    ))}
                </optgroup>
                {roleList.some((r) => !r.is_system_role && !(r as any).is_system) && (
                  <optgroup label="Custom Roles (Admin Defined)">
                    {roleList
                      .filter((r) => !r.is_system_role && !(r as any).is_system)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code || 'CUSTOM'})
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Job Title</label>
              <Input value={staffJobTitle} onChange={(e) => setStaffJobTitle(e.target.value)} placeholder="e.g. Senior Deal Executive" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Department</label>
              <Input value={staffDepartment} onChange={(e) => setStaffDepartment(e.target.value)} placeholder="e.g. Sales / Revenue Ops" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#714b67]" /> Generated Password:
              </label>
              <button
                type="button"
                onClick={() => setStaffPassword(generateRandomPassword())}
                className="text-[11px] text-[#714b67] font-semibold hover:underline"
              >
                Re-generate
              </button>
            </div>
            <Input value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="font-mono font-bold" required />
          </div>

          {/* Granular Permission Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-[#252733] text-xs">Granular Permissions & Scope</h4>
                <p className="text-[11px] text-slate-400">Auto-populated from selected role. Adjust checkboxes if needed.</p>
              </div>
              <span className="text-[11px] font-bold text-[#714b67] font-mono">
                {selectedPermissions.length} selected
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {PERMISSION_GROUPS.map((group) => {
                const IconComponent = group.icon;
                return (
                  <div key={group.category} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#252733] text-[11px]">
                      <IconComponent className="w-3.5 h-3.5 text-[#714b67]" />
                      {group.category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.items.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-[#f5eff3] border-[#ecdfe8] text-[#714b67]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.key)}
                              className="mt-0.5 rounded border-slate-300 accent-[#714b67]"
                            />
                            <div>
                              <span className="font-semibold block text-[11px]">{perm.label}</span>
                              <span className="text-[10px] text-slate-400 block leading-tight">{perm.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#714b67] text-white" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Provisioning...' : 'Provision Staff Account'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 2: PROVISION B2B RETAILER */}
      <Dialog
        isOpen={isRetailerModalOpen}
        onClose={() => setIsRetailerModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Onboard B2B Retailer / Dealer Partner</span>
          </div>
        }
      >
        <form onSubmit={handleCreateRetailerSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Retailer Company / Entity Name <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={retailerOrgName}
                onChange={(e) => setRetailerOrgName(e.target.value)}
                placeholder="e.g. Metro Retail Distributors"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Primary Contact Person</label>
              <Input
                value={retailerContactName}
                onChange={(e) => setRetailerContactName(e.target.value)}
                placeholder="e.g. Mukesh Singhal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Retailer Corporate Email <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                type="email"
                value={retailerEmail}
                onChange={(e) => setRetailerEmail(e.target.value)}
                placeholder="mukesh@metroretailers.in"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Dealer Code <span className="text-rose-500">*</span>
              </label>
              <Input required value={dealerCode} onChange={(e) => setDealerCode(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Assigned B2B Role</label>
              <select
                value={selectedRetailerRoleId}
                onChange={(e) => setSelectedRetailerRoleId(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
              >
                {roleList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code || 'SYS'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Wholesale Pricing Tier</label>
              <select
                value={retailerTier}
                onChange={(e) => {
                  const t = e.target.value as any;
                  setRetailerTier(t);
                  if (t === 'SILVER') setDiscountRate(10);
                  if (t === 'GOLD') setDiscountRate(15);
                  if (t === 'PLATINUM') setDiscountRate(20);
                  if (t === 'DIAMOND') setDiscountRate(25);
                }}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
              >
                <option value="SILVER">Silver Tier (10% discount)</option>
                <option value="GOLD">Gold Tier (15% discount)</option>
                <option value="PLATINUM">Platinum Tier (20% discount)</option>
                <option value="DIAMOND">Diamond Tier (25% VIP discount)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Credit Line Limit (₹)</label>
              <Input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                placeholder="500000"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Discount Margin (%)</label>
              <Input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
                placeholder="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Assigned Territory</label>
              <Input value={territory} onChange={(e) => setTerritory(e.target.value)} placeholder="e.g. Northern Region & NCR" />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">GSTIN / Tax Number</label>
              <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="e.g. GSTIN07AAACR9988K1ZP" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Generated Temporary Password:
              </label>
              <button
                type="button"
                onClick={() => setRetailerPassword(generateRandomPassword())}
                className="text-[11px] text-amber-700 font-semibold hover:underline"
              >
                Re-generate
              </button>
            </div>
            <Input value={retailerPassword} onChange={(e) => setRetailerPassword(e.target.value)} className="font-mono font-bold" required />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsRetailerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Onboarding...' : 'Onboard B2B Retailer'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 3: EDIT USER & ROLE REASSIGNMENT */}
      <Dialog
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Edit2 className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Edit User Account & Role Assignment</span>
          </div>
        }
      >
        <form onSubmit={handleEditUserSubmit} className="space-y-4 pt-2 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Full Name</label>
              <Input required value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Corporate Email</label>
              <Input required type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Assigned Role</label>
              <select
                value={editRoleId}
                onChange={(e) => {
                  setEditRoleId(e.target.value);
                  const found = roleList.find(r => r.id === e.target.value);
                  if (found) {
                    rolesApi.getRolePermissions(found.id).then(res => {
                      if (res.success && res.data) {
                        setEditPermissions(res.data.map((p: any) => p.action));
                      }
                    });
                  }
                }}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
              >
                <optgroup label="System Standard Roles">
                  {roleList
                    .filter((r) => r.is_system_role || (r as any).is_system)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code || 'SYS'})
                      </option>
                    ))}
                </optgroup>
                {roleList.some((r) => !r.is_system_role && !(r as any).is_system) && (
                  <optgroup label="Custom Roles">
                    {roleList
                      .filter((r) => !r.is_system_role && !(r as any).is_system)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code || 'CUSTOM'})
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Job Title</label>
              <Input value={editJobTitle} onChange={(e) => setEditJobTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Department</label>
              <Input value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Account Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#252733] font-medium"
            >
              <option value="ACTIVE">ACTIVE - Full Access Enabled</option>
              <option value="INACTIVE">INACTIVE - Account Suspended</option>
            </select>
          </div>

          {/* Granular Permission Checklist for Edit */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-[#252733] text-xs">Permission Profile</h4>
                <p className="text-[11px] text-slate-400">Explicit granular permissions granted to this user.</p>
              </div>
              <span className="text-[11px] font-bold text-[#714b67] font-mono">
                {editPermissions.length} active
              </span>
            </div>

            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {PERMISSION_GROUPS.map((group) => {
                const IconComponent = group.icon;
                return (
                  <div key={group.category} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#252733] text-[11px]">
                      <IconComponent className="w-3.5 h-3.5 text-[#714b67]" />
                      {group.category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.items.map((perm) => {
                        const isChecked = editPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-[#f5eff3] border-[#ecdfe8] text-[#714b67]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleEditPermission(perm.key)}
                              className="mt-0.5 rounded border-slate-300 accent-[#714b67]"
                            />
                            <div>
                              <span className="font-semibold block text-[11px]">{perm.label}</span>
                              <span className="text-[10px] text-slate-400 block leading-tight">{perm.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#714b67] text-white" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Saving Changes...' : 'Save User & Permissions'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREDENTIALS SUCCESS DIALOG */}
      <Dialog
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#252733]">Enterprise Credentials Provisioned</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2 font-sans text-xs">
          {provisionedCredentials && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 text-xs border border-slate-800">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-800">// PROVISIONED ACCESS KEY</div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Account:</span>
                <span className="text-white font-bold">{provisionedCredentials.name}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Email:</span>
                <span className="text-emerald-400">{provisionedCredentials.email}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Initial Password:</span>
                <span className="text-amber-300">{provisionedCredentials.password}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Role:</span>
                <span className="text-purple-300">{provisionedCredentials.roleTitle}</span>
              </div>
              {provisionedCredentials.dealerCode && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Dealer Code:</span>
                  <span className="text-cyan-300">{provisionedCredentials.dealerCode}</span>
                </div>
              )}
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Login URL:</span>
                <span className="text-blue-300">{window.location.origin}/login</span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCredentialsModalOpen(false)}>
              Close
            </Button>
            <Button type="button" size="sm" onClick={handleCopyCredentials} className="bg-[#714b67] text-white">
              {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AdminUsersPage;
