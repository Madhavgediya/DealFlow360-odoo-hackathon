export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  code: string;
  location: string;
  state: string;
  managerName: string;
  totalCapacityUnits: number;
  utilizedCapacityUnits: number;
  activeStockItems: number;
}

export interface StockItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  productSku: string;
  categoryName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number; // onHand - reserved
  quantityIncoming: number;
  reorderPoint: number;
  lastUpdated: string;
}

export interface StockReservation {
  id: string;
  quoteId: string;
  quoteNumber: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  quantityReserved: number;
  status: 'ACTIVE' | 'FULFILLED' | 'RELEASED';
  expiresAt: string;
  createdAt: string;
}

export interface WarehouseAllocationItem {
  productId: string;
  productName: string;
  requiredQuantity: number;
  allocations: {
    warehouseId: string;
    warehouseName: string;
    availableStock: number;
    allocatedQuantity: number;
  }[];
  totalAllocated: number;
  shortageQuantity: number;
}
