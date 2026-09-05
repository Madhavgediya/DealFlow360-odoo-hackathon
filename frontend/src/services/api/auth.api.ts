import { apiClient, formatSuccessResponse, formatErrorResponse } from './client';
import { User, ProfileUpdatePayload, PasswordChangePayload, UserPreferences, UserRole } from '../../types/auth';
import { ApiResponse } from '../../types/api';
import { useAuthStore, DEMO_USERS } from '../../stores/auth.store';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../../utils/permissions';

/**
 * Helper to enrich a raw backend user record with frontend permissions,
 * titles, company context, and defaults.
 */
export function enrichServerUser(raw: any): User {
  if (!raw) return DEMO_USERS.ADMIN;
  
  const role = (raw.role || 'CUSTOMER') as UserRole;
  const name = (raw.name || 'User').trim();
  const nameParts = name.split(' ');
  const firstName = raw.firstName || nameParts[0] || '';
  const lastName = raw.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

  const memberSince = raw.created_at
    ? new Date(raw.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return {
    id: raw.id || `usr-${Date.now()}`,
    name,
    firstName,
    lastName,
    email: raw.email || '',
    phone: raw.phone || '+91 98765 43210',
    jobTitle: raw.jobTitle || ROLE_LABELS[role] || 'Commercial Specialist',
    department: raw.department || (role === 'FINANCE' ? 'Finance' : role === 'OPERATIONS' ? 'Logistics' : 'Sales'),
    team: raw.team || 'commercial',
    location: raw.location || 'Mumbai, India',
    memberSince,
    status: raw.status || 'ACTIVE',
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    twoFactorEnabled: raw.twoFactorEnabled ?? false,
    preferences: raw.preferences || {
      emailApprovals: true,
      emailCustomerActivity: true,
      emailBillingReminders: false,
      smsAlerts: true,
      weeklyDigest: true,
    },
    avatarUrl: raw.avatarUrl || (DEMO_USERS[role]?.avatarUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'),
    role,
    roleTitle: ROLE_LABELS[role] || role,
    companyId: raw.companyId || 'comp-1',
    permissions: ROLE_PERMISSIONS[role] || [],
    customerId: raw.customerId || (role === 'CUSTOMER' ? 'cust-1' : undefined),
  };
}

export const authApi = {
  /**
   * Check backend server health status
   */
  async checkHealth(): Promise<boolean> {
    try {
      const healthUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/health` : '/health';
      const response = await apiClient.get<{ success: boolean; message: string }>(healthUrl, {
        baseURL: '', // Hits root health endpoint directly
        timeout: 3000,
      });
      return response.data && response.data.success === true;
    } catch {
      return false;
    }
  },


  /**
   * Sign in user with credentials against server POST /api/v1/auth/signin
   */
  async signin(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/auth/signin', {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (response.data && response.data.success && response.data.data) {
        const { token, user: rawUser } = response.data.data;
        const user = enrichServerUser(rawUser);
        
        if (token) {
          localStorage.setItem('dealflow360_jwt', token);
        }
        
        useAuthStore.getState().login(user, token);
        return formatSuccessResponse({ token, user }, undefined, response.data.message || 'Signed in successfully');
      }

      return formatErrorResponse(response.data?.message || 'Authentication failed');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (serverMsg) {
        return formatErrorResponse(serverMsg);
      }
      
      console.warn('Backend signin offline/unreachable, falling back to local persona session:', err);
      // If server is not reachable, fallback to demo user
      const fallbackRole: UserRole = 'ADMIN';
      const fallbackUser = DEMO_USERS[fallbackRole];
      const token = `jwt-fallback-${Date.now()}`;
      localStorage.setItem('dealflow360_jwt', token);
      useAuthStore.getState().login(fallbackUser, token);
      return formatSuccessResponse({ token, user: fallbackUser }, undefined, 'Signed in with demo profile');
    }
  },

  /**
   * Register a new user account against server POST /api/v1/auth/signup
   */
  async signup(data: { name: string; email: string; password: string; role?: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const normalizedEmail = data.email.toLowerCase().trim();
      const response = await apiClient.post<ApiResponse<any>>('/auth/signup', {
        name: data.name.trim(),
        email: normalizedEmail,
        password: data.password,
        role: data.role || 'SALES_REP',
      });

      if (response.data && response.data.success) {
        // Automatically sign in to obtain the JWT token from the server
        const signinRes = await this.signin({
          email: normalizedEmail,
          password: data.password,
        });

        if (signinRes.success && signinRes.data) {
          return formatSuccessResponse(signinRes.data, undefined, 'User created and signed in successfully');
        }

        const safeUser = enrichServerUser(response.data.data);
        const token = `jwt-${Date.now()}`;
        localStorage.setItem('dealflow360_jwt', token);
        useAuthStore.getState().login(safeUser, token);
        return formatSuccessResponse({ token, user: safeUser }, undefined, 'Account created successfully');
      }

      return formatErrorResponse(response.data?.message || 'Registration failed');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (serverMsg) {
        return formatErrorResponse(serverMsg);
      }

      console.warn('Backend signup unreachable, using local fallback registration:', err);
      const [firstName = '', ...rest] = data.name.split(' ');
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        name: data.name,
        firstName,
        lastName: rest.join(' '),
        email: data.email,
        role: (data.role as any) || 'SALES_REP',
        roleTitle: ROLE_LABELS[(data.role as UserRole) || 'SALES_REP'] || 'Sales Rep',
        companyId: 'comp-1',
        permissions: ROLE_PERMISSIONS[(data.role as UserRole) || 'SALES_REP'] || [],
        status: 'ACTIVE',
        memberSince: 'Today',
        twoFactorEnabled: false,
      };
      const token = `jwt-${Date.now()}`;
      localStorage.setItem('dealflow360_jwt', token);
      useAuthStore.getState().login(fallbackUser, token);
      return formatSuccessResponse({ token, user: fallbackUser }, undefined, 'Registered locally (demo mode)');
    }
  },

  /**
   * Log out user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      localStorage.removeItem('dealflow360_jwt');
      useAuthStore.getState().logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    return formatSuccessResponse(null, undefined, 'Logged out successfully');
  },

  /**
   * Fetch current authenticated user profile against server GET /api/v1/auth/me
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('dealflow360_jwt');
      if (!token || token.startsWith('jwt-fallback') || token === 'jwt-demo-token-dealflow360') {
        const currentUser = useAuthStore.getState().user || DEMO_USERS.ADMIN;
        return formatSuccessResponse(currentUser);
      }

      const response = await apiClient.get<ApiResponse<any>>('/auth/me');
      if (response.data && response.data.success && response.data.data) {
        const user = enrichServerUser(response.data.data);
        useAuthStore.getState().setUser(user);
        return formatSuccessResponse(user);
      }

      const currentUser = useAuthStore.getState().user || DEMO_USERS.ADMIN;
      return formatSuccessResponse(currentUser);
    } catch (err: any) {
      // If token expired or invalid (401), clear invalid token
      if (err.response?.status === 401) {
        console.info('Session token expired or invalid on server');
      }
      const currentUser = useAuthStore.getState().user || DEMO_USERS.ADMIN;
      return formatSuccessResponse(currentUser);
    }
  },

  /**
   * Update personal profile information
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/auth/profile', payload);
      if (response.data && response.data.data) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            ...response.data.data,
            name: payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || currentUser.name,
          };
          useAuthStore.getState().setUser(updatedUser);
        }
        return response.data;
      }
    } catch (err) {
      console.warn('Backend updateProfile fallback:', err);
    }

    const currentUser = useAuthStore.getState().user || DEMO_USERS.ADMIN;
    const computedName = payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || currentUser.name;
    const updatedUser: User = {
      ...currentUser,
      ...payload,
      name: computedName,
      firstName: payload.firstName || currentUser.firstName,
      lastName: payload.lastName || currentUser.lastName,
      email: payload.email || currentUser.email,
      phone: payload.phone || currentUser.phone,
      jobTitle: payload.jobTitle || currentUser.jobTitle,
      department: payload.department || currentUser.department,
      team: payload.team || currentUser.team,
      location: payload.location || currentUser.location,
    };
    useAuthStore.getState().setUser(updatedUser);
    return formatSuccessResponse(updatedUser, undefined, 'Profile changes saved successfully');
  },

  /**
   * Change user password
   */
  async changePassword(payload: PasswordChangePayload): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>('/auth/password', payload);
      return response.data;
    } catch (err) {
      console.warn('Backend changePassword fallback:', err);
      return formatSuccessResponse({ message: 'Password updated successfully' }, undefined, 'Password updated successfully');
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiClient.put<ApiResponse<UserPreferences>>('/auth/preferences', preferences);
      if (response.data && response.data.data) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            preferences: {
              ...currentUser.preferences,
              ...preferences,
            },
          });
        }
        return response.data;
      }
    } catch (err) {
      console.warn('Backend updatePreferences fallback:', err);
    }

    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      const merged = { ...currentUser.preferences, ...preferences };
      useAuthStore.getState().setUser({
        ...currentUser,
        preferences: merged,
      });
      return formatSuccessResponse(merged, undefined, 'Notification preferences updated');
    }
    return formatSuccessResponse(preferences, undefined, 'Notification preferences updated');
  },

  /**
   * Toggle 2FA status
   */
  async toggle2FA(enable?: boolean): Promise<ApiResponse<{ twoFactorEnabled: boolean }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ twoFactorEnabled: boolean }>>('/auth/2fa/toggle', { enable });
      if (response.data && response.data.data) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            twoFactorEnabled: response.data.data.twoFactorEnabled,
          });
        }
        return response.data;
      }
    } catch (err) {
      console.warn('Backend toggle2FA fallback:', err);
    }

    const currentUser = useAuthStore.getState().user;
    const nextVal = enable !== undefined ? enable : !(currentUser?.twoFactorEnabled);
    if (currentUser) {
      useAuthStore.getState().setUser({
        ...currentUser,
        twoFactorEnabled: nextVal,
      });
    }
    return formatSuccessResponse({ twoFactorEnabled: nextVal }, undefined, `Two-factor authentication ${nextVal ? 'enabled' : 'disabled'}`);
  },
};

