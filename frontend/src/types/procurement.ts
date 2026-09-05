export type PoStatus = 'DRAFT' | 'CONFIRMED' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  companyId: string;
  vendorId: string;
  vendorName: string;
  linkedQuoteId?: string;
  linkedQuoteNumber?: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  status: PoStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  timeline: {
    status: PoStatus;
    updatedAt: string;
    note: string;
    updatedBy: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
