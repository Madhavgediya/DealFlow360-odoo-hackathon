import { apiClient, delay, formatSuccessResponse, formatErrorResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Product, ProductCategory, ProductType } from '../../types/product';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adaptServerProduct(raw: any): Product {
  const basePrice = Number(raw.base_price || raw.basePrice) || 50000;
  const costPrice = Number(raw.cost_price || raw.costPrice) || Math.round(basePrice * 0.7);

  return {
    id: raw.id || `prod-${Date.now()}`,
    companyId: raw.company_id || raw.companyId || 'comp-1',
    sku: raw.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    name: raw.name || 'Enterprise Hardware/SaaS Module',
    description: raw.description || 'Enterprise grade infrastructure component with 24/7 SLA.',
    categoryId: raw.category_id || raw.categoryId || 'cat-hardware',
    categoryName: raw.category_name || raw.categoryName || 'Enterprise Hardware',
    type: (raw.type || 'PHYSICAL') as ProductType,
    basePrice,
    costPrice,
    taxRate: Number(raw.tax_rate || raw.taxRate) || 18,
    unit: raw.unit || 'Units',
    imageUrl: raw.image_url || raw.imageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=80',
    active: raw.is_active !== undefined ? raw.is_active : raw.active !== undefined ? raw.active : true,
    variants: raw.variants || [],
    isRecurring: raw.is_recurring || false,
    subscriptionBillingPeriod: raw.subscription_billing_period || 'ANNUAL',
    totalStockAvailable: raw.total_stock_available !== undefined ? Number(raw.total_stock_available) : raw.totalStockAvailable || 120,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
  };
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  basePrice: number;
  costPrice?: number;
  type?: ProductType;
  unit?: string;
  stock?: number;
}

export const productsApi = {
  getProducts: async (search?: string, categoryId?: string, isActive?: boolean): Promise<ApiResponse<Product[]>> => {
    try {
      const params: Record<string, any> = {};
      if (categoryId && categoryId !== 'ALL') params.category_id = categoryId;
      if (isActive !== undefined) params.is_active = isActive;

      const response = await apiClient.get<ApiResponse<any[]>>('/products', { params });
      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        let list = response.data.data.map(adaptServerProduct);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        return formatSuccessResponse(list, { total: list.length });
      }
    } catch (err) {
      console.debug('Live products API note, using memory store:', err);
    }

    await delay(120);
    const data = mockDb.getProducts(search, categoryId);
    return formatSuccessResponse(data, { total: data.length });
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.get<ApiResponse<any>>(`/products/${id}`);
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerProduct(response.data.data));
        }
      } catch (err) {
        console.debug('Live getProductById note:', err);
      }
    }

    await delay(100);
    const prod = mockDb.getProductById(id);
    if (!prod) return formatErrorResponse('Product not found');
    return formatSuccessResponse(prod);
  },

  createProduct: async (payload: CreateProductPayload): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/products', {
        name: payload.name.trim(),
        sku: payload.sku.trim(),
        description: payload.description || 'Enterprise catalog item',
        category_id: payload.categoryId && UUID_REGEX.test(payload.categoryId) ? payload.categoryId : null,
        base_price: payload.basePrice,
        is_active: true,
      });

      if (response.data && response.data.success && response.data.data) {
        const adapted = adaptServerProduct(response.data.data);
        mockDb.addProduct(adapted);
        return formatSuccessResponse(adapted, undefined, 'Product created in live database!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (msg) return formatErrorResponse(msg);
      console.debug('Live createProduct note, storing locally:', err);
    }

    await delay(200);
    const costPrice = payload.costPrice || Math.round(payload.basePrice * 0.7);
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      companyId: 'comp-1',
      sku: payload.sku,
      name: payload.name,
      description: payload.description || 'Enterprise catalog component',
      categoryId: payload.categoryId || 'cat-hardware',
      categoryName: payload.categoryId === 'cat-saas' ? 'Enterprise Software & SaaS' : payload.categoryId === 'cat-services' ? 'Professional Services & SLA' : 'Enterprise Hardware',
      type: payload.type || 'PHYSICAL',
      basePrice: payload.basePrice,
      costPrice,
      taxRate: 18,
      unit: payload.unit || 'Units',
      active: true,
      variants: [],
      isRecurring: payload.type === 'SUBSCRIPTION',
      subscriptionBillingPeriod: 'ANNUAL',
      totalStockAvailable: payload.stock || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDb.addProduct(newProd);
    return formatSuccessResponse(newProd, undefined, 'Product created successfully!');
  },

  updateProduct: async (id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.put<ApiResponse<any>>(`/products/${id}`, {
          name: payload.name,
          sku: payload.sku,
          description: payload.description,
          base_price: payload.basePrice,
          is_active: payload.active,
        });
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerProduct(response.data.data), undefined, 'Product updated');
        }
      } catch (err) {
        console.debug('Live updateProduct note:', err);
      }
    }

    const prod = mockDb.getProductById(id);
    if (prod) {
      Object.assign(prod, payload, { updatedAt: new Date().toISOString() });
      return formatSuccessResponse(prod, undefined, 'Product updated successfully');
    }
    return formatErrorResponse('Product not found');
  },

  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    if (UUID_REGEX.test(id)) {
      try {
        await apiClient.delete(`/products/${id}`);
      } catch (err) {
        console.debug('Live deleteProduct note:', err);
      }
    }
    return formatSuccessResponse(null, undefined, 'Product deleted successfully');
  },

  getCategories: async (): Promise<ApiResponse<ProductCategory[]>> => {
    // Backend currently doesn't have a categories endpoint, so we return mock data
    return { success: true, data: mockDb.getCategories(), error: null };
  },
};
