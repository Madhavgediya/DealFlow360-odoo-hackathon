export interface VendorProduct {
  productId: string;
  productName: string;
  productSku: string;
  vendorSku: string;
  unitCost: number; // Internal only
  leadTimeDays: number;
  minOrderQuantity: number;
  availability: 'IN_STOCK' | 'LOW_STOCK' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  code: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number; // 1-5
  leadTimeAvgDays: number;
  availabilityScore: number; // 0-100
  qualityScore: number; // 0-100
  reliabilityScore: number; // 0-100
  overallScore: number; // 0-100
  status: 'PREFERRED' | 'APPROVED' | 'PROBATION' | 'INACTIVE';
  paymentTerms: string;
  products: VendorProduct[];
  activePoCount: number;
  createdAt: string;
}

export interface VendorComparisonResult {
  productId: string;
  productName: string;
  requiredQuantity: number;
  vendors: {
    vendorId: string;
    vendorName: string;
    unitPrice: number;
    totalCost: number;
    leadTimeDays: number;
    availability: string;
    reliabilityScore: number;
    overallScore: number;
    isRecommended: boolean;
    recommendationReason?: string;
  }[];
  recommendedVendorId: string;
}
