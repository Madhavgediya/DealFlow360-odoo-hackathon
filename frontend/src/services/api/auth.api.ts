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
  async signin(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/auth/signin', {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (response.data && response.data.success && response.data.data) {
        const { user: rawUser } = response.data.data;
        const user = enrichServerUser(rawUser);
        
        useAuthStore.getState().login(user);
        return formatSuccessResponse({ user }, undefined, response.data.message || 'Signed in successfully');
      }

      return formatErrorResponse(response.data?.message || 'Authentication failed');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      return formatErrorResponse(serverMsg || 'Network Error: Unable to connect to server');
    }
  },

  /**
   * Master Impersonation endpoint against POST /api/v1/auth/impersonate
   */
  async impersonate(payload: { targetUserId?: string; email?: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/auth/impersonate', payload);
      if (response.data && response.data.success && response.data.data) {
        const { token, user: rawUser } = response.data.data;
        const user = enrichServerUser(rawUser);
        if (token) {
          localStorage.setItem('dealflow360_jwt', token);
        }
        useAuthStore.getState().login(user, token);
        return formatSuccessResponse({ token, user }, undefined, response.data.message || 'Impersonated successfully');
      }
    } catch (err: any) {
      console.warn('Backend impersonation fallback:', err);
    }

    // Fallback local matching
    const cleanEmail = (payload.email || payload.targetUserId || 'jordan.davis@quoteflow.example').toLowerCase().trim();
    const matchedRole = (Object.keys(DEMO_USERS) as UserRole[]).find(
      (r) => DEMO_USERS[r].email.toLowerCase() === cleanEmail || DEMO_USERS[r].id === payload.targetUserId
    );
    const user: User = (matchedRole && DEMO_USERS[matchedRole]) ? DEMO_USERS[matchedRole] : {
      ...DEMO_USERS.ADMIN,
      id: payload.targetUserId || `usr-master-${Date.now()}`,
      name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      email: cleanEmail,
    };
    useAuthStore.getState().login(user, 'impersonate-token');
    return formatSuccessResponse({ token: 'impersonate-token', user }, undefined, 'Impersonation active');
  },

  /**
   * Register a new user account against server POST /api/v1/auth/signup
   */
  async signup(data: { name: string; email: string; password: string; role?: string }): Promise<ApiResponse<{ user: User }>> {
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

        return formatErrorResponse('Signup succeeded but auto-signin failed.');
      }

      return formatErrorResponse(response.data?.message || 'Registration failed');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      return formatErrorResponse(serverMsg || 'Network Error: Unable to connect to server');
    }
  },

  /**
   * Log out user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      await apiClient.post('/auth/logout');
      useAuthStore.getState().logout();
    } catch (err) {
      console.warn('Logout error:', err);
      // Still log out locally even if API fails
      useAuthStore.getState().logout();
    }
    return formatSuccessResponse(null, undefined, 'Logged out successfully');
  },

  /**
   * Fetch current authenticated user profile against server GET /api/v1/auth/me
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/auth/me');
      if (response.data && response.data.success && response.data.data) {
        const user = enrichServerUser(response.data.data);
        useAuthStore.getState().login(user);
        return formatSuccessResponse(user);
      }

      useAuthStore.getState().logout();
      return formatErrorResponse('Failed to fetch profile');
    } catch (err: any) {
      useAuthStore.getState().logout();
      if (err.response?.status === 401) {
        return formatErrorResponse('Session expired');
      }
      return formatErrorResponse('Network Error: Unable to connect to server');
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
      return formatErrorResponse('Profile update failed');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      return formatErrorResponse(serverMsg || 'Network Error: Unable to connect to server');
    }
  },

  /**
   * Change user password
   */
  async changePassword(payload: PasswordChangePayload): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>('/auth/password', payload);
      return response.data;
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      return formatErrorResponse(serverMsg || 'Network Error: Unable to connect to server');
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
      return formatErrorResponse('Preferences update failed');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      return formatErrorResponse(serverMsg || 'Network Error: Unable to connect to server');
    }
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
      return formatErrorResponse('2FA toggle failed');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      return formatErrorResponse(serverMsg || 'Network Error: Unable to connect to server');
    }
  },
};

