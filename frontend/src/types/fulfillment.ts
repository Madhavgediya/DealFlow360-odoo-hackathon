export type FulfillmentStatus = 'PLANNED' | 'ALLOCATED' | 'PO_TRIGGERED' | 'PICKING' | 'READY_TO_SHIP' | 'COMPLETED';

export interface FulfillmentPlanItem {
  productId: string;
  productName: string;
  requiredQuantity: number;
  warehouseAllocations: {
    warehouseId: string;
    warehouseName: string;
    quantity: number;
  }[];
  vendorAllocations: {
    vendorId: string;
    vendorName: string;
    poId?: string;
    quantity: number;
  }[];
  isComplete: boolean;
}

export interface FulfillmentPlan {
  id: string;
  companyId: string;
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  status: FulfillmentStatus;
  items: FulfillmentPlanItem[];
  expectedFulfillmentDate: string;
  deliveryRiskScore: number; // 0-100
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
