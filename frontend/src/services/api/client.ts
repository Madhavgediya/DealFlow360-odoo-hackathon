import axios from 'axios';
import { ApiResponse } from '../../types/api';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach Company & JWT tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dealflow360_jwt') || 'demo-jwt-token';
  const companyId = localStorage.getItem('dealflow360_company_id') || 'comp-1';
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Company-ID'] = companyId;
  config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
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

export function formatErrorResponse(errorMsg: string): ApiResponse<null> {
  return {
    success: false,
    data: null,
    message: null,
    error: errorMsg,
  };
}
