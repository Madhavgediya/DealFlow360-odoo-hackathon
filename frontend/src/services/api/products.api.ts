import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Product, ProductCategory } from '../../types/product';

export const productsApi = {
  getProducts: async (search?: string, categoryId?: string): Promise<ApiResponse<Product[]>> => {
    await delay(180);
    const data = mockDb.getProducts(search, categoryId);
    return formatSuccessResponse(data, { total: data.length });
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    await delay(120);
    const prod = mockDb.getProductById(id);
    if (!prod) throw new Error('Product not found');
    return formatSuccessResponse(prod);
  },

  getCategories: async (): Promise<ApiResponse<ProductCategory[]>> => {
    await delay(100);
    return formatSuccessResponse(mockDb.getCategories());
  },
};
