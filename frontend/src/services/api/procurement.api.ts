import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { PurchaseOrder } from '../../types/procurement';

export const procurementApi = {
  getPurchaseOrders: async (): Promise<ApiResponse<PurchaseOrder[]>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getPurchaseOrders());
  },

  getPurchaseOrderById: async (id: string): Promise<ApiResponse<PurchaseOrder>> => {
    await delay(150);
    const po = mockDb.getPurchaseOrderById(id);
    if (!po) throw new Error('Purchase order not found');
    return formatSuccessResponse(po);
  },

  createPurchaseOrder: async (payload: {
    vendorId: string;
    linkedQuoteId?: string;
    targetWarehouseId: string;
    items: { productId: string; quantity: number }[];
  }): Promise<ApiResponse<PurchaseOrder>> => {
    await delay(350);
    const po = mockDb.createPurchaseOrder(payload);
    return formatSuccessResponse(po, undefined, 'Purchase order generated and dispatched to vendor.');
  },
};
