export type ShipmentStatus =
  | 'ORDER_CONFIRMED'
  | 'PACKED'
  | 'PICKUP_SCHEDULED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'RETURNED';

export interface ShipmentTrackingEvent {
  status: ShipmentStatus;
  location: string;
  timestamp: string;
  description: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  companyId: string;
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  carrierProvider: 'SHIPROCKET' | 'BLUEDART' | 'DELHIVERY' | 'FEDEX' | 'INTERNAL_FLEET';
  trackingNumber: string;
  status: ShipmentStatus;
  originWarehouse: string;
  destinationAddress: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  packageCount: number;
  totalWeightKg: number;
  trackingHistory: ShipmentTrackingEvent[];
  carrierRate: number;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}
