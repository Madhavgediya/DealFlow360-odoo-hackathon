import { apiClient, delay, formatSuccessResponse, formatErrorResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Product, ProductCategory, ProductType } from '../../types/product';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adaptServerProduct(raw: any): Product {
  const basePrice = Number(raw.base_price || raw.basePrice) || 50000;
  const costPrice = Number(raw.cost_price || raw.costPrice) || Math.round(basePrice * 0.7);
  const type = (raw.type || 'PHYSICAL') as ProductType;

  // Derive intelligent category and image based on product properties
  let categoryName = raw.category_name || raw.categoryName;
  let imageUrl = raw.image_url || raw.imageUrl;

  if (!categoryName) {
    if (type === 'SERVICE') {
      categoryName = 'Professional Services & SLA';
    } else if (type === 'SUBSCRIPTION') {
      categoryName = 'SaaS Platform Subscriptions';
    } else if (raw.name?.toLowerCase().includes('server')) {
      categoryName = 'Cloud & Compute Servers';
    } else if (raw.name?.toLowerCase().includes('switch') || raw.name?.toLowerCase().includes('router')) {
      categoryName = 'Network Switches & Routers';
    } else if (raw.name?.toLowerCase().includes('firewall') || raw.name?.toLowerCase().includes('shield')) {
      categoryName = 'Cybersecurity Appliances';
    } else if (raw.name?.toLowerCase().includes('san') || raw.name?.toLowerCase().includes('storage')) {
      categoryName = 'Enterprise Storage Arrays (SAN/NAS)';
    } else if (raw.name?.toLowerCase().includes('ai') || raw.name?.toLowerCase().includes('h100') || raw.name?.toLowerCase().includes('gpu')) {
      categoryName = 'AI & GPU Compute Nodes';
    } else if (raw.name?.toLowerCase().includes('ups') || raw.name?.toLowerCase().includes('power')) {
      categoryName = 'Power & Datacenter UPS';
    } else if (raw.name?.toLowerCase().includes('database') || raw.name?.toLowerCase().includes('appliance')) {
      categoryName = 'Database Appliances';
    } else {
      categoryName = 'Enterprise Hardware';
    }
  }

  if (!imageUrl) {
    if (type === 'SERVICE') {
      imageUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
    } else if (type === 'SUBSCRIPTION') {
      imageUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400';
    } else if (raw.name?.toLowerCase().includes('server')) {
      imageUrl = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400';
    } else if (raw.name?.toLowerCase().includes('switch')) {
      imageUrl = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400';
    } else if (raw.name?.toLowerCase().includes('firewall')) {
      imageUrl = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400';
    } else if (raw.name?.toLowerCase().includes('storage') || raw.name?.toLowerCase().includes('san')) {
      imageUrl = 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=400';
    } else if (raw.name?.toLowerCase().includes('ai')) {
      imageUrl = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400';
    } else if (raw.name?.toLowerCase().includes('ups')) {
      imageUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400';
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400';
    }
  }

  return {
    id: raw.id || `prod-${Date.now()}`,
    companyId: raw.company_id || raw.companyId || 'comp-1',
    sku: raw.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    name: raw.name || 'Enterprise Hardware/SaaS Module',
    description: raw.description || 'Enterprise grade infrastructure component with 24/7 SLA.',
    categoryId: raw.category_id || raw.categoryId || (type === 'SERVICE' ? 'cat-services' : type === 'SUBSCRIPTION' ? 'cat-saas' : 'cat-hardware'),
    categoryName,
    type,
    basePrice,
    costPrice,
    taxRate: Number(raw.tax_rate || raw.taxRate) || 18,
    unit: raw.unit || 'Units',
    imageUrl,
    active: raw.is_active !== undefined ? raw.is_active : raw.active !== undefined ? raw.active : true,
    variants: raw.variants || [],
    isRecurring: raw.is_recurring !== undefined ? raw.is_recurring : type === 'SUBSCRIPTION',
    subscriptionBillingPeriod: raw.subscription_billing_period || 'ANNUAL',
    preferredVendorId: raw.preferred_vendor_id || raw.preferredVendorId || undefined,
    serviceProviderName: raw.service_provider || raw.serviceProviderName || undefined,
    serviceSla: raw.service_sla || raw.serviceSla || undefined,
    totalStockAvailable: raw.stock !== undefined ? Number(raw.stock) : raw.total_stock_available !== undefined ? Number(raw.total_stock_available) : raw.totalStockAvailable !== undefined ? raw.totalStockAvailable : 100,
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
  preferredVendorId?: string;
  serviceProviderName?: string;
  serviceSla?: string;
  imageUrl?: string;
  active?: boolean;
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
    const costPrice = payload.costPrice !== undefined ? payload.costPrice : Math.round(payload.basePrice * 0.7);
    try {
      const response = await apiClient.post<ApiResponse<any>>('/products', {
        name: payload.name.trim(),
        sku: payload.sku.trim(),
        description: payload.description || 'Enterprise catalog item',
        category_id: payload.categoryId && UUID_REGEX.test(payload.categoryId) ? payload.categoryId : null,
        base_price: payload.basePrice,
        cost_price: costPrice,
        type: payload.type || 'PHYSICAL',
        preferred_vendor_id: payload.preferredVendorId || null,
        service_provider: payload.serviceProviderName || null,
        service_sla: payload.serviceSla || null,
        stock: payload.stock !== undefined ? payload.stock : 100,
        unit: payload.unit || 'Units',
        image_url: payload.imageUrl || null,
        is_active: payload.active !== undefined ? payload.active : true,
      });

      if (response.data && response.data.success && response.data.data) {
        const adapted = adaptServerProduct(response.data.data);
        mockDb.addProduct(adapted);
        return formatSuccessResponse(adapted, undefined, 'Product created in catalog!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (msg) return formatErrorResponse(msg);
      console.debug('Live createProduct note, storing locally:', err);
    }

    await delay(150);
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
      imageUrl: payload.imageUrl || undefined,
      active: payload.active !== undefined ? payload.active : true,
      variants: [],
      isRecurring: payload.type === 'SUBSCRIPTION',
      subscriptionBillingPeriod: 'ANNUAL',
      preferredVendorId: payload.preferredVendorId,
      serviceProviderName: payload.serviceProviderName,
      serviceSla: payload.serviceSla,
      totalStockAvailable: payload.stock !== undefined ? payload.stock : 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDb.addProduct(newProd);
    return formatSuccessResponse(newProd, undefined, 'Product created successfully!');
  },

  updateProduct: async (id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const serverPayload: Record<string, any> = {};
        if (payload.name !== undefined) serverPayload.name = payload.name;
        if (payload.sku !== undefined) serverPayload.sku = payload.sku;
        if (payload.description !== undefined) serverPayload.description = payload.description;
        if (payload.basePrice !== undefined) serverPayload.base_price = payload.basePrice;
        if (payload.costPrice !== undefined) serverPayload.cost_price = payload.costPrice;
        if (payload.type !== undefined) serverPayload.type = payload.type;
        if (payload.preferredVendorId !== undefined) serverPayload.preferred_vendor_id = payload.preferredVendorId;
        if (payload.serviceProviderName !== undefined) serverPayload.service_provider = payload.serviceProviderName;
        if (payload.serviceSla !== undefined) serverPayload.service_sla = payload.serviceSla;
        if (payload.totalStockAvailable !== undefined) serverPayload.stock = payload.totalStockAvailable;
        if (payload.unit !== undefined) serverPayload.unit = payload.unit;
        if (payload.imageUrl !== undefined) serverPayload.image_url = payload.imageUrl;
        if (payload.active !== undefined) serverPayload.is_active = payload.active;
        if (payload.categoryId && UUID_REGEX.test(payload.categoryId)) serverPayload.category_id = payload.categoryId;

        const response = await apiClient.put<ApiResponse<any>>(`/products/${id}`, serverPayload);
        if (response.data && response.data.success && response.data.data) {
          const adapted = adaptServerProduct(response.data.data);
          mockDb.updateProduct(id, adapted);
          return formatSuccessResponse(adapted, undefined, 'Product updated in catalog');
        }
      } catch (err) {
        console.debug('Live updateProduct note:', err);
      }
    }

    const updated = mockDb.updateProduct(id, payload);
    if (updated) {
      return formatSuccessResponse(updated, undefined, 'Product updated successfully');
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
    mockDb.deleteProduct(id);
    return formatSuccessResponse(null, undefined, 'Product deleted successfully');
  },

  getCategories: async (): Promise<ApiResponse<ProductCategory[]>> => {
    // Backend currently doesn't have a categories endpoint, so we return mock data
    return { success: true, data: mockDb.getCategories(), error: null };
  },
};
