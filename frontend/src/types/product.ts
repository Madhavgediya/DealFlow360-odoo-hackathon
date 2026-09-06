export type ProductType = 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION';

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  maxDiscountLimit: number; // e.g. 10 means 10% max without approval
  minMarginThreshold: number; // e.g. 18 means 18% min margin
  description?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  priceAdjustment: number;
}

export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  type: ProductType;
  basePrice: number;
  costPrice: number; // Sensitive: only visible with 'cost.view' permission
  taxRate: number; // e.g. 18 for 18% GST/VAT
  unit: string;
  imageUrl?: string;
  active: boolean;
  variants: ProductVariant[];
  isRecurring: boolean;
  subscriptionBillingPeriod?: 'MONTHLY' | 'ANNUAL';
  upsellProductIds?: string[];
  preferredVendorId?: string;
  serviceProviderName?: string;
  serviceSla?: string;
  totalStockAvailable?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceListItem {
  productId: string;
  customPrice: number;
  discountAllowed: number;
}

export interface PriceList {
  id: string;
  companyId: string;
  name: string;
  currency: string;
  isDefault: boolean;
  items: PriceListItem[];
}
