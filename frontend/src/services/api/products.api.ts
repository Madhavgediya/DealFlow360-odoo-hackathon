import { apiClient } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Product, ProductCategory } from '../../types/product';

export const productsApi = {
  getProducts: async (search?: string, categoryId?: string): Promise<ApiResponse<Product[]>> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId) params.append('category_id', categoryId);
      
      const res = await apiClient.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch products' };
    }
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    try {
      const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch product' };
    }
  },

  getCategories: async (): Promise<ApiResponse<ProductCategory[]>> => {
    // Backend currently doesn't have a categories endpoint, so we return mock data
    return { success: true, data: mockDb.getCategories(), error: null };
  },
};
