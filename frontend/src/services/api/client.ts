import axios from 'axios';
import { ApiResponse } from '../../types/api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


import { useAuthStore } from '../../stores/auth.store';

// Intercept requests to attach trace ID, authorization token, and company/user context
apiClient.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Attach JWT token from localStorage if available
  const token = localStorage.getItem('dealflow360_jwt');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const authState = useAuthStore.getState();
    const companyId = authState.company?.id;
    const user = authState.user;

    if (companyId) {
      config.headers['x-company-id'] = companyId;
    }
    if (user?.role && !config.headers['x-user-role']) {
      config.headers['x-user-role'] = user.role;
    }
    if (user?.id && !config.headers['x-user-id']) {
      config.headers['x-user-id'] = user.id;
    }
  } catch (e) {
    // Ignore errors during store access
  }
  
  return config;
});

// Helper for simulating realistic API latency in demo/mock mode
export const delay = (ms: number = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export function formatSuccessResponse<T>(data: T, meta?: any, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    message: message || null,
    error: null,
  };
}

export function formatErrorResponse<T = any>(errorMsg: string): ApiResponse<T> {
  return {
    success: false,
    data: null,
    message: null,
    error: errorMsg,
  };
}

