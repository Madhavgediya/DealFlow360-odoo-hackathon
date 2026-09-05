export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  message?: string | null;
  error?: string | null;
}

export interface PaginatedQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Company {
  id: string;
  name: string;
  code: string;
  currency: CurrencyCode;
  logoUrl?: string;
  taxId: string;
  country: string;
}
