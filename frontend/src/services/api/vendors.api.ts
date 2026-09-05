import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Vendor, VendorComparisonResult } from '../../types/vendor';

export const vendorsApi = {
  getVendors: async (): Promise<ApiResponse<Vendor[]>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getVendors());
  },

  getVendorById: async (id: string): Promise<ApiResponse<Vendor>> => {
    await delay(150);
    const vendor = mockDb.getVendorById(id);
    if (!vendor) throw new Error('Vendor not found');
    return formatSuccessResponse(vendor);
  },

  compareVendors: async (productId: string, requiredQuantity?: number): Promise<ApiResponse<VendorComparisonResult>> => {
    await delay(250);
    const result = mockDb.compareVendorsForProduct(productId, requiredQuantity);
    return formatSuccessResponse(result);
  },
};
